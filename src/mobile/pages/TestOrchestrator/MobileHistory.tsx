import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileText, CheckCircle2, XCircle, RotateCcw, AlertCircle, ChevronRight, Terminal } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { ExecutionConsole } from '@/features/execution/ExecutionConsole';

export default function MobileHistory() {
    const { selectedProject } = useProject();
    const [runs, setRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRun, setSelectedRun] = useState<any>(null);

    const fetchHistory = async () => {
        if (!selectedProject) return;
        setLoading(true);
        try {
            const data: any = await api.get(`/api/runner/runs/${selectedProject.id}`);
            const sorted = Array.isArray(data) ? data.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()) : [];
            setRuns(sorted);
        } catch (error) {
            toast.error("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [selectedProject]);

    const handleRunClick = (run: any) => {
        setSelectedRun(run);
    };

    return (
        <div className="space-y-3 pb-20">
            {/* Header / Stats */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Recent Activity</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={fetchHistory}>
                    Refresh
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-sm text-muted-foreground animate-pulse">Loading runs...</div>
            ) : runs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                    No history yet
                </div>
            ) : (
                runs.map(run => (
                    <Card
                        key={run.id}
                        className="p-3 active:scale-[0.98] transition-transform"
                        onClick={() => handleRunClick(run)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <StatusIcon status={run.status} />
                                <div>
                                    <div className="font-medium text-sm">
                                        Run #{run.id.slice(0, 6)}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {new Date(run.startTime).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] capitalize">
                                {run.triggeredBy || 'Manual'}
                            </Badge>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                            <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" /> {run.files?.length || 0} Tests
                            </span>
                            {run.duration_ms && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {(run.duration_ms / 1000).toFixed(1)}s
                                </span>
                            )}
                        </div>
                    </Card>
                ))
            )}

            {/* Run Detail Drawer */}
            <Drawer open={!!selectedRun} onOpenChange={(o) => !o && setSelectedRun(null)}>
                <DrawerContent className="h-[90vh]">
                    <div className="h-full flex flex-col">
                        <DrawerHeader className="border-b shrink-0">
                            <DrawerTitle className="flex items-center gap-2">
                                <StatusIcon status={selectedRun?.status} size="sm" />
                                Run Details
                            </DrawerTitle>
                            <DrawerDescription>
                                ID: {selectedRun?.id}
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="flex-1 overflow-hidden bg-black p-0">
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

                        <DrawerFooter className="border-t shrink-0">
                            <DrawerClose asChild>
                                <Button variant="outline">Close</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}

function StatusIcon({ status, size = 'md' }: { status: string, size?: 'sm' | 'md' }) {
    const s = size === 'sm' ? "w-4 h-4" : "w-5 h-5";

    if (status === 'completed' || status === 'passed') return <CheckCircle2 className={`${s} text-green-500`} />;
    if (status === 'failed' || status === 'error') return <XCircle className={`${s} text-red-500`} />;
    if (status === 'running') return <RotateCcw className={`${s} text-blue-500 animate-spin`} />;
    return <AlertCircle className={`${s} text-muted-foreground`} />;
}
