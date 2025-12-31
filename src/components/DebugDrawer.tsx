import { useState, useEffect } from 'react';
import { AlertCircle, X, ChevronUp, ChevronDown, Copy, Trash2, Globe, Activity, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type LogType = 'error' | 'warn' | 'log' | 'network';

interface LogEntry {
    id: string;
    type: LogType;
    message: string;
    timestamp: string;
    details?: string;
}

export function DebugDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [hasNewError, setHasNewError] = useState(false);

    // Auto-open on critical error?
    // const [autoOpen, setAutoOpen] = useState(true);

    useEffect(() => {
        // 1. Capture Console Errors
        const originalConsoleError = console.error;
        const originalConsoleWarn = console.warn;

        console.error = (...args) => {
            addLog('error', args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
            originalConsoleError.apply(console, args);
        };

        console.warn = (...args) => {
            addLog('warn', args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
            originalConsoleWarn.apply(console, args);
        };

        // 2. Global Window Errors
        const errorHandler = (event: ErrorEvent) => {
            addLog('error', `Uncaught Exception: ${event.message}`, event.error?.stack);
        };

        // 3. Unhandled Promise Rejections
        const rejectionHandler = (event: PromiseRejectionEvent) => {
            addLog('error', `Unhandled Promise Rejection: ${event.reason}`);
        };

        // 4. Network Errors (Basic Fetch Interceptor)
        // Note: This is an invasive patch, use with care. 
        // It's better to rely on React Query DevTools for detailed network inspection.
        // We will only listen for fetch failures here.
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                if (!response.ok) {
                    // Ignore chrome-extension errors (Quillbot, etc.)
                    if (String(args[0]).includes('chrome-extension://')) return response;

                    addLog('network', `HTTP ${response.status} ${response.statusText} - ${String(args[0])}`);
                }
                return response;
            } catch (error) {
                // Ignore chrome-extension errors
                if (String(args[0]).includes('chrome-extension://')) throw error;

                addLog('network', `Network Req Failed: ${String(args[0])}`, String(error));
                throw error;
            }
        };

        window.addEventListener('error', errorHandler);
        window.addEventListener('unhandledrejection', rejectionHandler);

        return () => {
            console.error = originalConsoleError;
            console.warn = originalConsoleWarn;
            window.removeEventListener('error', errorHandler);
            window.removeEventListener('unhandledrejection', rejectionHandler);
            window.fetch = originalFetch;
        };
    }, []);

    const addLog = (type: LogType, message: string, details?: string) => {
        const newLog: LogEntry = {
            id: Math.random().toString(36).substring(7),
            type,
            message,
            details,
            timestamp: new Date().toLocaleTimeString(),
        };

        setLogs(prev => [newLog, ...prev]);

        if (type === 'error' || type === 'network') {
            setHasNewError(true);
            // Optional: setIsOpen(true);
        }
    };

    const copyLogs = () => {
        const text = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message} ${l.details || ''}`).join('\n');
        navigator.clipboard.writeText(text);
        alert('Logs copied to clipboard');
    };

    const clearLogs = () => {
        setLogs([]);
        setHasNewError(false);
    };

    const errorCount = logs.filter(l => l.type === 'error' || l.type === 'network').length;

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-[100] transition-all duration-300 shadow-2xl font-mono ${isOpen ? 'h-[400px]' : 'h-10'}`}>

            {/* Status Bar */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`h-10 w-full flex items-center justify-between px-4 cursor-pointer select-none transition-colors 
        ${hasNewError ? 'bg-red-600 text-white' : 'bg-zinc-900/90 text-zinc-400 border-t border-zinc-800 backdrop-blur-md'}`}
            >
                <div className="flex items-center gap-3">
                    {hasNewError ? <AlertCircle className="h-4 w-4 animate-pulse" /> : <Activity className="h-4 w-4 text-green-500" />}
                    <span className="font-semibold text-xs tracking-wide">
                        SYSTEM MONITOR {errorCount > 0 ? `(${errorCount} ERRORS DETECTED)` : '- ONLINE'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Custom "TanStack" style toggler */}
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </div>
            </div>

            {/* Expanded Content */}
            {isOpen && (
                <div className="h-[360px] bg-zinc-950 text-zinc-300 flex flex-col border-t border-zinc-800">
                    <div className="flex bg-zinc-900 border-b border-zinc-800 px-2">
                        <Tabs defaultValue="all" className="w-full">
                            <div className="flex justify-between items-center h-10">
                                <TabsList className="bg-transparent h-8 p-0">
                                    <TabsTrigger value="all" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs px-3 h-7 rounded-sm">All ({logs.length})</TabsTrigger>
                                    <TabsTrigger value="errors" className="data-[state=active]:bg-red-900/30 data-[state=active]:text-red-400 text-xs px-3 h-7 rounded-sm">Errors ({errorCount})</TabsTrigger>
                                </TabsList>
                                <div className="flex gap-1 pr-2">
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-zinc-800 text-zinc-400" onClick={copyLogs} title="Copy Logs">
                                        <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-zinc-800 text-zinc-400 hover:text-red-400" onClick={clearLogs} title="Clear">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-zinc-800 text-zinc-400" onClick={() => setIsOpen(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <TabsContent value="all" className="m-0 h-[320px]">
                                <LogList logs={logs} />
                            </TabsContent>
                            <TabsContent value="errors" className="m-0 h-[320px]">
                                <LogList logs={logs.filter(l => l.type === 'error' || l.type === 'network')} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            )}
        </div>
    );
}

function LogList({ logs }: { logs: LogEntry[] }) {
    if (logs.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                <Terminal className="h-8 w-8 opacity-20" />
                <span className="text-xs">No logs captured... system clean.</span>
            </div>
        )
    }

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col font-mono text-xs divide-y divide-zinc-900">
                {logs.map((log) => (
                    <div key={log.id} className={`p-2 flex gap-3 hover:bg-zinc-900/50 ${log.type === 'error' ? 'bg-red-950/10 text-red-300' : ''}`}>
                        <div className="shrink-0 text-zinc-500 w-16">{log.timestamp}</div>
                        <div className="shrink-0 w-16 uppercase font-bold text-[10px] tracking-wider opacity-70">
                            {log.type === 'network' ? <span className="text-orange-400">NET</span> :
                                log.type === 'error' ? <span className="text-red-500">ERR</span> :
                                    log.type === 'warn' ? <span className="text-yellow-500">WARN</span> :
                                        'LOG'}
                        </div>
                        <div className="flex-1 break-all whitespace-pre-wrap">
                            {log.message}
                            {log.details && (
                                <div className="mt-1 text-zinc-500 text-[10px] pl-2 border-l-2 border-zinc-700">
                                    {log.details}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}
