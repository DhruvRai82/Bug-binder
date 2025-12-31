import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayCircle, StopCircle, Save, MousePointer2, Type, Globe, Loader2, Radio, CheckCircle2, Video, Library } from 'lucide-react';
import { toast } from 'sonner';
import { useProject } from '@/context/ProjectContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { API_BASE_URL, api } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecordedScriptsLibrary from "./RecordedScriptsLibrary";
import { SaveRecordingDialog } from "@/components/SaveRecordingDialog";

interface RecordedStep {
    action: 'click' | 'type' | 'navigate' | 'scroll';
    selector?: string;
    value?: string;
    url?: string;
    timestamp: number;
}

export default function Recorder() {
    const { selectedProject } = useProject();
    const [url, setUrl] = useState('https://google.com');
    const [isRecording, setIsRecording] = useState(false);
    const [steps, setSteps] = useState<RecordedStep[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState("studio");

    useEffect(() => {
        const socketUrl = API_BASE_URL ? API_BASE_URL.replace('/api', '') : 'http://localhost:8081';
        const newSocket = io(socketUrl);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to recorder socket');
        });

        newSocket.on('record:step', (step: RecordedStep) => {
            setSteps(prev => [...prev, step]);
            // Auto-scroll to bottom
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

        setSteps([]); // Clear steps immediately before starting

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

    const [showSaveDialog, setShowSaveDialog] = useState(false);

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
            setActiveTab("library");
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
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 pb-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Video className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Recorder Studio</h1>
                            <p className="text-sm text-muted-foreground">Capture interactions and manage test scripts.</p>
                        </div>
                    </div>
                    {isRecording && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full border border-red-100 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-red-600" />
                            <span className="text-sm font-medium">Recording Live</span>
                        </div>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                        <TabsTrigger value="studio" className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            <span className="hidden sm:inline">Studio</span>
                        </TabsTrigger>
                        <TabsTrigger value="library" className="flex items-center gap-2">
                            <Library className="w-4 h-4" />
                            <span className="hidden sm:inline">Library</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="studio" className="h-[calc(100vh-13rem)] outline-none m-0">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pt-4">
                            {/* Controls Panel */}
                            <Card className="lg:col-span-4 h-fit border-0 shadow-lg bg-gradient-to-b from-card to-muted/20">
                                <CardHeader>
                                    <CardTitle>Configuration</CardTitle>
                                    <CardDescription>Setup your recording session</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/80">Target URL</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                placeholder="https://example.com"
                                                disabled={isRecording}
                                                className="pl-9 bg-background/50"
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        {!isRecording ? (
                                            <Button
                                                onClick={startRecording}
                                                className="w-full h-12 text-base shadow-md transition-all hover:scale-[1.02]"
                                                size="lg"
                                            >
                                                <PlayCircle className="mr-2 h-5 w-5" /> Start Recording
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={stopRecording}
                                                className="w-full h-12 text-base shadow-md transition-all hover:scale-[1.02]"
                                                variant="destructive"
                                                size="lg"
                                            >
                                                <StopCircle className="mr-2 h-5 w-5" /> Stop Recording
                                            </Button>
                                        )}

                                        <Button
                                            onClick={handleSaveClick}
                                            className="w-full h-12"
                                            variant="outline"
                                            disabled={isRecording || steps.length === 0}
                                        >
                                            <Save className="mr-2 h-4 w-4" /> Save Script
                                        </Button>
                                    </div>

                                    {steps.length > 0 && (
                                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                            <div className="flex items-center gap-2 text-primary mb-1">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="font-medium">Session Active</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {steps.length} steps captured. Ready to save.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Live Steps Panel */}
                            <Card className="lg:col-span-8 flex flex-col overflow-hidden border-0 shadow-lg h-full">
                                <CardHeader className="border-b bg-muted/30 pb-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-primary/10 rounded-md">
                                                <Radio className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle>Live Feed</CardTitle>
                                                <CardDescription>Real-time captured events</CardDescription>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="px-3 py-1 text-sm">
                                            {steps.length} Events
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-hidden p-0 bg-muted/10">
                                    <ScrollArea className="h-full p-6" ref={scrollRef}>
                                        <div className="space-y-3">
                                            {steps.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-20 opacity-60">
                                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                                        <MousePointer2 className="h-8 w-8" />
                                                    </div>
                                                    <h3 className="text-lg font-medium mb-1">No events yet</h3>
                                                    <p className="text-sm max-w-xs">Start recording and interact with the browser to see your actions appear here.</p>
                                                </div>
                                            ) : (
                                                steps.map((step, index) => (
                                                    <div
                                                        key={index}
                                                        className="group flex items-start gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                                                    >
                                                        <div className="mt-1 p-2 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                            {getIcon(step.action)}
                                                        </div>
                                                        <div className="flex-1 min-w-0 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-semibold capitalize text-foreground/90">{step.action}</span>
                                                                <span className="text-xs font-mono text-muted-foreground">
                                                                    {new Date(step.timestamp).toLocaleTimeString()}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm font-mono bg-muted/50 px-2 py-1 rounded text-muted-foreground break-all border border-transparent group-hover:border-border transition-colors">
                                                                {step.selector || step.url}
                                                            </div>
                                                            {step.value && (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <Badge variant="outline" className="text-xs font-normal bg-blue-50 text-blue-700 border-blue-200">
                                                                        Input: {step.value}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-xs font-mono text-muted-foreground/30 group-hover:text-muted-foreground/50">
                                                            #{String(index + 1).padStart(2, '0')}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="library" className="h-[calc(100vh-13rem)] outline-none m-0 overflow-auto">
                        <div className="pt-4">
                            <RecordedScriptsLibrary key={activeTab === 'library' ? 'active' : 'inactive'} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <SaveRecordingDialog
                open={showSaveDialog}
                onOpenChange={setShowSaveDialog}
                onSave={handleSaveConfirm}
            />
        </div>
    );
}
