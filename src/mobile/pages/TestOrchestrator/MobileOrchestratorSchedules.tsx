import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Trash2, Plus, Clock, Layers } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import cronstrue from 'cronstrue';

const CRON_PRESETS = [
    { label: 'Every Hour', value: '0 * * * *' },
    { label: 'Every Day (Midnight)', value: '0 0 * * *' },
    { label: 'Every Day (8 AM)', value: '0 8 * * *' },
    { label: 'Weekdays (6 PM)', value: '0 18 * * 1-5' }
];

export default function MobileOrchestratorSchedules() {
    const { selectedProject } = useProject();
    const [schedules, setSchedules] = useState<any[]>([]);
    const [suites, setSuites] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Create State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        suiteId: '',
        cronExpression: '0 0 * * *',
        name: ''
    });

    const fetchAll = async () => {
        if (!selectedProject) return;
        setLoading(true);
        try {
            const [schedRes, suitesRes] = await Promise.all([
                api.get(`/api/schedules?projectId=${selectedProject.id}`),
                api.get(`/api/suites?projectId=${selectedProject.id}`)
            ]);
            setSchedules(schedRes as any[]);
            setSuites(Array.isArray(suitesRes) ? suitesRes : []);
        } catch { toast.error("Failed to load data"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, [selectedProject]);

    const handleCreate = async () => {
        if (!newSchedule.suiteId || !newSchedule.name) return toast.error("Missing fields");
        try {
            await api.post('/api/schedules', {
                projectId: selectedProject?.id,
                suiteId: newSchedule.suiteId,
                cronExpression: newSchedule.cronExpression,
                name: newSchedule.name
            });
            toast.success("Schedule Created");
            setIsCreateOpen(false);
            setNewSchedule({ suiteId: '', cronExpression: '0 0 * * *', name: '' });
            fetchAll();
        } catch { toast.error("Create Failed"); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete schedule?")) return;
        try {
            await api.delete(`/api/schedules/${id}`);
            toast.success("Deleted");
            setSchedules(prev => prev.filter(s => s.id !== id));
        } catch { toast.error("Delete Failed"); }
    };

    return (
        <div className="space-y-4 pb-20">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Suite Schedules</span>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" /> New
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : schedules.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                    No active schedules for suites.
                </div>
            ) : (
                schedules.map(schedule => (
                    <Card key={schedule.id} className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-semibold flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    {schedule.scriptName || schedule.id}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {cronstrue.toString(schedule.cronExpression, { throwExceptionOnParseError: false })}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => handleDelete(schedule.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <Badge variant="outline" className="font-mono text-[10px]">
                                {schedule.cronExpression}
                            </Badge>
                            <Badge variant={schedule.isActive ? 'default' : 'secondary'} className="text-[10px]">
                                {schedule.isActive ? 'ACTIVE' : 'PAUSED'}
                            </Badge>
                        </div>
                    </Card>
                ))
            )}

            <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Schedule Suite</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Test Suite</Label>
                            <Select
                                value={newSchedule.suiteId}
                                onValueChange={(val) => {
                                    const s = suites.find(x => x.id === val);
                                    setNewSchedule(prev => ({ ...prev, suiteId: val, name: s ? `Run ${s.name}` : prev.name }));
                                }}
                            >
                                <SelectTrigger><SelectValue placeholder="Select Suite" /></SelectTrigger>
                                <SelectContent>
                                    {suites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={newSchedule.name} onChange={e => setNewSchedule(prev => ({ ...prev, name: e.target.value }))} placeholder="Daily Run" />
                        </div>

                        <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Select onValueChange={(val) => setNewSchedule(prev => ({ ...prev, cronExpression: val }))}>
                                <SelectTrigger><SelectValue placeholder="Select Preset" /></SelectTrigger>
                                <SelectContent>
                                    {CRON_PRESETS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input
                                value={newSchedule.cronExpression}
                                onChange={e => setNewSchedule(prev => ({ ...prev, cronExpression: e.target.value }))}
                                className="font-mono text-xs"
                            />
                        </div>
                    </div>
                    <DrawerFooter>
                        <Button onClick={handleCreate}>Create Schedule</Button>
                        <DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
