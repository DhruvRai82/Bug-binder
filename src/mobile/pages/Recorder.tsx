
import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Play, Eye, Trash2, Clock, CheckCircle2, XCircle, FileText, Calendar, CloudLightning, MoreVertical, Download, Video, Plus } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface RecordedScript {
    id: string;
    projectId: string;
    name: string;
    module: string;
    steps: any[];
    createdAt: string;
}

export function MobileRecorder() {
    const { selectedProject } = useProject();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'library' | 'studio'>('library');
    const [scripts, setScripts] = useState<RecordedScript[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedScript, setSelectedScript] = useState<RecordedScript | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Execution State
    const [isPlaying, setIsPlaying] = useState<string | null>(null);

    useEffect(() => {
        if (selectedProject && user) loadScripts();
    }, [selectedProject, user]);

    const loadScripts = async () => {
        try {
            // Explicitly pass userId in query as fallback, though api() sends headers
            const uid = user?.uid || '';
            const url = selectedProject
                ? `/api/recorder/list?projectId=${selectedProject.id}&userId=${uid}`
                : `/api/recorder/list?userId=${uid}`;

            const data = await api.get(url);
            setScripts(data);
        } catch (error) {
            console.error('Failed to load scripts', error);
            // Don't show toast on load error to avoid spam if backend is offline
        }
    };

    const handlePlay = async (script: RecordedScript) => {
        if (!confirm(`Run "${script.name}" on cloud runner?`)) return;
        setIsPlaying(script.id);
        try {
            const result = await api.post('/api/runner/execute', {
                scriptId: script.id,
                projectId: selectedProject?.id,
                source: 'manual'
            });
            if (result.runId) toast.success('Execution started in background');
            else toast.error('Failed to start');
        } catch (error) {
            toast.error('Error starting execution');
        } finally {
            setIsPlaying(null);
        }
    };

    const handleDelete = async () => {
        if (!selectedScript || !selectedProject) return;
        if (!confirm("Delete this script?")) return;
        try {
            await api.delete(`/api/recorder/${selectedScript.id}?projectId=${selectedProject.id}`);
            setScripts(prev => prev.filter(s => s.id !== selectedScript.id));
            setIsDetailsOpen(false);
            toast.success("Deleted");
        } catch (e) { toast.error("Delete failed"); }
    };

    const handleExport = async (id: string, format: 'side' | 'java' | 'python') => {
        try {
            const response = await api.download(`/api/recorder/export/${id}/${format}`);
            const url = window.URL.createObjectURL(response);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${id}.${format === 'side' ? 'side' : format === 'java' ? 'java' : 'py'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success(`Exported as ${format.toUpperCase()}`);
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const filteredScripts = scripts.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.module.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-background pb-16">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-background/95 backdrop-blur z-10 sticky top-0">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-xl font-bold">Web Recorder</h1>
                        <p className="text-xs text-muted-foreground">Manage your automated scripts</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-muted/20 rounded-xl mb-3 border">
                    <button onClick={() => setActiveTab('library')} className={cn("flex-1 py-1.5 text-sm font-medium rounded-lg transition-all", activeTab === 'library' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>
                        Library
                    </button>
                    <button onClick={() => setActiveTab('studio')} className={cn("flex-1 py-1.5 text-sm font-medium rounded-lg transition-all", activeTab === 'studio' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>
                        Studio
                    </button>
                </div>

                {activeTab === 'library' && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search scripts..." className="pl-9 bg-muted/50 border-none rounded-xl" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/5">
                {activeTab === 'library' ? (
                    <>
                        {filteredScripts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50 space-y-3">
                                <div className="p-4 bg-muted/50 rounded-full"><CloudLightning className="h-8 w-8" /></div>
                                <p>No scripts found</p>
                            </div>
                        ) : (
                            filteredScripts.map(script => (
                                <Card key={script.id} className="active:scale-[0.99] transition-all border-border/50 shadow-sm" onClick={() => { setSelectedScript(script); setIsDetailsOpen(true); }}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg"><FileText className="h-4 w-4" /></div>
                                                <div>
                                                    <h3 className="font-semibold text-sm leading-none mb-1">{script.name}</h3>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                        <Calendar className="h-3 w-3" /> {new Date(script.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="text-[10px] font-normal">{script.module}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-dashed">
                                            <span className="text-xs font-mono text-muted-foreground">{script.steps.length} Steps</span>
                                            <div className="flex items-center gap-1 text-xs font-medium text-primary">
                                                View Details <Eye className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                        <div className="p-6 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full mb-2">
                            <Video className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-bold">Studio Unavailable</h3>
                        <p className="text-muted-foreground text-sm max-w-xs">
                            Live recording requires the Desktop application to interact with the browser engine directly.
                        </p>
                        <Button variant="outline" className="mt-4" onClick={() => setActiveTab('library')}>
                            Return to Library
                        </Button>
                    </div>
                )}
            </div>

            {/* Details Drawer */}
            <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DrawerContent className="max-h-[95vh] flex flex-col">
                    <DrawerHeader className="border-b pb-4 shrink-0">
                        <div className="flex items-center justify-between mb-2">
                            <DrawerTitle className="text-left py-1">{selectedScript?.name}</DrawerTitle>
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Export As</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => selectedScript && handleExport(selectedScript.id, 'side')}>Selenium (.side)</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => selectedScript && handleExport(selectedScript.id, 'java')}>Java</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => selectedScript && handleExport(selectedScript.id, 'python')}>Python</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm" onClick={() => selectedScript && handlePlay(selectedScript)}>
                                <Play className="h-4 w-4 mr-2" /> Run in Cloud
                            </Button>
                        </div>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto p-0 bg-muted/5">
                        <div className="px-4 py-4 space-y-4">
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                                <span>Steps Sequence</span>
                                <span>{selectedScript?.steps.length} Steps</span>
                            </div>
                            <div className="space-y-3">
                                {selectedScript?.steps.map((step: any, idx: number) => (
                                    <div key={idx} className="flex gap-3 text-sm bg-card p-3 rounded-xl border shadow-sm">
                                        <div className="font-mono text-muted-foreground text-xs pt-1 opacity-50 text-right w-4">{idx + 1}</div>
                                        <div className="space-y-1.5 min-w-0 flex-1">
                                            <div className="font-medium flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase font-bold tracking-wide border-primary/20 text-primary bg-primary/5">{step.command || step.action}</Badge>
                                                <span className="truncate font-mono text-xs">{step.target || step.selector}</span>
                                            </div>
                                            {step.value && <div className="text-muted-foreground font-mono text-xs break-all bg-muted/50 px-2 py-1.5 rounded-md border border-border/50"><strong>Val:</strong> {step.value}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild><Button variant="outline">Close details</Button></DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
