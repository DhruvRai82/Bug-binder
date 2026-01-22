import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayCircle, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { RunLogDetailsDialog } from './RunLogDetailsDialog';

interface ExecutionHistoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    scriptId: string | null;
    scriptName: string;
    projectId: string;
}

interface TestRun {
    id: string;
    status: 'running' | 'completed' | 'failed';
    startTime: string;
    duration_ms?: number;
    triggeredBy: string;
    logs: any[];
    // script_id is stored in run metadata or mapped via files array
    // We filter by scriptId on client side or backend. 
    // Backend doesn't filter by scriptId in getTestRuns, so we do it here.
    script_id?: string;
    files?: string[];
}

export function ExecutionHistoryDrawer({ isOpen, onClose, scriptId, scriptName, projectId }: ExecutionHistoryDrawerProps) {
    const [runs, setRuns] = useState<TestRun[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);

    useEffect(() => {
        if (isOpen && scriptId && projectId) {
            fetchRuns();
        }
    }, [isOpen, scriptId, projectId]);

    const fetchRuns = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/projects/${projectId}/test-runs`);
            if (res.ok) {
                const allRuns: TestRun[] = await res.json();
                // Filter for this script
                // Check if scriptId is in files array OR match script_id property
                const scriptRuns = allRuns.filter(r =>
                    (r.files && r.files.includes(scriptId!)) ||
                    (r as any).script_id === scriptId
                );

                // Sort by date desc
                scriptRuns.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
                setRuns(scriptRuns);
            }
        } catch (e) {
            console.error('Failed to fetch runs', e);
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

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Execution History</SheetTitle>
                        <SheetDescription>
                            Past runs for <span className="font-semibold text-foreground">{scriptName}</span>
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 flex-1 overflow-hidden flex flex-col">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                                Loading history...
                            </div>
                        ) : runs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-sm text-muted-foreground gap-2">
                                <Clock className="w-8 h-8 opacity-20" />
                                No run history found.
                            </div>
                        ) : (
                            <ScrollArea className="flex-1 pr-4">
                                <div className="space-y-3">
                                    {runs.map(run => (
                                        <div key={run.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1">{getStatusIcon(run.status)}</div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">
                                                            {new Date(run.startTime).toLocaleString()}
                                                        </span>
                                                        {run.triggeredBy === 'schedule' && (
                                                            <Badge variant="outline" className="text-[10px] h-4 px-1">Auto</Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                                                        <span>{formatDistanceToNow(new Date(run.startTime), { addSuffix: true })}</span>
                                                        {run.duration_ms && (
                                                            <span>• {(run.duration_ms / 1000).toFixed(1)}s</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedRun(run)}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Logs
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {selectedRun && (
                <RunLogDetailsDialog
                    isOpen={!!selectedRun}
                    onClose={() => setSelectedRun(null)}
                    run={selectedRun}
                />
            )}
        </>
    );
}
