
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useProject } from '@/context/ProjectContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Trash2, Plus, Clock, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import cronstrue from 'cronstrue';

type Schedule = {
    id: string;
    scriptId: string; // The backend returns scriptId/suiteId mapping
    scriptName: string;
    cronExpression: string;
    isActive: boolean;
    createdAt: string;
};

type Suite = {
    id: string;
    name: string;
    fileIds: string[];
};

const CRON_PRESETS = [
    { label: 'Every Hour', value: '0 * * * *' },
    { label: 'Every Day at Midnight', value: '0 0 * * *' },
    { label: 'Every Day at 8 AM', value: '0 8 * * *' },
    { label: 'Every Monday at 9 AM', value: '0 9 * * 1' },
    { label: 'Weekdays at 6 PM', value: '0 18 * * 1-5' }
];

export default function SchedulesView() {
    const { selectedProject } = useProject();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [suites, setSuites] = useState<Suite[]>([]);
    const [loading, setLoading] = useState(false);

    // Dialog State
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
            const [schedulesRes, suitesRes] = await Promise.all([
                api.get(`/api/schedules?projectId=${selectedProject.id}`),
                api.get(`/api/suites?projectId=${selectedProject.id}`)
            ]);
            setSchedules(schedulesRes as Schedule[]);
            setSuites(Array.isArray(suitesRes) ? suitesRes as Suite[] : []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [selectedProject]);

    const handleCreate = async () => {
        if (!newSchedule.suiteId || !newSchedule.name || !newSchedule.cronExpression) {
            toast.error("Please fill all fields");
            return;
        }

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
        } catch (error) {
            console.error(error);
            toast.error("Failed to create schedule");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this schedule?")) return;
        try {
            await api.delete(`/api/schedules/${id}`);
            toast.success("Schedule Deleted");
            setSchedules(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            toast.error("Failed to delete schedule");
        }
    };

    const getCronDescription = (cron: string) => {
        try {
            return cronstrue.toString(cron);
        } catch (e) {
            return `Invalid: ${cron}`;
        }
    };

    return (
        <div className="flex flex-col h-full bg-background/50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-card">
                <div>
                    <h2 className="text-lg font-semibold">Scheduled Jobs</h2>
                    <p className="text-sm text-muted-foreground">Automate test suite execution.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                New Schedule
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Schedule</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Test Suite</Label>
                                    <Select
                                        value={newSchedule.suiteId}
                                        onValueChange={(val) => {
                                            const suite = suites.find(s => s.id === val);
                                            setNewSchedule(prev => ({
                                                ...prev,
                                                suiteId: val,
                                                name: suite ? `Run ${suite.name}` : prev.name
                                            }));
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a Suite" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suites.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Schedule Name</Label>
                                    <Input
                                        value={newSchedule.name}
                                        onChange={e => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. Daily Regression"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Frequency</Label>
                                    <Select
                                        onValueChange={(val) => setNewSchedule(prev => ({ ...prev, cronExpression: val }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Preset (Optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CRON_PRESETS.map(p => (
                                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            value={newSchedule.cronExpression}
                                            onChange={e => setNewSchedule(prev => ({ ...prev, cronExpression: e.target.value }))}
                                            placeholder="* * * * *"
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {getCronDescription(newSchedule.cronExpression)}
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreate}>Create Schedule</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {loading ? (
                    <div className="text-center text-muted-foreground">Loading schedules...</div>
                ) : schedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                        <CalendarClock className="w-10 h-10 mb-2 opacity-50" />
                        <p>No active schedules. Create one to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schedules.map(schedule => (
                            <Card key={schedule.id} className="group hover:border-primary transition-colors">
                                <CardContent className="p-4 pt-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={schedule.isActive ? 'default' : 'secondary'} className="rounded-sm">
                                                {schedule.isActive ? 'ACTIVE' : 'PAUSED'}
                                            </Badge>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(schedule.id)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>

                                    <h3 className="font-semibold text-base mb-1">{schedule.scriptName || schedule.id}</h3>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                        <Clock className="w-3 h-3" />
                                        <span>{getCronDescription(schedule.cronExpression)}</span>
                                    </div>

                                    <div className="text-xs font-mono bg-muted p-1.5 rounded w-fit text-muted-foreground">
                                        {schedule.cronExpression}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
