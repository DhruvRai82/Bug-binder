
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useProject } from '@/context/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, ArrowLeft, Trash2, Sparkles, ChevronRight, Stethoscope } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from 'react-router-dom';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { toast } from 'sonner';

interface TestRun {
    id: string;
    script_id: string;
    status: 'pending' | 'running' | 'passed' | 'failed' | 'error';
    started_at: string;
    completed_at: string;
    duration_ms: number;
    trigger_source: string;
    recorded_scripts: { name: string };
    error_message?: string;
}

interface TestLog {
    id: string;
    run_id: string;
    step_index: number;
    action: string;
    status: 'pass' | 'fail' | 'info' | 'warning';
    message: string;
    timestamp: string;
}

interface AIAnalysisResult {
    failureReason: string;
    technicalRootCause: string;
    suggestedFix: string;
    confidenceScore: number;
}

export default function ExecutionHistory() {
    const { selectedProject } = useProject();
    const navigate = useNavigate();
    const [runs, setRuns] = useState<TestRun[]>([]);
    const [loading, setLoading] = useState(false);

    // Details Modal
    const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);
    const [logs, setLogs] = useState<TestLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // AI Analysis
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);

    useEffect(() => {
        if (selectedProject) loadHistory();
    }, [selectedProject]);

    const loadHistory = async () => {
        if (!selectedProject) return;
        setLoading(true);
        try {
            const data = await api.get(`/api/runner/history?projectId=${selectedProject.id}`);
            setRuns(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const viewLogs = async (run: TestRun) => {
        if (!selectedProject) return; // Ensure project is selected for projectId
        setSelectedRun(run);
        setAnalysis(null); // Reset analysis
        setLogsLoading(true);
        try {
            const { logs: fetchedLogs } = await api.get(`/api/runner/run/${run.id}`);
            setLogs(fetchedLogs);
        } catch (error) {
            console.error(error);
        } finally {
            setLogsLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedRun) return;
        setAnalyzing(true);
        try {
            const result = await api.post('/api/ai-analytics/analyze-failure', { runId: selectedRun.id });
            setAnalysis(result);
            toast.success("AI Analysis Complete");
        } catch (error: any) {
            toast.error("Analysis Failed: " + error.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const [runToDelete, setRunToDelete] = useState<TestRun | null>(null);

    const confirmDelete = async () => {
        if (!runToDelete) return;
        try {
            if (selectedProject?.id) {
                await api.delete(`/api/runner/run/${runToDelete.id}?projectId=${selectedProject.id}`);
            } else {
                // Fallback attempt without project ID (Backwards compat if backend allows)
                await api.delete(`/api/runner/run/${runToDelete.id}`);
            }
            setRuns(prev => prev.filter(r => r.id !== runToDelete.id));
            setRunToDelete(null);
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'passed': return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Passed</Badge>;
            case 'failed': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
            case 'running': return <Badge variant="secondary" className="animate-pulse"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Running</Badge>;
            case 'pending': return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-6 w-full">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/recorder')} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Execution History</h1>
                        <p className="text-muted-foreground">View past automation run results.</p>
                    </div>
                </div>
                <Button onClick={loadHistory} disabled={loading} variant="outline">
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Runs</CardTitle>
                    <CardDescription>History for {selectedProject?.name}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Script Name</TableHead>
                                <TableHead>Started At</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {runs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        No runs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                runs.map((run) => (
                                    <TableRow key={run.id} className="cursor-pointer hover:bg-muted/50" onClick={() => viewLogs(run)}>
                                        <TableCell>{getStatusBadge(run.status)}</TableCell>
                                        <TableCell className="font-medium">{run.recorded_scripts?.name || 'Unknown Script'}</TableCell>
                                        <TableCell>{new Date(run.started_at).toLocaleString()}</TableCell>
                                        <TableCell>{run.duration_ms ? `${(run.duration_ms / 1000).toFixed(2)}s` : '-'}</TableCell>
                                        <TableCell><Badge variant="outline" className="text-xs">{run.trigger_source}</Badge></TableCell>
                                        <TableCell className="text-right flex gap-2 justify-end">
                                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); viewLogs(run); }}>View Logs</Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setRunToDelete(run); }}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <DeleteConfirmationDialog
                open={!!runToDelete}
                onOpenChange={(open) => !open && setRunToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Test Run?"
                description="This will permanently delete this execution record and its logs."
            />

            {/* Logs Dialog */}
            <Dialog open={!!selectedRun} onOpenChange={(o) => !o && setSelectedRun(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <DialogTitle className="flex items-center gap-2">
                                    {selectedRun && getStatusBadge(selectedRun.status)}
                                    <span>{selectedRun?.recorded_scripts?.name}</span>
                                </DialogTitle>
                                <DialogDescription>
                                    Run ID: {selectedRun?.id} • {new Date(selectedRun?.started_at || '').toLocaleString()}
                                </DialogDescription>
                            </div>
                            {(selectedRun?.status === 'failed' || selectedRun?.status === 'error') && (
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={analyzing || !!analysis}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                                >
                                    {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {analysis ? "Analysis Ready" : "Analyze Failure"}
                                </Button>
                            )}
                        </div>
                    </DialogHeader>

                    {/* AI Analysis Result */}
                    {analysis && (
                        <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-300 font-semibold">
                                <Stethoscope className="w-5 h-5" />
                                AI Diagnosis (Confidence: {(analysis.confidenceScore * 100).toFixed(0)}%)
                            </div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="font-semibold text-foreground">Why it failed: </span>
                                    <span className="text-muted-foreground">{analysis.failureReason}</span>
                                </div>
                                <div className="p-3 bg-white dark:bg-black/20 rounded border">
                                    <span className="font-semibold block mb-1 text-red-600 dark:text-red-400">Technical Root Cause:</span>
                                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{analysis.technicalRootCause}</code>
                                </div>
                                <div>
                                    <span className="font-semibold text-foreground">Suggested Fix: </span>
                                    <div className="mt-1 p-2 bg-green-50 dark:bg-green-900/10 border border-green-100 rounded text-green-800 dark:text-green-300">
                                        {analysis.suggestedFix}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedRun?.error_message && !analysis && (
                        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm font-mono whitespace-pre-wrap">
                            Error: {selectedRun.error_message}
                        </div>
                    )}

                    <div className="flex-1 overflow-hidden border rounded-md bg-muted/20">
                        {logsLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <ScrollArea className="h-full max-h-[400px] p-4">
                                <div className="space-y-1 font-mono text-sm">
                                    {logs.map((log) => (
                                        <div key={log.id} className={`flex gap-3 p-2 rounded hover:bg-muted/50 ${log.status === 'fail' ? 'text-red-600 bg-red-50' :
                                            log.status === 'warning' ? 'text-yellow-600' :
                                                log.status === 'info' ? 'text-blue-600' : 'text-green-600'
                                            }`}>
                                            <span className="text-muted-foreground w-20 shrink-0 text-xs">
                                                {new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}
                                            </span>
                                            <span className={`w-16 shrink-0 font-bold uppercase text-xs border px-1 rounded text-center h-fit ${log.status === 'pass' ? 'border-green-200 bg-green-50' :
                                                log.status === 'fail' ? 'border-red-200 bg-red-50' : ''
                                                }`}>
                                                {log.action}
                                            </span>
                                            <span className="break-all">{log.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
