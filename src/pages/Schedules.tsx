import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { AlarmClock, Trash2, Plus, CalendarClock, Play, History, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { CronBuilder } from '@/components/CronBuilder';
import cronstrue from 'cronstrue';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function Schedules() {
    const { selectedProject } = useProject();
    const [schedules, setSchedules] = useState<any[]>([]);
    const [scripts, setScripts] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);

    // Form State
    const [open, setOpen] = useState(false);
    const [selectedScript, setSelectedScript] = useState("");
    const [cronExpression, setCronExpression] = useState("0 9 * * *");

    useEffect(() => {
        if (!selectedProject) return;
        fetchSchedules();
        fetchScripts();
        fetchHistory();
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

    const fetchHistory = async () => {
        try {
            // Mocking history API or using existing run logs if available
            // Assuming we can get recent runs from TestRunService (needs endpoint)
            // For now, let's just use a dummy list until Backend Endpoint is ready for pure history
            // Actually, let's use the Runner Reports endpoint if available or empty.
            // TODO: Connect to real `/api/runner/history`.
            setHistory([]);
        } catch (e) { }
    };

    const handleCreate = async () => {
        if (!selectedScript) return toast.error("Select a script");

        try {
            await api.post('/api/schedules', {
                scriptId: selectedScript,
                cronExpression,
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
                source: 'manual'
            });
            toast.success("Run started!");
        } catch {
            toast.error("Failed to start run");
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
                        Smart Scheduler
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Automate your testing with precise frequency.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="h-4 w-4 mr-2" /> New Schedule
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg border-0 bg-card/95 backdrop-blur-xl shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <div className="p-2 bg-orange-500/10 rounded-md">
                                    <AlarmClock className="h-6 w-6 text-orange-600" />
                                </div>
                                Schedule Test Run
                            </DialogTitle>
                            <DialogDescription>
                                Set up automated execution intervals for your scripts.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2 group">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground group-focus-within:text-orange-600 transition-colors">Select Script</Label>
                                <Select onValueChange={setSelectedScript}>
                                    <SelectTrigger className="bg-background/50 border-input/50 focus:ring-orange-500/20 h-11">
                                        <SelectValue placeholder="Choose a script to automate..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {scripts.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 group">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground group-focus-within:text-orange-600 transition-colors">Schedule Frequency</Label>
                                <div className="p-4 border rounded-xl bg-background/30 backdrop-blur-sm">
                                    <CronBuilder value={cronExpression} onChange={setCronExpression} />
                                </div>
                            </div>

                            <div className="bg-orange-500/10 border border-orange-200/50 p-4 rounded-xl text-center">
                                <span className="font-mono text-lg font-bold text-orange-700 tracking-wider block mb-1">
                                    {cronExpression}
                                </span>
                                <div className="text-xs font-medium text-orange-600/80 uppercase tracking-wide">
                                    {cronstrue.toString(cronExpression, { throwExceptionOnParseError: false }) || 'Invalid Expression'}
                                </div>
                            </div>

                            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/20" onClick={handleCreate}>
                                <Play className="h-4 w-4 mr-2 fill-white" /> Activate Schedule
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Active Schedules */}
                <div className="md:col-span-2 space-y-6 overflow-y-auto pr-2">
                    <h2 className="text-lg font-semibold flex items-center"><CalendarClock className="h-5 w-5 mr-2 text-orange-500" /> Active Schedules</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {schedules.map(schedule => (
                            <Card key={schedule.id} className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium truncate w-[150px]" title={schedule.scriptName}>
                                        {schedule.scriptName || 'Unknown Script'}
                                    </CardTitle>
                                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Active</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold font-mono text-foreground mt-2">
                                        {schedule.cronExpression}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 font-medium">
                                        {cronstrue.toString(schedule.cronExpression, { throwExceptionOnParseError: false })}
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1 hover:bg-green-50 hover:text-green-600" onClick={() => handleRunNow(schedule.scriptId)}>
                                            <Play className="h-3 w-3 mr-2" /> Run Now
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setScheduleToDelete(schedule.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {schedules.length === 0 && (
                            <div className="col-span-full border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                                <AlarmClock className="h-12 w-12 mb-4 opacity-20" />
                                <p>No active schedules found.</p>
                                <Button variant="link" onClick={() => setOpen(true)} className="mt-2 text-orange-600">Create one now</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* History / Recent Activity */}
                <Card className="md:col-span-1 shadow-lg bg-card/50 backdrop-blur-sm h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg"><History className="h-5 w-5 mr-2 text-blue-500" /> Recent Activity</CardTitle>
                        <CardDescription>Latest automated execution results.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0 relative">
                        <ScrollArea className="h-full px-6 pb-4">
                            {history.length > 0 ? (
                                <div className="space-y-4 pt-2">
                                    {history.map((run, i) => (
                                        <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0">
                                            <div className={`mt-1 h-2 w-2 rounded-full ${run.status === 'pass' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{run.scriptName}</p>
                                                <p className="text-xs text-muted-foreground">{run.timestamp}</p>
                                                <Badge variant={run.status === 'pass' ? 'default' : 'destructive'} className="text-[10px] h-5">{run.status.toUpperCase()}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-sm text-center">
                                    <Clock className="h-8 w-8 mb-3 opacity-30" />
                                    No recent execution history available.
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
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
