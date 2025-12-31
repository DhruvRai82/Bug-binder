import { Terminal, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TerminalPanelProps {
    logs: string[];
}

export function TerminalPanel({ logs }: TerminalPanelProps) {
    return (
        <div className="h-full flex flex-col bg-background border-t border-border">
            <div className="h-9 min-h-[36px] flex items-center justify-between px-4 border-b border-border bg-muted/40">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Terminal className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Terminal / Console</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4 font-mono text-xs sm:text-sm bg-black/90 text-white dark:bg-black/40 dark:text-zinc-300">
                <div className="space-y-1">
                    {logs.map((log, i) => (
                        <div key={i} className="break-all border-l-2 border-transparent hover:border-primary/50 pl-2">
                            <span className="opacity-50 select-none mr-2 text-green-500">$</span>
                            {log}
                        </div>
                    ))}
                    {logs.length === 0 && <div className="text-zinc-500 italic">No output. Ready to run...</div>}
                </div>
            </ScrollArea>
        </div>
    );
}
