
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface RunDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    run: any;
}

export const RunDetails: React.FC<RunDetailsProps> = ({ isOpen, onClose, run }) => {
    if (!run) return null;

    const passCount = run.results?.filter((r: any) => r.status === 'passed').length || 0;
    const failCount = run.results?.filter((r: any) => r.status === 'failed').length || 0;
    const total = run.results?.length || 0;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        Run Details
                        <Badge variant={run.status === 'completed' ? 'default' : 'destructive'}>
                            {run.status.toUpperCase()}
                        </Badge>
                    </SheetTitle>
                    <SheetDescription>
                        Run ID: {run.id}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-center">
                            <div className="text-2xl font-bold text-emerald-500">{passCount}</div>
                            <div className="text-xs text-emerald-600 font-medium">PASSED</div>
                        </div>
                        <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">
                            <div className="text-2xl font-bold text-red-500">{failCount}</div>
                            <div className="text-xs text-red-600 font-medium">FAILED</div>
                        </div>
                        <div className="bg-slate-500/10 p-3 rounded-lg border border-slate-500/20 text-center">
                            <div className="text-2xl font-bold text-slate-500">{total}</div>
                            <div className="text-xs text-slate-600 font-medium">TOTAL</div>
                        </div>
                    </div>

                    {/* Results List */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3">File Results</h4>
                        <div className="space-y-2">
                            {run.results?.map((res: any, i: number) => (
                                <div key={i} className="border rounded-md p-3 text-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium truncate max-w-[200px]" title={res.file}>
                                            {res.file}
                                        </span>
                                        {res.status === 'passed' ? (
                                            <span className="flex items-center gap-1 text-emerald-500 text-xs font-semibold">
                                                <CheckCircle2 className="w-3 h-3" /> PASSED
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">
                                                <XCircle className="w-3 h-3" /> FAILED
                                            </span>
                                        )}
                                    </div>

                                    {/* Error Message if Failed */}
                                    {res.status === 'failed' && res.error && (
                                        <div className="bg-red-50 p-2 rounded text-xs text-red-600 font-mono mt-2 break-all">
                                            {res.error}
                                        </div>
                                    )}

                                    {/* Logs snippet if failed */}
                                    {res.status === 'failed' && res.logs && res.logs.length > 0 && (
                                        <div className="bg-slate-900 text-slate-300 p-2 rounded font-mono text-[10px] mt-2 max-h-20 overflow-y-auto">
                                            {res.logs.slice(-3).map((l: string, idx: number) => (
                                                <div key={idx}>{l}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Full Logs Preview */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3">System Logs</h4>
                        <ScrollArea className="h-[200px] w-full rounded-md border bg-slate-950 p-4">
                            <div className="text-xs font-mono text-slate-300">
                                {run.logs?.map((log: string, i: number) => (
                                    <div key={i} className="mb-1 border-b border-slate-800 pb-1 last:border-0">
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
