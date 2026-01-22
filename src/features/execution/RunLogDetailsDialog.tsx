import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, X, Info, AlertTriangle, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface RunLogDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    run: any;
}

export function RunLogDetailsDialog({ isOpen, onClose, run }: RunLogDetailsDialogProps) {
    if (!run) return null;

    const logs = Array.isArray(run.logs) ? run.logs : [];

    const getLogIcon = (status: string, action: string) => {
        if (status === 'fail' || status === 'error') return <X className="w-3.5 h-3.5 text-red-500" />;
        if (status === 'pass') return <Check className="w-3.5 h-3.5 text-green-500" />;
        if (status === 'warning') return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />;
        if (action === 'start' || action === 'end') return <Terminal className="w-3.5 h-3.5 text-blue-500" />;
        return <Info className="w-3.5 h-3.5 text-muted-foreground" />;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b bg-muted/20">
                    <div className="flex items-center justify-between">
                        <DialogTitle>Execution Logs</DialogTitle>
                        <Badge variant={run.status === 'completed' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}>
                            {run.status.toUpperCase()}
                        </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                        ID: {run.id}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                        {logs.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                No logs available for this run.
                            </div>
                        )}

                        {logs.map((log: any, i: number) => {
                            // Handle legacy string logs
                            const isString = typeof log === 'string';
                            const message = isString ? log : log.message;
                            const timestamp = isString ? null : log.timestamp;
                            const status = isString ? 'info' : (log.status || 'info');
                            const action = isString ? 'log' : (log.action || 'log');

                            return (
                                <div key={i} className={cn(
                                    "flex gap-3 text-sm p-2 rounded hover:bg-muted/50 transition-colors border-l-2",
                                    status === 'fail' ? "border-red-500 bg-red-500/5" :
                                        status === 'pass' ? "border-green-500 bg-green-500/5" :
                                            status === 'warning' ? "border-yellow-500" :
                                                "border-transparent"
                                )}>
                                    <div className="mt-0.5 shrink-0">
                                        {getLogIcon(status, action)}
                                    </div>
                                    <div className="flex-1 min-w-0 grid gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("font-medium text-xs uppercase tracking-wider opacity-70",
                                                status === 'fail' ? "text-red-500" : "text-foreground"
                                            )}>
                                                {action}
                                            </span>
                                            {timestamp && (
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    {new Date(timestamp).toLocaleTimeString()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="font-mono text-xs whitespace-pre-wrap break-words text-foreground/90">
                                            {message}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
