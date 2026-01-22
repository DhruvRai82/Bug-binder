import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayCircle, StopCircle, Save, MousePointer2, Type, Globe, Radio, CheckCircle2, Video } from 'lucide-react';
import { toast } from 'sonner';
import { useProject } from '@/context/ProjectContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { API_BASE_URL, api } from '@/lib/api';
import { SaveRecordingDialog } from "@/components/common/SaveRecordingDialog";

interface RecordedStep {
    action: 'click' | 'type' | 'navigate' | 'scroll';
    selector?: string;
    value?: string;
    url?: string;
    timestamp: number;
}

interface RecorderStudioProps {
    onSaveComplete?: () => void;
}

export function RecorderStudio({ onSaveComplete }: RecorderStudioProps) {
    const { selectedProject } = useProject();
    const [url, setUrl] = useState('https://google.com');
    const [isRecording, setIsRecording] = useState(false);
    const [steps, setSteps] = useState<RecordedStep[]>([]);
    const [_socket, setSocket] = useState<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Ensure we strip /api from the base URL if present to get the root for Socket.IO
        const baseUrl = API_BASE_URL?.endsWith('/api') ? API_BASE_URL.replace('/api', '') : API_BASE_URL;
        const socketUrl = baseUrl || 'http://localhost:8081';

        console.log('[RecorderStudio] Connecting to socket at:', socketUrl);

        const newSocket = io(socketUrl, {
            reconnection: true,
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling']
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('[RecorderStudio] Socket Connected:', newSocket.id);
            setIsConnected(true);
            toast.success('Connected to Recorder Server');
        });

        newSocket.on('disconnect', (reason) => {
            console.log('[RecorderStudio] Socket Disconnected:', reason);
            setIsConnected(false);
            if (reason === 'io server disconnect') {
                newSocket.connect();
            }
        });

        newSocket.on('connect_error', (err) => {
            console.error('[RecorderStudio] Socket Connection Error:', err);
            toast.error(`Connection Error: ${err.message}`);
        });

        newSocket.on('record:step', (step: RecordedStep) => {
            console.log('[RecorderStudio] Received Step:', step); // Debug log
            setSteps(prev => [...prev, step]);
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 100);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const startRecording = async () => {
        if (!url) {
            toast.error('Please enter a URL');
            return;
        }
        setSteps([]);
        try {
            await api.post('/api/recorder/start', { url });
            setIsRecording(true);
            toast.success('Recording started');
        } catch (error) {
            console.error(error);
            toast.error('Failed to start recording');
        }
    };

    const stopRecording = async () => {
        try {
            await api.post('/api/recorder/stop', {});
            setIsRecording(false);
            toast.success('Recording stopped');
        } catch (error) {
            console.error(error);
            toast.error('Error stopping recording');
        }
    };

    const handleSaveClick = () => {
        if (!selectedProject) {
            toast.error('Please select a project first');
            return;
        }
        setShowSaveDialog(true);
    };

    const handleSaveConfirm = async (name: string, module: string) => {
        try {
            await api.post('/api/recorder/save', {
                name,
                module,
                steps,
                projectId: selectedProject?.id,
                userId: 'test-user-id'
            });

            toast.success('Recording saved successfully');
            setIsRecording(false);
            setSteps([]);
            if (onSaveComplete) onSaveComplete();
        } catch (error) {
            console.error(error);
            toast.error('Error saving recording');
        }
    };

    const getIcon = (action: string) => {
        switch (action) {
            case 'click': return <MousePointer2 className="h-4 w-4 text-blue-500" />;
            case 'type': return <Type className="h-4 w-4 text-green-500" />;
            case 'navigate': return <Globe className="h-4 w-4 text-purple-500" />;
            default: return <Radio className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="h-full flex flex-col p-6 animate-in fade-in duration-500 bg-background/50">
            {/* Premium Header - Unified Blue Theme */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
                        <Video className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Recorder Studio
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground mt-0.5">
                            Capture user interactions and generate automated test scripts.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`px-3 py-1 ${isConnected ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {isConnected ? '● Connected' : '○ Disconnected'}
                    </Badge>
                    {isRecording && (
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full border border-red-100 dark:border-red-900/50 shadow-sm animate-pulse">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </div>
                            <span className="text-sm font-bold tracking-wide uppercase">Recording Live</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full flex-1 min-h-0">
                {/* Floating Controls Sidebar */}
                {/* Controls Panel - Floating Glass */}
                <Card className="lg:col-span-4 h-fit border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                        <CardDescription>Setup your recording session</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground ml-1">Target Application</label>
                            <div className="relative group">
                                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="pl-10 h-11 bg-background/50 border-input focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {!isRecording ? (
                                <Button
                                    onClick={startRecording}
                                    disabled={isRecording}
                                    className="w-full h-12 text-lg font-bold shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] rounded-xl"
                                >
                                    <PlayCircle className="mr-2 h-5 w-5" />
                                    Start Recording
                                </Button>
                            ) : (
                                <Button
                                    onClick={stopRecording}
                                    className="w-full h-14 text-lg font-bold shadow-xl shadow-gray-500/20 bg-white text-destructive border-2 border-destructive/10 hover:bg-destructive/5 rounded-2xl transition-all hover:scale-[1.02]"
                                    variant="ghost"
                                >
                                    <StopCircle className="mr-2 h-6 w-6" /> Stop Recording
                                </Button>
                            )}

                            <Button
                                onClick={handleSaveClick}
                                className="w-full h-12 rounded-xl border-dashed border-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all"
                                variant="outline"
                                disabled={isRecording || steps.length === 0}
                            >
                                <Save className="mr-2 h-4 w-4" /> Save Script
                            </Button>
                        </div>

                        {steps.length > 0 && (
                            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-2xl border border-red-100 dark:border-red-900/30">
                                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="font-bold text-sm">Session Active</span>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium ml-6">
                                    {steps.length} steps captured. Ready to save.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Floating Live Terminal / Feed */}
                <Card className="lg:col-span-8 flex flex-col border-0 shadow-2xl bg-gray-900/95 dark:bg-black/80 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-white/10 text-gray-300">
                    <CardHeader className="border-b border-white/10 bg-white/5 pb-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="ml-2">
                                    <CardTitle className="text-base text-gray-100 font-mono tracking-tight">Live Event Stream</CardTitle>
                                    <CardDescription className="text-xs text-gray-500">Listening for browser events...</CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="px-3 py-1 text-xs font-mono bg-white/5 border-white/10 text-gray-400">
                                {steps.length} EVENTS
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0 relative">
                        <div className="absolute inset-0 bg-dotted-pattern opacity-5 pointer-events-none" />
                        <ScrollArea className="h-full p-6" ref={scrollRef}>
                            <div className="space-y-2 font-mono text-sm">
                                {steps.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-600 py-32">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                            <MousePointer2 className="h-6 w-6 opacity-50" />
                                        </div>
                                        <h3 className="text-base font-medium mb-1 text-gray-400">Waiting for events...</h3>
                                        <p className="text-xs opacity-60 max-w-xs">Interactions will appear here in real-time.</p>
                                    </div>
                                ) : (
                                    steps.map((step, index) => (
                                        <div
                                            key={index}
                                            className="group flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/5"
                                        >
                                            <div className="text-xs text-gray-600 mt-1 w-8">
                                                {String(index + 1).padStart(2, '0')}
                                            </div>
                                            <div className="mt-1">
                                                {getIcon(step.action)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-bold text-xs uppercase tracking-wider ${step.action === 'click' ? 'text-blue-400' :
                                                        step.action === 'type' ? 'text-green-400' :
                                                            'text-purple-400'
                                                        }`}>
                                                        {step.action}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(step.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <div className="text-gray-400 mt-1 break-all bg-black/30 px-2 py-1 rounded border border-white/5 text-xs">
                                                    {step.selector || step.url}
                                                </div>
                                                {step.value && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs text-green-400/80 bg-green-900/20 px-2 py-0.5 rounded border border-green-900/30">
                                                            Input: {step.value}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <SaveRecordingDialog
                open={showSaveDialog}
                onOpenChange={setShowSaveDialog}
                onSave={handleSaveConfirm}
            />
        </div>
    );
}
