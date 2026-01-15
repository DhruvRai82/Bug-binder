import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarClock, Play, Trash2, Plus, AlarmClock } from 'lucide-react';
import { toast } from 'sonner';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose
} from '@/components/ui/drawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import cronstrue from 'cronstrue';
import { Label } from '@/components/ui/label';

export default function MobileSchedules() {
    const { selectedProject } = useProject();
    const [schedules, setSchedules] = useState<any[]>([]);
    const [scripts, setScripts] = useState<any[]>([]);
    const [createOpen, setCreateOpen] = useState(false);

    // Create form details
    const [selectedScript, setSelectedScript] = useState("");
    // Simplified mobile cron picker: using presets instead of builder
    const [frequency, setFrequency] = useState("daily-9am");

    useEffect(() => {
        if (!selectedProject) return;
        fetchSchedules();
        fetchScripts();
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

    const handleCreate = async () => {
        if (!selectedScript) return toast.error("Select a script");

        let cronExpression = "0 9 * * *"; // Default Daily 9am
        switch (frequency) {
            case "hourly": cronExpression = "0 * * * *"; break;
            case "daily-9am": cronExpression = "0 9 * * *"; break;
            case "daily-12pm": cronExpression = "0 12 * * *"; break;
            case "weekly-mon": cronExpression = "0 9 * * 1"; break;
            case "custom": cronExpression = "0 9 * * *"; break; // Fallback
        }

        try {
            await api.post('/api/schedules', {
                scriptId: selectedScript,
                cronExpression,
                projectId: selectedProject?.id
            });
            toast.success("Schedule Created");
            setCreateOpen(false);
            fetchSchedules();
        } catch {
            toast.error("Failed to create schedule");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Stop this schedule?')) return;
        try {
            await api.delete(`/api/schedules/${id}`);
            toast.success("Schedule Stopped");
            fetchSchedules();
        } catch {
            toast.error("Failed to delete");
        }
    };

    const handleRunNow = async (scriptId: string) => {
        try {
            toast.info("Starting run...");
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
        <div className="space-y-4 pb-20">
            {/* Header Action */}
            <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> New Schedule
            </Button>

            {/* List */}
            <div className="space-y-3">
                {schedules.map(schedule => (
                    <Card key={schedule.id} className="border-l-4 border-l-orange-500 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-sm">{schedule.scriptName || 'Unknown Script'}</h3>
                                    <div className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-1">
                                        <AlarmClock className="h-3 w-3" />
                                        {cronstrue.toString(schedule.cronExpression, { throwExceptionOnParseError: false })}
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-[10px] text-orange-600 bg-orange-50 border-orange-200">Active</Badge>
                            </div>

                            <div className="flex gap-2 mt-3">
                                <Button size="sm" variant="secondary" className="flex-1 h-8 text-xs" onClick={() => handleRunNow(schedule.scriptId)}>
                                    <Play className="h-3 w-3 mr-1.5" /> Run Now
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(schedule.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {schedules.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <CalendarClock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No active schedules.</p>
                    </div>
                )}
            </div>

            {/* Create Drawer */}
            <Drawer open={createOpen} onOpenChange={setCreateOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Schedule Automation</DrawerTitle>
                        <DrawerDescription>Run scripts automatically.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 space-y-6">
                        <div className="space-y-2">
                            <Label>Select Script</Label>
                            <Select onValueChange={setSelectedScript}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose script..." />
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
                            <Select value={frequency} onValueChange={setFrequency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hourly">Every Hour</SelectItem>
                                    <SelectItem value="daily-9am">Daily at 9:00 AM</SelectItem>
                                    <SelectItem value="daily-12pm">Daily at 12:00 PM</SelectItem>
                                    <SelectItem value="weekly-mon">Weekly (Monday 9AM)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button className="w-full bg-orange-600" onClick={handleCreate} disabled={!selectedScript}>
                            Create Schedule
                        </Button>
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
