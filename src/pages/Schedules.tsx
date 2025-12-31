import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { AlarmClock, Trash2, Plus, CalendarClock, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import cronstrue from 'cronstrue';

export default function Schedules() {
    const { selectedProject } = useProject();
    const [schedules, setSchedules] = useState<any[]>([]);
    const [scripts, setScripts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [open, setOpen] = useState(false);
    const [selectedScript, setSelectedScript] = useState("");
    const [frequency, setFrequency] = useState("daily");
    const [customCron, setCustomCron] = useState("* * * * *");

    useEffect(() => {
        fetchSchedules();
        if (selectedProject) fetchScripts();
    }, [selectedProject]);

    const fetchSchedules = async () => {
        try {
            const data = await api.get(`/api/schedules?projectId=${selectedProject.id}`);
            setSchedules(data);
        } catch {
            toast.error("Failed to load schedules");
        }
    };

    const fetchScripts = async () => {
        try {
            const data = await api.get(`/api/recorder/scripts?projectId=${selectedProject?.id}`);
            setScripts(data);
        } catch (e) { console.error(e); }
    };

    const handleCreate = async () => {
        if (!selectedScript) return toast.error("Select a script");

        let cron = customCron;
        if (frequency === 'minute') cron = "* * * * *";
        if (frequency === 'hourly') cron = "0 * * * *";
        if (frequency === 'daily') cron = "0 9 * * *"; // 9 AM
        if (frequency === 'weekly') cron = "0 9 * * 1"; // Mon 9 AM

        try {
            await api.post('/api/schedules', {
                scriptId: selectedScript,
                cronExpression: cron,
                projectId: selectedProject?.id
            });
            toast.success("Schedule Created");
            setOpen(false);
            fetchSchedules();
        } catch {
            toast.error("Failed to create schedule");
        }
    };

    const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);

    const confirmDelete = async () => {
        if (!scheduleToDelete) return;
        try {
            await api.delete(`/api/schedules/${scheduleToDelete}`);
            toast.success("Schedule Stopped");
            fetchSchedules();
            setScheduleToDelete(null);
        } catch {
            toast.error("Failed to delete");
        }
    };

    const handleRunNow = async (scriptId: string) => {
        try {
            toast.info("Starting manual run...");
            await api.post('/api/runner/execute', {
                scriptId,
                projectId: selectedProject?.id,
                source: 'manual' // Must be 'manual', 'scheduler', or 'ci'
            });
            toast.success("Run started! Check Execution History.");
        } catch {
            toast.error("Failed to start run");
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
                        Smart Scheduler
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Automate your testing. Set it and forget it.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="h-4 w-4 mr-2" /> New Schedule
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Schedule a Test Run</DialogTitle>
                            <DialogDescription>
                                Set up automated execution for your recorded scripts.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Select Script</Label>
                                <Select onValueChange={setSelectedScript}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a script..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {scripts.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Frequency</Label>
                                <Select onValueChange={setFrequency} defaultValue="daily">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="minute">Every Minute (Debug)</SelectItem>
                                        <SelectItem value="hourly">Hourly</SelectItem>
                                        <SelectItem value="daily">Daily (9 AM)</SelectItem>
                                        <SelectItem value="weekly">Weekly (Mon 9 AM)</SelectItem>
                                        <SelectItem value="custom">Custom Cron</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {frequency === 'custom' && (
                                <div className="space-y-2">
                                    <Label>Cron Expression</Label>
                                    <input
                                        type="text"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={customCron}
                                        onChange={(e) => setCustomCron(e.target.value)}
                                        placeholder="* * * * *"
                                    />
                                </div>
                            )}

                            <Button className="w-full mt-4" onClick={handleCreate}>Create Schedule</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {schedules.map(schedule => (
                    <Card key={schedule.id} className="border-l-4 border-l-orange-500 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {schedule.scriptName}
                            </CardTitle>
                            <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-mono text-orange-600 mt-2">
                                {schedule.cronExpression}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {cronstrue.toString(schedule.cronExpression)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Created: {new Date(schedule.createdAt).toLocaleDateString()}
                            </p>
                            <Button variant="ghost" size="sm" className="w-full mt-4 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setScheduleToDelete(schedule.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Stop
                            </Button>
                            <Button variant="outline" size="sm" className="w-full mt-2 border-green-200 text-green-700 hover:bg-green-50" onClick={() => handleRunNow(schedule.scriptId)}>
                                <Play className="h-4 w-4 mr-2" /> Run Now
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                {schedules.length === 0 && (
                    <Card className="col-span-full border-dashed p-8 flex flex-col items-center justify-center text-muted-foreground">
                        <AlarmClock className="h-12 w-12 mb-4 opacity-20" />
                        <p>No active schedules. Go sleep, let the robots work!</p>
                    </Card>
                )}
            </div>

            <DeleteConfirmationDialog
                open={!!scheduleToDelete}
                onOpenChange={(open) => !open && setScheduleToDelete(null)}
                onConfirm={confirmDelete}
                title="Stop Schedule?"
                description="Are you sure you want to stop and delete this schedule?"
                confirmText="Stop & Delete"
            />
        </div>
    );
}
