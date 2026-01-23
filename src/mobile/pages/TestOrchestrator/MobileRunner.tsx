import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Layers, ChevronRight, RefreshCw, Folder, FileCode, Trash2, Save, X, ArrowLeft } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { ExecutionConsole } from '@/features/execution/ExecutionConsole';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileNode, FSNode, buildFileTree } from '@/pages/IDE/types';

export default function MobileRunner() {
    const { selectedProject } = useProject();
    const [suites, setSuites] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Run State
    const [activeRunId, setActiveRunId] = useState<string | null>(null);
    const [runData, setRunData] = useState<any>(null);

    // Config State
    const [selectedSuite, setSelectedSuite] = useState<any>(null); // If null, means "Custom Selection"
    const [configOpen, setConfigOpen] = useState(false);
    const [runConfig, setRunConfig] = useState({
        environment: 'local',
        browser: 'chrome',
        headless: true
    });

    // Explorer / Builder State
    const [explorerOpen, setExplorerOpen] = useState(false);
    const [fileSystem, setFileSystem] = useState<FileNode[]>([]);
    const [currentPath, setCurrentPath] = useState<FileNode[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Save Suite State
    const [saveOpen, setSaveOpen] = useState(false);
    const [newSuiteName, setNewSuiteName] = useState('');

    useEffect(() => {
        if (selectedProject) fetchSuites();
    }, [selectedProject]);

    const fetchSuites = async () => {
        try {
            setLoading(true);
            const data: any = await api.get(`/api/suites?projectId=${selectedProject?.id}`);
            setSuites(data);
        } catch { toast.error("Failed to load suites"); }
        finally { setLoading(false); }
    };

    const fetchFileSystem = async () => {
        if (!selectedProject || fileSystem.length > 0) return;
        try {
            const data = await api.get(`/api/fs?projectId=${selectedProject.id}`);
            setFileSystem(buildFileTree(data as FSNode[]));
        } catch { toast.error("Failed to load files"); }
    };

    const handleSuiteClick = (suite: any) => {
        setSelectedSuite(suite);
        setConfigOpen(true);
    };

    const handleDeleteSuite = async (id: string, e: any) => {
        e.stopPropagation();
        if (!confirm("Delete this suite?")) return;
        try {
            await api.delete(`/api/suites/${id}?projectId=${selectedProject?.id}`);
            toast.success("Suite deleted");
            setSuites(prev => prev.filter(s => s.id !== id));
        } catch { toast.error("Delete failed"); }
    };

    // Explorer Navigation
    const currentItems = currentPath.length === 0 ? fileSystem : (currentPath[currentPath.length - 1].children || []);

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleSaveSuite = async () => {
        if (!newSuiteName.trim()) return;
        try {
            await api.post('/api/suites', {
                projectId: selectedProject?.id,
                name: newSuiteName,
                fileIds: Array.from(selectedIds)
            });
            toast.success("Suite Saved");
            setSaveOpen(false);
            setExplorerOpen(false);
            setNewSuiteName('');
            setSelectedIds(new Set());
            fetchSuites();
        } catch { toast.error("Save failed"); }
    };

    const handleStartRun = async () => {
        if (!selectedProject) return;

        let fileIds: string[] = [];
        if (selectedSuite) {
            fileIds = selectedSuite.fileIds;
        } else {
            // Custom Selection
            fileIds = Array.from(selectedIds);
        }

        if (fileIds.length === 0) return toast.error("No tests selected");

        setConfigOpen(false);
        setExplorerOpen(false); // Close explorer if open

        try {
            toast.info(`Starting execution (${fileIds.length} tests)...`);
            const response: any = await api.post('/api/runner/batch-execute', {
                projectId: selectedProject.id,
                fileIds,
                config: runConfig,
                source: 'orchestrator'
            });
            setActiveRunId(response.runId);
            setRunData({ id: response.runId, status: 'running', logs: ['Initializing...'] });
        } catch { toast.error("Run Failed"); }
    };

    // Polling Logic
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (activeRunId && selectedProject) {
            const poll = async () => {
                try {
                    const data: any = await api.get(`/api/runner/run/${activeRunId}?projectId=${selectedProject.id}`);
                    setRunData(data);
                    if (data.status !== 'running') {
                        clearInterval(pollingRef.current!);
                        setActiveRunId(null);
                        toast.success(`Run ${data.status}`);
                    }
                } catch { }
            };
            pollingRef.current = setInterval(poll, 1000);
            return () => clearInterval(pollingRef.current!);
        }
    }, [activeRunId, selectedProject]);

    return (
        <div className="space-y-4 pb-20">
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 flex items-center justify-between" onClick={() => { setExplorerOpen(true); fetchFileSystem(); }}>
                <div>
                    <h3 className="font-semibold text-primary flex items-center gap-2">
                        <Layers className="w-5 h-5" /> Test Explorer
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">Browse files & build custom runs.</p>
                </div>
                <Button size="sm" variant="secondary">Browse</Button>
            </div>

            {/* Suites List */}
            {loading ? (
                <div className="text-center py-8">Loading suites...</div>
            ) : suites.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    No Saved Suites.
                    <br /><span className="text-xs">Create suites on Desktop to run them here.</span>
                </div>
            ) : (
                suites.map(suite => (
                    <Card key={suite.id} className="active:scale-[0.98] transition-transform" onClick={() => handleSuiteClick(suite)}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-full">
                                    <Play className="w-4 h-4 fill-current" />
                                </div>
                                <div>
                                    <div className="font-medium">{suite.name}</div>
                                    <div className="text-xs text-muted-foreground">{suite.fileIds.length} Tests</div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={(e) => handleDeleteSuite(suite.id, e)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))
            )}

            {/* Config Dialog */}
            <Drawer open={configOpen} onOpenChange={setConfigOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Run Configuration</DrawerTitle>
                        <DrawerDescription>{selectedSuite?.name || `${selectedIds.size} files selected`}</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 space-y-6">
                        <div className="space-y-3">
                            <Label>Environment</Label>
                            <RadioGroup value={runConfig.environment} onValueChange={v => setRunConfig({ ...runConfig, environment: v })} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="local" id="local" />
                                    <Label htmlFor="local">Local</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="staging" id="staging" />
                                    <Label htmlFor="staging">Staging</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-3">
                            <Label>Browser</Label>
                            <RadioGroup value={runConfig.browser} onValueChange={v => setRunConfig({ ...runConfig, browser: v })} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="chrome" id="chrome" />
                                    <Label htmlFor="chrome">Chrome</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="firefox" id="firefox" />
                                    <Label htmlFor="firefox">Firefox</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="flex items-center justify-between border rounded-lg p-3">
                            <Label htmlFor="headless" className="flex-1">Headless Mode</Label>
                            <Switch id="headless" checked={runConfig.headless} onCheckedChange={c => setRunConfig({ ...runConfig, headless: c })} />
                        </div>
                    </div>
                    <DrawerFooter>
                        <Button onClick={handleStartRun} className="bg-green-600 hover:bg-green-700">Start Execution</Button>
                        <DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* Explorer Drawer (Full Screen) */}
            <Drawer open={explorerOpen} onOpenChange={setExplorerOpen}>
                <DrawerContent className="h-[95vh]">
                    <div className="h-full flex flex-col">
                        <DrawerHeader className="border-b shrink-0 flex items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                {currentPath.length > 0 ? (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => setCurrentPath(prev => prev.slice(0, prev.length - 1))}>
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                ) : <Layers className="w-5 h-5 text-muted-foreground" />}
                                <DrawerTitle>{currentPath.length > 0 ? currentPath[currentPath.length - 1].name : 'Test Files'}</DrawerTitle>
                            </div>
                            <Badge variant="secondary">{selectedIds.size} Selected</Badge>
                        </DrawerHeader>

                        {/* File List */}
                        <div className="flex-1 overflow-y-auto p-2">
                            {currentItems.map(node => (
                                <div key={node.id} className="flex items-center justify-between p-3 border-b last:border-0 active:bg-muted" onClick={() => {
                                    if (node.type === 'folder') setCurrentPath([...currentPath, node]);
                                    else toggleSelection(node.id);
                                }}>
                                    <div className="flex items-center gap-3">
                                        {node.type === 'folder' ? <Folder className="w-5 h-5 text-amber-500" /> : <FileCode className="w-5 h-5 text-blue-500" />}
                                        <span className="text-sm font-medium">{node.name}</span>
                                    </div>
                                    {node.type === 'file' && (
                                        <Checkbox
                                            checked={selectedIds.has(node.id)}
                                            onCheckedChange={() => toggleSelection(node.id)}
                                            onClick={(e) => { e.stopPropagation(); toggleSelection(node.id); }}
                                        />
                                    )}
                                </div>
                            ))}
                            {currentItems.length === 0 && <div className="text-center py-10 text-muted-foreground">Empty folder</div>}
                        </div>

                        {/* Actions Bar */}
                        <div className="border-t p-4 bg-muted/10 shrink-0 space-y-3">
                            {saveOpen ? (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="Suite Name (e.g. Smoke Tests)"
                                            value={newSuiteName}
                                            onChange={e => setNewSuiteName(e.target.value)}
                                            autoFocus
                                        />
                                        <Button size="icon" variant="ghost" onClick={() => setSaveOpen(false)}><X className="w-4 h-4" /></Button>
                                    </div>
                                    <Button className="w-full" onClick={handleSaveSuite} disabled={!newSuiteName.trim()}>Save Suite</Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        disabled={selectedIds.size === 0}
                                        onClick={() => setSaveOpen(true)}
                                    >
                                        <Save className="w-4 h-4 mr-2" /> Save
                                    </Button>
                                    <Button
                                        className="flex-[2] bg-primary"
                                        disabled={selectedIds.size === 0}
                                        onClick={() => { setSelectedSuite(null); setConfigOpen(true); }}
                                    >
                                        <Play className="w-4 h-4 mr-2" /> Run Selected
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Active Run Drawer */}
            <Drawer open={!!runData} onOpenChange={(o) => { if (!o && !activeRunId) setRunData(null); }}>
                <DrawerContent className="h-[90vh]">
                    <div className="h-full flex flex-col">
                        <DrawerHeader className="border-b shrink-0">
                            <DrawerTitle className="flex items-center gap-2">
                                {activeRunId ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                Execution Console
                            </DrawerTitle>
                        </DrawerHeader>
                        <div className="flex-1 overflow-hidden bg-black p-0">
                            {runData && (
                                <ExecutionConsole
                                    runId={runData.id}
                                    logs={runData.logs || []}
                                    status={runData.status}
                                    progress={100}
                                    aiAnalysis={runData.ai_analysis}
                                />
                            )}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
