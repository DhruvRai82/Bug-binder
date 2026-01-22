import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayCircle, CheckCircle, XCircle, Clock, Eye, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { RunLogDetailsDialog } from './RunLogDetailsDialog';

interface ScriptHistoryPanelProps {
    scriptId: string;
    projectId: string;
}

interface TestRun {
    id: string;
    status: 'running' | 'completed' | 'failed';
    startTime: string;
    duration_ms?: number;
    triggeredBy: string;
    logs: any[];
    script_id?: string;
    files?: string[];
}

export function ScriptHistoryPanel({ scriptId, projectId }: ScriptHistoryPanelProps) {
    const [runs, setRuns] = useState<TestRun[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (scriptId && projectId) {
            fetchRuns();
        }
    }, [scriptId, projectId]);

    const fetchRuns = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Using the unified API client (Port 8081 by default)
            const allRuns: TestRun[] = await api.get(`/api/projects/${projectId}/test-runs`);

            // Filter
            const scriptRuns = allRuns.filter(r =>
                (r.files && r.files.includes(scriptId)) ||
                (r as any).script_id === scriptId
            );

            // Sort by date desc
            scriptRuns.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
            setRuns(scriptRuns);
        } catch (e) {
            console.error('Failed to fetch runs', e);
            setError('Failed to load history.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <PlayCircle className="w-4 h-4 text-blue-500 animate-pulse" />;
        }
    };

    if (isLoading) {
        return <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">Loading history...</div>;
    }

    if (error) {
        return (
            <div className="p-4 text-center text-sm text-red-500 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
            </div>
        );
    }

    if (runs.length === 0) {
        return (
            <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2 bg-gray-50/50 dark:bg-slate-900/50 rounded-lg m-4">
                <Clock className="w-6 h-6 opacity-20" />
                No execution history found for this script.
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-gray-50/50 dark:bg-slate-950/50 m-2">
            <div className="p-3 border-b bg-muted/20 flex justify-between items-center">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Execution History
                </h4>
                <Badge variant="outline" className="text-[10px]">{runs.length} Runs</Badge>
            </div>
            <ScrollArea className="h-[200px]">
                <div className="divide-y">
                    {runs.map(run => (
                        <div key={run.id} className="flex items-center justify-between p-3 hover:bg-white dark:hover:bg-slate-900 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">{getStatusIcon(run.status)}</div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-foreground">
                                            {run.status === 'completed' ? 'Passed' : run.status === 'failed' ? 'Failed' : 'Running'}
                                        </span>
                                        {run.triggeredBy === 'schedule' && (
                                            <Badge variant="secondary" className="text-[10px] h-4 px-1">Auto</Badge>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                                        <span>{new Date(run.startTime).toLocaleString()}</span>
                                        <span className="opacity-50">•</span>
                                        <span>{formatDistanceToNow(new Date(run.startTime), { addSuffix: true })}</span>
                                        {run.duration_ms && (
                                            <>
                                                <span className="opacity-50">•</span>
                                                <span>{(run.duration_ms / 1000).toFixed(1)}s</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedRun(run)} className="h-7 text-xs">
                                <Eye className="w-3 h-3 mr-1.5" />
                                Logs
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {selectedRun && (
                <RunLogDetailsDialog
                    isOpen={!!selectedRun}
                    onClose={() => setSelectedRun(null)}
                    run={selectedRun}
                />
            )}
        </div>
    );
}
