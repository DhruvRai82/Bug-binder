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
import { DeleteConfirmationDialog } from '@/features/test-management/DeleteConfirmationDialog';
import { CronBuilder } from '@/features/execution/CronBuilder';
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
            const data = await api.get(`/api/schedules?projectId=${selectedProject?.id}`);
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
            if (!selectedProject?.id) return;
            const data = await api.get(`/api/recorder/reports?projectId=${selectedProject.id}`);
            // Map Report Data to History UI Format
            // Report: { scriptName, status, startTime, ... }
            const mapped = data.slice(0, 10).map((r: any) => ({
                scriptName: r.scriptName,
                status: r.status,
                timestamp: new Date(r.startTime).toLocaleString(),
            }));
            setHistory(mapped);
        } catch (e) {
            console.error("Failed to load history", e);
        }
    };

    const handleCreate = async () => {
        if (!selectedScript) return toast.error("Select a script");

        const scriptObj = scripts.find(s => s.id === selectedScript);
        const name = scriptObj ? `Schedule: ${scriptObj.name}` : `Schedule for ${selectedScript}`;

        try {
            await api.post('/api/schedules', {
                suiteId: selectedScript, // Map script to suiteId as expected by backend
                scriptId: selectedScript, // Keep for reference if needed
                cronExpression,
                projectId: selectedProject?.id,
                name: name
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
        <div className="h-full flex flex-col p-8 pt-6 animate-in fade-in duration-500">
            {/* Premium Header */}
            <div className="flex justify-between items-end mb-8 flex-shrink-0">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                        Smart Scheduler
                    </h1>
                    <p className="text-muted-foreground max-w-lg">
                        Automate your testing with precise frequency. Run tests daily, weekly, or on custom cron schedules.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/25 transition-all hover:scale-105 border-0">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 min-h-0">
                {/* Active Schedules - Floating Cards Grid */}
                <div className="md:col-span-2 flex flex-col space-y-4 overflow-hidden">
                    <div className="flex items-center gap-2 pb-2">
                        <CalendarClock className="h-5 w-5 text-orange-500" />
                        <h2 className="text-lg font-bold text-foreground/80">Active Schedules</h2>
                    </div>

                    <ScrollArea className="flex-1 -mr-4 pr-4">
                        <div className="grid gap-4 md:grid-cols-2 pb-4">
                            {schedules.map(schedule => (
                                <Card key={schedule.id} className="group border-0 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl hover:shadow-xl transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10 hover:ring-orange-500/30 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-red-500 opacity-80" />
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
                                        <CardTitle className="text-base font-bold truncate w-[160px]" title={schedule.scriptName}>
                                            {schedule.scriptName || 'Unknown Script'}
                                        </CardTitle>
                                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 font-medium">Active</Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <div className="text-2xl font-bold font-mono text-foreground/90 tracking-tight">
                                                {schedule.cronExpression}
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground font-medium mb-4 flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" />
                                            {cronstrue.toString(schedule.cronExpression, { throwExceptionOnParseError: false })}
                                        </div>

                                        <div className="flex gap-2 pt-2 border-t border-orange-100 dark:border-orange-900/20">
                                            <Button variant="ghost" size="sm" className="flex-1 hover:bg-orange-50 text-orange-700 hover:text-orange-800 h-8 text-xs font-semibold" onClick={() => handleRunNow(schedule.scriptId)}>
                                                <Play className="h-3 w-3 mr-1.5 fill-current" /> Run Now
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full" onClick={() => setScheduleToDelete(schedule.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {schedules.length === 0 && (
                                <div className="col-span-full h-64 border-2 border-dashed border-orange-200 dark:border-orange-900/30 rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-orange-50/30 dark:bg-orange-900/5">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                                        <AlarmClock className="h-8 w-8 text-orange-400" />
                                    </div>
                                    <p className="font-medium text-foreground/70">No active schedules found.</p>
                                    <Button variant="link" onClick={() => setOpen(true)} className="mt-1 text-orange-600 font-semibold">Create your first schedule</Button>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* History / Recent Activity - Glass Panel */}
                <Card className="md:col-span-1 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-0 ring-1 ring-black/5 dark:ring-white/10 h-full flex flex-col overflow-hidden rounded-2xl">
                    <CardHeader className="bg-muted/10 border-b border-black/5 dark:border-white/5 pb-4">
                        <CardTitle className="flex items-center text-lg font-bold"><History className="h-5 w-5 mr-2 text-blue-500" /> Recent Activity</CardTitle>
                        <CardDescription>Latest automated execution results.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0 relative bg-gradient-to-b from-transparent to-muted/5">
                        <ScrollArea className="h-full px-5 py-4">
                            {history.length > 0 ? (
                                <div className="space-y-4">
                                    {history.map((run, i) => (
                                        <div key={i} className="flex items-start gap-3 relative pb-4 last:pb-0 group">
                                            {/* Timeline connector */}
                                            {i !== history.length - 1 && <div className="absolute left-[5px] top-2 bottom-0 w-px bg-border group-last:hidden" />}

                                            <div className={`mt-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 z-10 ${run.status === 'pass' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
                                            <div className="space-y-1 flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-semibold leading-none truncate pr-2" title={run.scriptName}>{run.scriptName}</p>
                                                    <Badge variant={run.status === 'pass' ? 'outline' : 'destructive'} className={`text-[10px] h-5 px-1.5 uppercase ${run.status === 'pass' ? 'text-green-600 border-green-200 bg-green-50' : ''}`}>
                                                        {run.status === 'pass' ? 'PASS' : 'FAIL'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground font-mono">{run.timestamp}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-sm text-center">
                                    <Clock className="h-10 w-10 mb-3 opacity-20" />
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
