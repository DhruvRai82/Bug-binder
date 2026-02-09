/**
 * Module: HistoryView (Premium Redesign)
 * Purpose: Beautiful timeline view of test execution history
 * Why: User wants rich visual history, not basic list
 * Design: Vertical timeline with gradient dots, stat cards, expandable details
 */

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useProject } from '@/context/ProjectContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Clock, RotateCcw, Terminal, CheckCircle2, XCircle, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExecutionConsole } from '@/features/execution/ExecutionConsole';
import { cn } from '@/lib/utils';

export default function HistoryView() {
    const { selectedProject } = useProject();
    const [runs, setRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRun, setSelectedRun] = useState<any>(null);
    const [filterSource, setFilterSource] = useState<string>('orchestrator');

    const fetchHistory = async () => {
        if (!selectedProject) return;
        setLoading(true);
        try {
            const sourceParam = filterSource === 'recorder' ? 'recorder' : 'orchestrator';
            const data: any = await api.get(`/api/runner/runs/${selectedProject.id}?source=${sourceParam}`);
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
    }, [selectedProject, filterSource]);

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
        try {
            const promises = runs.map(r => api.delete(`/api/runner/run/${r.id}?projectId=${selectedProject?.id}`));
            await Promise.all(promises);
            toast.success("History cleared");
            setRuns([]);
        } catch (error) {
            toast.error("Failed to clear history");
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
            case 'passed':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'passed':
                return 'from-green-500/20 to-emerald-500/10 border-green-500/30';
            case 'failed':
                return 'from-red-500/20 to-rose-500/10 border-red-500/30';
            default:
                return 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
        }
    };

    // Calculate stats
    const totalRuns = runs.length;
    const passedRuns = runs.filter(r => r.status === 'completed' || r.status === 'passed').length;
    const failedRuns = runs.filter(r => r.status === 'failed').length;
    const successRate = totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 0;

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/20">
            {/* Premium Header */}
            <div className="flex items-center justify-between p-6 border-b bg-card/50 backdrop-blur-xl shrink-0">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                            <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight">Execution History</h2>
                            <p className="text-xs text-muted-foreground">View past test runs and results</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-muted/50 p-1 rounded-xl border">
                        <button
                            onClick={() => setFilterSource('orchestrator')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                filterSource === 'orchestrator'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Orchestrator
                        </button>
                        <button
                            onClick={() => setFilterSource('recorder')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                filterSource === 'recorder'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Recorder
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchHistory}
                        className="hover:bg-accent/50"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleClearHistory}
                        disabled={runs.length === 0}
                        className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {totalRuns > 0 && (
                <div className="grid grid-cols-4 gap-4 p-6 border-b">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Runs</p>
                                    <p className="text-2xl font-bold">{totalRuns}</p>
                                </div>
                                <Zap className="w-8 h-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Passed</p>
                                    <p className="text-2xl font-bold text-green-400">{passedRuns}</p>
                                </div>
                                <CheckCircle2 className="w-8 h-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-2 border-red-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Failed</p>
                                    <p className="text-2xl font-bold text-red-400">{failedRuns}</p>
                                </div>
                                <XCircle className="w-8 h-8 text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Success Rate</p>
                                    <p className="text-2xl font-bold text-purple-400">{successRate}%</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Timeline List */}
            <ScrollArea className="flex-1 p-6">
                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading history...</div>
                ) : runs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
                            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-dashed border-white/20">
                                <Clock className="w-12 h-12 text-blue-400/50" />
                            </div>
                        </div>
                        <p className="text-lg font-semibold">No execution history found</p>
                        <p className="text-sm text-muted-foreground mt-1">Run some tests to see them here</p>
                    </div>
                ) : (
                    <div className="relative max-w-4xl mx-auto">
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />

                        {/* Timeline Items */}
                        <div className="space-y-6">
                            {runs.map((run, index) => (
                                <div
                                    key={run.id}
                                    className="relative pl-16 animate-in fade-in slide-in-from-left-4"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Timeline Dot */}
                                    <div className="absolute left-4 top-6 w-5 h-5 rounded-full border-4 border-background bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50" />

                                    {/* Run Card */}
                                    <Card
                                        className={cn(
                                            "cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group",
                                            "bg-gradient-to-br backdrop-blur-xl border-2",
                                            getStatusColor(run.status)
                                        )}
                                        onClick={() => setSelectedRun(run)}
                                    >
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 flex-1">
                                                    {/* Status Icon */}
                                                    <div className="p-3 rounded-xl bg-muted/50 border">
                                                        {getStatusIcon(run.status)}
                                                    </div>

                                                    {/* Run Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="font-mono text-sm font-semibold">
                                                                Run #{run.id.slice(0, 8)}
                                                            </span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {run.triggeredBy || 'Manual'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(run.startTime).toLocaleString()}
                                                            </span>
                                                            <span>{run.files?.length || 0} tests</span>
                                                            {run.duration_ms && (
                                                                <span className="font-mono">
                                                                    {(run.duration_ms / 1000).toFixed(1)}s
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 border hover:border-blue-500/30 hover:bg-blue-500/10"
                                                    >
                                                        <Terminal className="w-4 h-4 mr-2" />
                                                        View Logs
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:text-destructive hover:bg-red-500/10"
                                                        onClick={(e) => handleDelete(run.id, e)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </ScrollArea>

            {/* Detail View Dialog */}
            <Dialog open={!!selectedRun} onOpenChange={(open) => !open && setSelectedRun(null)}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 bg-card border-2">
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


