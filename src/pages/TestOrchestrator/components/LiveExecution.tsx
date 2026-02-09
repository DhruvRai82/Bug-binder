/**
 * Module: LiveExecution (Premium Design)
 * Purpose: Real-time test execution display with rich visual feedback
 * Why: Replaces boring terminal logs with beautiful progress cards
 * Design: Progress bars, step indicators, animations, screenshot previews
 */

import { CheckCircle2, Loader2, Clock, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LiveExecutionProps {
    runData: {
        id: string;
        logs: string[];
        status: 'running' | 'completed' | 'failed' | 'cancelled';
        results?: any[];
        currentTest?: {
            name: string;
            index: number;
            total: number;
            steps: Array<{
                name: string;
                status: 'done' | 'running' | 'pending';
                duration?: number;
            }>;
        };
    };
    totalTests: number;
    progress: number;
}

/**
 * What: Premium live execution display
 * Why: Users need rich visual feedback during test execution
 * Design: Progress cards, step-by-step indicators, smooth animations
 */
export function LiveExecution({ runData, totalTests, progress }: LiveExecutionProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'from-green-500/20 to-emerald-500/10 border-green-500/30';
            case 'failed': return 'from-red-500/20 to-rose-500/10 border-red-500/30';
            case 'running': return 'from-blue-500/20 to-cyan-500/10 border-blue-500/30';
            default: return 'from-slate-500/20 to-slate-600/10 border-slate-500/30';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return { label: '✅ Completed', variant: 'default' as const };
            case 'failed': return { label: '❌ Failed', variant: 'destructive' as const };
            case 'running': return { label: '🔄 Running', variant: 'secondary' as const };
            default: return { label: '⏸️ Cancelled', variant: 'outline' as const };
        }
    };

    const statusBadge = getStatusBadge(runData.status);

    return (
        <div className="h-full flex flex-col gap-4 p-6">
            {/* Overall Progress Card */}
            <Card className={cn(
                "bg-gradient-to-br backdrop-blur-xl border-2 shadow-2xl",
                getStatusColor(runData.status)
            )}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold tracking-tight">Test Execution</h3>
                            <p className="text-sm text-muted-foreground">
                                Run ID: <span className="font-mono">{runData.id.slice(0, 8)}</span>
                            </p>
                        </div>
                        <Badge
                            variant={statusBadge.variant}
                            className={cn(
                                "text-sm font-semibold px-4 py-1.5",
                                runData.status === 'running' && "animate-pulse"
                            )}
                        >
                            {statusBadge.label}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Overall Progress</span>
                            <span className="font-mono text-muted-foreground">{Math.round(progress)}%</span>
                        </div>
                        <Progress
                            value={progress}
                            className="h-3 bg-muted/50"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{runData.results?.length || 0} / {totalTests} tests completed</span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Estimated: ~{Math.round((totalTests - (runData.results?.length || 0)) * 15)}s
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Current Test Card (if running) */}
            {runData.status === 'running' && runData.currentTest && (
                <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/30 backdrop-blur-xl border-2 border-blue-500/30 shadow-xl animate-in slide-in-from-bottom-4">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-bold">
                                    Test {runData.currentTest.index} of {runData.currentTest.total}
                                </h4>
                                <p className="text-sm text-muted-foreground font-mono">
                                    {runData.currentTest.name}
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Step List */}
                        <div className="space-y-2">
                            {runData.currentTest.steps.map((step, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "flex items-center gap-3 p-2 rounded-lg transition-all",
                                        step.status === 'running' && "bg-blue-500/10 animate-pulse"
                                    )}
                                >
                                    {step.status === 'done' && (
                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                    )}
                                    {step.status === 'running' && (
                                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                                    )}
                                    {step.status === 'pending' && (
                                        <div className="p-3 rounded-xl bg-muted/50 border shrink-0" />
                                    )}
                                    <span className={cn(
                                        "text-sm flex-1",
                                        step.status === 'done' && "text-muted-foreground",
                                        step.status === 'running' && "font-medium"
                                    )}>
                                        {step.name}
                                    </span>
                                    {step.duration && (
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {step.duration.toFixed(1)}s
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Test Results Summary */}
            {runData.results && runData.results.length > 0 && (
                <Card className="flex-1 bg-card/50 backdrop-blur-xl border-2 overflow-hidden">
                    <CardHeader className="pb-3 border-b">
                        <h4 className="text-base font-bold">Test Results</h4>
                    </CardHeader>
                    <ScrollArea className="h-full">
                        <CardContent className="p-4 space-y-2">
                            {runData.results.map((result: any, idx: number) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "p-3 rounded-lg border transition-all hover:shadow-lg",
                                        result.status === 'passed'
                                            ? "bg-green-500/5 border-green-500/30 hover:bg-green-500/10"
                                            : "bg-red-500/5 border-red-500/30 hover:bg-red-500/10"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1">
                                            {result.status === 'passed' ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{result.testName}</p>
                                                {result.error && (
                                                    <p className="text-xs text-red-400 mt-1 font-mono">{result.error}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {result.screenshot && (
                                                <button className="p-1.5 rounded bg-muted hover:bg-muted/80 transition-colors">
                                                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                                </button>
                                            )}
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {result.duration?.toFixed(1)}s
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </ScrollArea>
                </Card>
            )}

            {/* Logs (Collapsible) */}
            {runData.logs && runData.logs.length > 0 && (
                <Card className="bg-black/50 backdrop-blur-xl border-2 border-white/10">
                    <CardHeader className="pb-2">
                        <h4 className="text-sm font-bold text-muted-foreground">Console Logs</h4>
                    </CardHeader>
                    <ScrollArea className="h-32">
                        <CardContent className="p-3 font-mono text-xs space-y-1">
                            {runData.logs.map((log, idx) => {
                                // Handle both string and object logs
                                const logMessage = typeof log === 'object' && log !== null
                                    ? (log as any).message || JSON.stringify(log)
                                    : String(log);
                                return (
                                    <div key={idx} className="text-green-400/80">
                                        {logMessage}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </ScrollArea>
                </Card>
            )}
        </div>
    );
}
