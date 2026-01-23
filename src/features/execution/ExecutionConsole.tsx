
import React, { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { AIFailureAnalysis } from '@/features/ai/AIFailureAnalysis';

interface AIAnalysis {
    failureReason: string;
    technicalRootCause: string;
    suggestedFix: string;
    confidenceScore: number;
}

interface LogEntry {
    timestamp?: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    metadata?: any;
}

interface ExecutionConsoleProps {
    runId: string;
    logs: (string | LogEntry)[];
    status: 'running' | 'completed' | 'failed';
    progress?: number; // 0-100
    aiAnalysis?: AIAnalysis;
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({ runId, logs, status, progress = 0, aiAnalysis }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const renderLogLine = (log: string | LogEntry, i: number) => {
        const isObj = typeof log === 'object';
        const message = isObj ? (log as LogEntry).message : (log as string);
        const level = isObj ? (log as LogEntry).level :
            (message.toLowerCase().includes('error') ? 'error' :
                message.toLowerCase().includes('warn') ? 'warn' : 'info');
        const timestamp = isObj && (log as LogEntry).timestamp ? (log as LogEntry).timestamp : new Date().toISOString(); // Fallback

        const timeStr = new Date(timestamp!).toLocaleTimeString();

        return (
            <div key={i} className="break-words whitespace-pre-wrap font-mono text-xs flex gap-2">
                <span className="text-slate-500 min-w-[80px] select-none">[{timeStr}]</span>
                <span className={
                    level === 'error' ? 'text-red-400 font-bold' :
                        level === 'warn' ? 'text-amber-400' :
                            level === 'debug' ? 'text-blue-400' :
                                'text-slate-300'
                }>
                    {message}
                </span>
            </div>
        );
    };

    return (
        <Card className="w-full h-full bg-slate-950 border-slate-800 text-slate-200 flex flex-col shadow-2xl">
            <CardHeader className="py-3 px-4 border-b border-slate-800 flex flex-row items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <CardTitle className="text-sm font-mono text-emerald-400">
                        EXECUTION_CONSOLE
                    </CardTitle>
                    <span className="text-xs text-slate-500 font-mono ml-2">ID: {runId?.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-3">
                    {status === 'running' && (
                        <div className="flex items-center gap-2 text-xs text-amber-400 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            RUNNING
                        </div>
                    )}
                    {status === 'completed' && (
                        <div className="flex items-center gap-2 text-xs text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            COMPLETED
                        </div>
                    )}
                    {status === 'failed' && (
                        <div className="flex items-center gap-2 text-xs text-red-400">
                            <XCircle className="w-4 h-4" />
                            FAILED
                        </div>
                    )}
                </div>
            </CardHeader>

            {/* Progress Bar */}
            {status === 'running' && (
                <div className="h-1 w-full bg-slate-900">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <CardContent className="flex-1 p-0 overflow-hidden font-mono text-xs relative flex flex-col">
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div
                        ref={scrollRef}
                        className="flex-1 w-full overflow-y-auto p-4 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                    >
                        {logs.length === 0 && (
                            <div className="text-slate-600 italic">Waiting for logs...</div>
                        )}
                        {logs.map((log, i) => renderLogLine(log, i))}

                        {status === 'running' && (
                            <div className="animate-pulse text-emerald-500/50">_</div>
                        )}
                    </div>
                </div>

                {status === 'failed' && aiAnalysis && (
                    <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                        <AIFailureAnalysis analysis={aiAnalysis} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
