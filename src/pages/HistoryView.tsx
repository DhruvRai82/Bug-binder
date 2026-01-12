
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useProject } from '@/context/ProjectContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, FileText, Clock, RotateCcw, X, Terminal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExecutionConsole } from '@/components/ExecutionConsole';

export default function HistoryView() {
    const { selectedProject } = useProject();
    const [runs, setRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRun, setSelectedRun] = useState<any>(null);

    const fetchHistory = async () => {
        if (!selectedProject) return;
        setLoading(true);
        try {
            const data: any = await api.get(`/api/runner/runs/${selectedProject.id}`);
            // Sort by Date Descending
            const sorted = Array.isArray(data) ? data.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()) : [];
            setRuns(sorted);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [selectedProject]);

    const handleDelete = async (runId: string, e: any) => {
        e.stopPropagation();
        if (!confirm("Delete this run record?")) return;
        try {
            await api.delete(`/api/runner/run/${runId}?projectId=${selectedProject?.id}`);
            toast.success("Run deleted");
            setRuns(prev => prev.filter(r => r.id !== runId));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete run");
        }
    };

    const handleClearHistory = async () => {
        if (!confirm("Are you sure you want to delete ALL history? This cannot be undone.")) return;
        // We need an API for this
        try {
            // Iterate and delete (temporary until Bulk API exists)
            const promises = runs.map(r => api.delete(`/api/runner/run/${r.id}?projectId=${selectedProject?.id}`));
            await Promise.all(promises);
            toast.success("History cleared");
            setRuns([]);
        } catch (error) {
            toast.error("Failed to clear history");
        }
    };

    return (
        <div className="flex flex-col h-full bg-background/50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-card">
                <div>
                    <h2 className="text-lg font-semibold">Execution History</h2>
                    <p className="text-sm text-muted-foreground">View logs and results of past test runs.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchHistory}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleClearHistory} disabled={runs.length === 0}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear History
                    </Button>
                </div>
            </div>

            {/* List */}
            <ScrollArea className="flex-1 p-4">
                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading history...</div>
                ) : runs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                        <Clock className="w-10 h-10 mb-2 opacity-50" />
                        <p>No execution history found.</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-w-5xl mx-auto">
                        {runs.map(run => (
                            <Card
                                key={run.id}
                                className="hover:bg-accent/50 transition-colors cursor-pointer group"
                                onClick={() => setSelectedRun(run)}
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Status Badge */}
                                        <Badge variant={run.status === 'completed' || run.status === 'passed' ? 'default' : run.status === 'running' ? 'secondary' : 'destructive'} className="uppercase">
                                            {run.status}
                                        </Badge>

                                        {/* Info */}
                                        <div>
                                            <div className="flex items-center gap-2 font-medium">
                                                <span className="text-sm">Run {run.id.slice(0, 8)}</span>
                                                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                    {run.triggeredBy || 'Manual'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(run.startTime).toLocaleString()}</span>
                                                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {run.files?.length || 0} Files</span>
                                                {run.duration_ms && <span>{(run.duration_ms / 1000).toFixed(1)}s</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm">
                                            <Terminal className="w-4 h-4 mr-2 text-muted-foreground" />
                                            View Logs
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:text-destructive text-muted-foreground" onClick={(e) => handleDelete(run.id, e)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Detail View (Full Screen Overlay or Dialog) */}
            <Dialog open={!!selectedRun} onOpenChange={(open) => !open && setSelectedRun(null)}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-4 border-b">
                        <div className="flex items-center justify-between pr-8">
                            <DialogTitle>Run Details: {selectedRun?.id.slice(0, 8)}</DialogTitle>
                            <Badge>{selectedRun?.status}</Badge>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 bg-black">
                        {selectedRun && (
                            <ExecutionConsole
                                runId={selectedRun.id}
                                logs={selectedRun.logs || []}
                                status={selectedRun.status}
                                progress={100}
                                aiAnalysis={selectedRun.ai_analysis}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
