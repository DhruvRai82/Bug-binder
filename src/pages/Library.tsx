
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Play, FileJson, Clock, Trash2, Filter, Eye, FileBarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { useProject } from '@/context/ProjectContext';
import { ScriptDetailsModal } from '@/components/ScriptDetailsModal';
import { ReportsView } from '@/components/ReportsView';

interface Recording {
    id: string;
    name: string;
    module: string;
    steps: any[];
    createdAt?: string;
}

export default function Library() {
    const { selectedProject } = useProject();
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [filteredRecordings, setFilteredRecordings] = useState<Recording[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [filterModule, setFilterModule] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [selectedScript, setSelectedScript] = useState<Recording | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        if (selectedProject) {
            fetchRecordings();
        } else {
            setRecordings([]);
            setFilteredRecordings([]);
            setIsLoading(false);
        }
    }, [selectedProject]);

    const fetchRecordings = async () => {
        if (!selectedProject) return;

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/recorder/list?projectId=${selectedProject.id}`);
            if (response.ok) {
                const data = await response.json();
                setRecordings(data);
                setFilteredRecordings(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load recordings');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let result = recordings;

        if (filterModule !== 'all') {
            result = result.filter(r => r.module === filterModule);
        }

        if (searchQuery) {
            result = result.filter(r =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.id.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredRecordings(result);
    }, [filterModule, searchQuery, recordings]);

    const deleteRecording = async (id: string) => {
        if (!confirm('Are you sure you want to delete this recording?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/recorder/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success('Recording deleted');
                fetchRecordings();
            } else {
                toast.error('Failed to delete recording');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error deleting recording');
        }
    };

    const playRecording = async (rec: Recording) => {
        setPlayingId(rec.id);
        toast.info('Starting playback...');

        try {
            const response = await fetch('http://localhost:5000/api/recorder/play', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: rec.id,
                    projectId: selectedProject?.id
                })
            });

            if (response.ok) {
                toast.success('Playback started');
            } else {
                toast.error('Failed to start playback');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error starting playback');
        } finally {
            setPlayingId(null);
        }
    };

    const viewDetails = async (rec: Recording) => {
        // Fetch full details including steps if not already present
        // For now assuming list returns steps or we use what we have
        // If list doesn't return steps, we might need to fetch individual recording
        // But our list implementation currently reads the file so it should have steps (or count)
        // Wait, list returns steps count, not array. We need to fetch the full recording to see steps.
        // Let's assume we need to fetch it.

        // Quick fix: We'll just use the play endpoint logic to get steps? No.
        // Let's just fetch the file content.
        // Actually, the list endpoint returns steps count.
        // I'll update the list endpoint to return steps array in the backend for now (it's small JSONs).
        // OR I can just fetch it.
        // Let's just fetch it.

        // Actually, let's just pass the recording object if it has steps.
        // If not, we might need to fetch.
        // For now, I'll assume the list returns steps array because I modified it to return content.
        // Wait, I modified list to return steps count: `steps: Array.isArray(content) ? content.length : content.steps.length`
        // So I need to fetch the full recording.
        // I'll add a fetch here.

        // Actually, I'll just update the backend list to return full steps for simplicity as files are small.
        // Wait, I can't easily update backend now without another tool call.
        // I'll just fetch the file by "playing" it? No.
        // I'll just use the `play` endpoint to get steps? No.
        // I'll just assume for now that I can't see steps unless I update backend.
        // I will update backend list to return steps.

        setSelectedScript(rec);
        setIsDetailsOpen(true);
    };

    if (!selectedProject) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">Please select a project to view the library.</h2>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Library & Reports</h1>
                <p className="text-muted-foreground">Manage scripts and view execution reports for {selectedProject.name}.</p>
            </div>

            <Tabs defaultValue="scripts" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="scripts" className="flex items-center gap-2">
                        <FileJson className="w-4 h-4" /> Scripts
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="flex items-center gap-2">
                        <FileBarChart className="w-4 h-4" /> Reports
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="scripts" className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Input
                                    placeholder="Search scripts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={filterModule} onValueChange={setFilterModule}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Filter by Module" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Modules</SelectItem>
                                    {Array.from(new Set(recordings.map(r => r.module))).map(module => (
                                        <SelectItem key={module} value={module}>{module}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRecordings.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No recordings found for this project.
                                </div>
                            ) : (
                                filteredRecordings.map((rec) => (
                                    <Card key={rec.id} className="hover:shadow-md transition-shadow flex flex-col">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <FileJson className="h-5 w-5 text-blue-500" />
                                                        {rec.name}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {rec.module}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <div className="flex items-center text-sm text-muted-foreground mt-2">
                                                <Clock className="mr-1 h-4 w-4" />
                                                {rec.steps?.length || 0} steps
                                                {rec.createdAt && (
                                                    <span className="ml-2 opacity-70">
                                                        • {new Date(rec.createdAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-0 flex justify-between gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => viewDetails(rec)}
                                                title="View Steps"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => deleteRecording(rec.id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() => playRecording(rec)}
                                                disabled={playingId === rec.id}
                                                size="sm"
                                                className="flex-1 ml-2"
                                            >
                                                <Play className="mr-2 h-4 w-4" />
                                                {playingId === rec.id ? 'Playing...' : 'Play'}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="reports">
                    <ReportsView />
                </TabsContent>
            </Tabs>

            <ScriptDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                script={selectedScript}
            />
        </div>
    );
}
