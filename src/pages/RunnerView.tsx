import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, RefreshCw, Filter, FileText, ChevronRight, ChevronDown, Folder, FileCode } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { FSNode, FileNode, buildFileTree } from './IDE/types';
import { toast } from 'sonner';

// New Components
import { ExecutionConsole } from '@/features/execution/ExecutionConsole';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, Save, Play, Settings2, Globe, Laptop, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Recursive Tree Item Component
const FileTreeItem = ({
    node,
    level = 0,
    selectedIds,
    onToggle
}: {
    node: FileNode,
    level?: number,
    selectedIds: Set<string>,
    onToggle: (id: string, checked: boolean) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const isChecked = selectedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    const handleCheck = (checked: boolean) => {
        onToggle(node.id, checked);
    };

    return (
        <div>
            <div
                className="flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded cursor-pointer select-none"
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                {/* Expand Toggle */}
                <div
                    className="w-4 h-4 flex items-center justify-center shrink-0"
                    onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                >
                    {hasChildren && (
                        isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                    )}
                </div>

                {/* Checkbox */}
                <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheck(checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                />

                {/* Icon & Name */}
                <div className="flex items-center gap-2 overflow-hidden" onClick={() => hasChildren && setIsOpen(!isOpen)}>
                    {node.type === 'folder' ? (
                        <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                        <FileCode className="w-4 h-4 text-blue-500 shrink-0" />
                    )}
                    <span className="text-sm truncate">{node.name}</span>
                </div>
            </div>

            {/* Children */}
            {isOpen && hasChildren && (
                <div>
                    {node.children!.map(child => (
                        <FileTreeItem
                            key={child.id}
                            node={child}
                            level={level + 1}
                            selectedIds={selectedIds}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function RunnerView() {
    const { selectedProject } = useProject();
    const [fileSystem, setFileSystem] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Run State
    const [activeRunId, setActiveRunId] = useState<string | null>(null);
    const [currentRunData, setCurrentRunData] = useState<any>(null);

    // Details Drawer
    const [viewRunId, setViewRunId] = useState<string | null>(null);
    const [viewRunData, setViewRunData] = useState<any>(null);

    // Suites & History State
    const [suites, setSuites] = useState<any[]>([]);
    const [historyRuns, setHistoryRuns] = useState<any[]>([]);
    const [suiteName, setSuiteName] = useState("");
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

    // Run Configuration State
    const [runConfig, setRunConfig] = useState({
        environment: 'local', // local, staging, prod
        browser: 'chrome',    // chrome, firefox, edge
        headless: false,
        parallel: 1
    });

    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const fetchSuites = async () => {
        if (!selectedProject) return;
        try {
            const data: any = await api.get(`/api/suites?projectId=${selectedProject.id}`);
            setSuites(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load suites");
        }
    };

    const fetchHistory = async () => {
        if (!selectedProject) return;
        try {
            const data: any = await api.get(`/api/runner/runs/${selectedProject.id}`);
            setHistoryRuns(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load history");
        }
    };

    useEffect(() => {
        if (selectedProject) {
            fetchSuites();
            fetchHistory();
        }
    }, [selectedProject]);

    const handleSaveSuite = async () => {
        if (!suiteName || selectedIds.size === 0) return;
        try {
            await api.post('/api/suites', {
                projectId: selectedProject?.id,
                name: suiteName,
                fileIds: Array.from(selectedIds)
            });
            toast.success("Suite saved!");
            setIsSaveDialogOpen(false);
            setSuiteName("");
            fetchSuites(); // Refresh list
        } catch (error) {
            toast.error("Failed to save suite");
        }
    };

    const handleDeleteSuite = async (id: string, e?: any) => {
        e?.stopPropagation();
        if (!confirm("Delete this suite?")) return;
        try {
            await api.delete(`/api/suites/${id}?projectId=${selectedProject?.id}`);
            toast.success("Suite deleted");
            fetchSuites();
        } catch (error) {
            toast.error("Failed to delete suite");
        }
    };

    const loadSuite = (suite: any) => {
        // Load IDs
        setSelectedIds(new Set(suite.fileIds));
        toast.info(`Loaded suite: ${suite.name}`);
    };

    const fetchFiles = async () => {
        if (!selectedProject) return;
        setLoading(true);
        try {
            const data = await api.get(`/api/fs?projectId=${selectedProject.id}`);
            const tree = buildFileTree(data as FSNode[]);
            setFileSystem(tree);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load files");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
        fetchSuites();
    }, [selectedProject?.id]);

    // Polling Logic
    useEffect(() => {
        if (activeRunId && selectedProject) {
            // Start Polling
            const poll = async () => {
                try {
                    const data: any = await api.get(`/api/runner/run/${activeRunId}?projectId=${selectedProject.id}`);
                    setCurrentRunData(data);

                    if (data.status !== 'running') {
                        // Stop Polling
                        if (pollingRef.current) clearInterval(pollingRef.current);
                        pollingRef.current = null;
                        setActiveRunId(null);
                        toast.success(`Run ${data.status}`);
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            };

            pollingRef.current = setInterval(poll, 1000);
            poll(); // Initial call

            return () => {
                if (pollingRef.current) clearInterval(pollingRef.current);
            };
        }
    }, [activeRunId, selectedProject]);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    const handleToggle = (id: string, checked: boolean) => {
        const getDescendantIds = (nodeId: string, nodes: FileNode[]): string[] => {
            const ids: string[] = [];
            const find = (currentId: string, currentNodes: FileNode[]) => {
                for (const node of currentNodes) {
                    if (node.id === currentId) {
                        ids.push(node.id);
                        if (node.children) {
                            const collectAll = (n: FileNode) => {
                                ids.push(n.id);
                                if (n.children) n.children.forEach(collectAll);
                            };
                            node.children.forEach(collectAll);
                        }
                        return true;
                    }
                    if (node.children && find(currentId, node.children)) return true;
                }
                return false;
            };
            find(nodeId, nodes);
            return ids;
        };

        const targetIds = getDescendantIds(id, fileSystem);
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            targetIds.forEach(targetId => {
                if (checked) newSet.add(targetId);
                else newSet.delete(targetId);
            });
            return newSet;
        });
    };

    const handleRescan = async () => {
        if (!selectedProject) return;
        setLoading(true);
        toast.info("Scanning disk for test files...");
        try {
            const res = await api.post('/api/runner/scan', { projectId: selectedProject.id });
            toast.success(`Found ${res.count} files!`);
            fetchFiles();
        } catch (error) {
            console.error(error);
            toast.error("Scan failed");
        } finally {
            setLoading(false);
        }
    };

    const handleRunBatch = async () => {
        if (!selectedProject || selectedIds.size === 0) return;

        try {
            const fileIds = Array.from(selectedIds);
            toast.info(`Starting batch run...`);

            const response: any = await api.post('/api/runner/batch-execute', {
                projectId: selectedProject.id,
                fileIds,
                config: runConfig // Pass configuration to backend
            });

            toast.success(`Run Started!`);
            // Set Active Run -> Triggers Polling
            setActiveRunId(response.runId);

            // Init console data placeholder
            setCurrentRunData({
                id: response.runId,
                logs: [`[System] Initializing run in ${runConfig.environment} environment...`, `[System] Browser: ${runConfig.browser} (Headless: ${runConfig.headless})`],
                status: 'running'
            });

        } catch (error) {
            console.error(error);
            toast.error("Failed to start batch run");
        }
    };

    // Helper to get flattened list of selected files for the Queue View
    const getSelectedFilesList = (nodes: FileNode[], ids: Set<string>): FileNode[] => {
        const list: FileNode[] = [];
        const traverse = (n: FileNode) => {
            if (ids.has(n.id) && n.type === 'file') list.push(n);
            if (n.children) n.children.forEach(traverse);
        };
        nodes.forEach(traverse);
        return list;
    };

    const selectedFilesList = getSelectedFilesList(fileSystem, selectedIds);

    const getSelectedFileCount = (nodes: FileNode[], ids: Set<string>): number => {
        let count = 0;
        const traverse = (list: FileNode[]) => {
            for (const node of list) {
                if (ids.has(node.id) && node.type === 'file') count++;
                if (node.children) traverse(node.children);
            }
        };
        traverse(nodes);
        return count;
    };

    const selectedCount = getSelectedFileCount(fileSystem, selectedIds);

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Layers className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Test Orchestrator</h1>
                        <p className="text-xs text-muted-foreground">Batch Execution & Suite Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleRescan} disabled={loading} title="Scan 'tests/' folder on disk">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Rescan Disk
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchFiles} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleRunBatch}
                        disabled={selectedCount === 0 || activeRunId !== null}
                    >
                        {activeRunId ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                        {activeRunId ? 'Running...' : `Run Selected (${selectedCount})`}
                    </Button>

                    {/* Save Suite Button */}
                    <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={selectedCount === 0}>
                                <Save className="w-4 h-4 mr-2" />
                                Save as Suite
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Save Test Suite</DialogTitle>
                                <DialogDescription>
                                    Save the current selection of {selectedCount} tests as a reusable suite.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <label className="text-sm font-medium mb-1 block">Suite Name</label>
                                <Input
                                    placeholder="e.g. Nightly Regression"
                                    value={suiteName}
                                    onChange={(e) => setSuiteName(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSaveSuite}>Save Suite</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Main Split Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Suite Builder */}
                <aside className="w-80 border-r bg-muted/10 flex flex-col">
                    <Tabs defaultValue="explorer" orientation="vertical" className="flex-1 flex flex-col min-h-0">
                        <TabsList className="flex-row justify-start w-full bg-transparent border-b h-10 px-2 gap-4 rounded-none">
                            <TabsTrigger value="explorer" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-2 pb-2 text-xs">Explorer</TabsTrigger>
                            <TabsTrigger value="suites" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-2 pb-2 text-xs">Saved Suites</TabsTrigger>
                        </TabsList>

                        {/* Explorer Tab */}
                        <TabsContent value="explorer" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden">
                            <ScrollArea className="flex-1">
                                <div className="p-2 space-y-1">
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="flex gap-2 p-2">
                                                <Skeleton className="w-4 h-4" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        ))
                                    ) : (
                                        fileSystem.map(node => (
                                            <FileTreeItem
                                                key={node.id}
                                                node={node}
                                                selectedIds={selectedIds}
                                                onToggle={handleToggle}
                                            />
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        {/* Saved Suites Tab */}
                        <TabsContent value="suites" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden p-4 space-y-4 overflow-hidden">
                            {suites.length === 0 ? (
                                <div className="text-center text-xs text-muted-foreground p-4 border border-dashed rounded">
                                    No saved suites
                                </div>
                            ) : (
                                <ScrollArea className="h-full">
                                    <div className="space-y-2">
                                        {suites.map(suite => (
                                            <Card key={suite.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                                                setSelectedIds(new Set(suite.fileIds));
                                                toast.info(`Loaded suite: ${suite.name}`);
                                            }}>
                                                <CardContent className="p-3 flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-sm flex items-center gap-2">
                                                            <Layers className="w-3 h-3 text-primary" />
                                                            {suite.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">{suite.fileIds.length} tests</div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSuite(suite.id);
                                                    }}>
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </TabsContent>



                    </Tabs>
                </aside>

                {/* Right Content: Dashboard & Console */}
                <main className="flex-1 bg-background/50 flex flex-col min-w-0">
                    <ScrollArea className="flex-1">
                        <div className="p-6 flex flex-col gap-6">
                            {/* Stat Cards - Simplified */}
                            <div className="grid grid-cols-1 gap-4 shrink-0">
                                <Card>
                                    <CardHeader className="py-4">
                                        <CardTitle className="text-sm font-medium">Selected Tests</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{selectedCount}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Active Run / Live Console */}
                            <div className="flex-1 flex flex-col min-h-0">
                                {activeRunId && currentRunData ? (
                                    <ExecutionConsole
                                        runId={currentRunData.id}
                                        logs={currentRunData.logs || []}
                                        status={currentRunData.status}
                                        progress={currentRunData.results ? (currentRunData.results.length / (selectedCount || 1)) * 100 : 0}
                                        aiAnalysis={currentRunData.ai_analysis}
                                    />
                                ) : (
                                    /* Command Center Interface */
                                    <div className="flex flex-col gap-6 h-full">

                                        {/* Configuration Panel */}
                                        <Card className="shrink-0 bg-card/50">
                                            <CardHeader className="py-3 px-4 border-b">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Settings2 className="w-4 h-4 text-primary" />
                                                        <h3 className="text-sm font-semibold">Run Configuration</h3>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        Ready
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 flex items-end gap-4 flex-wrap">
                                                {/* Environment */}
                                                <div className="space-y-1.5 w-40">
                                                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Globe className="w-3 h-3" /> Environment
                                                    </Label>
                                                    <Select value={runConfig.environment} onValueChange={(v) => setRunConfig({ ...runConfig, environment: v })}>
                                                        <SelectTrigger className="h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="local">Localhost</SelectItem>
                                                            <SelectItem value="staging">Staging</SelectItem>
                                                            <SelectItem value="prod">Production</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Browser */}
                                                <div className="space-y-1.5 w-40">
                                                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Laptop className="w-3 h-3" /> Browser
                                                    </Label>
                                                    <Select value={runConfig.browser} onValueChange={(v) => setRunConfig({ ...runConfig, browser: v })}>
                                                        <SelectTrigger className="h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="chrome">Chrome</SelectItem>
                                                            <SelectItem value="firefox">Firefox</SelectItem>
                                                            <SelectItem value="edge">Edge</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Headless Toggle */}
                                                <div className="flex items-center gap-2 px-2 pb-1.5 border rounded-md h-8 bg-background">
                                                    <Label htmlFor="headless" className="text-xs cursor-pointer">Headless</Label>
                                                    <Switch
                                                        id="headless"
                                                        checked={runConfig.headless}
                                                        onCheckedChange={(c) => setRunConfig({ ...runConfig, headless: c })}
                                                        className="scale-75"
                                                    />
                                                </div>

                                                <div className="flex-1" />

                                                {/* Start Button */}
                                                <Button
                                                    onClick={handleRunBatch}
                                                    disabled={selectedCount === 0}
                                                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 w-40"
                                                >
                                                    <Play className="w-4 h-4 mr-2 fill-current" />
                                                    Run Tests
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* Execution Queue */}
                                        <Card className="flex-1 flex flex-col min-h-0 bg-card/50 overflow-hidden">
                                            <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between shrink-0">
                                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                                    Execution Queue
                                                    {selectedCount > 0 && <Badge variant="secondary" className="ml-2">{selectedCount}</Badge>}
                                                </CardTitle>
                                                {selectedCount > 0 && (
                                                    <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={() => setSelectedIds(new Set())}>
                                                        Clear All
                                                    </Button>
                                                )}
                                            </CardHeader>
                                            <CardContent className="flex-1 p-0 overflow-hidden">
                                                <ScrollArea className="h-full">
                                                    {selectedFilesList.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                                                            <div className="p-3 rounded-full bg-muted/20">
                                                                <Layers className="w-6 h-6 opacity-50" />
                                                            </div>
                                                            <p className="text-sm">No tests selected</p>
                                                            <p className="text-xs opacity-50">Select files from the explorer to build your queue</p>
                                                        </div>
                                                    ) : (
                                                        <div className="divide-y">
                                                            {selectedFilesList.map(file => (
                                                                <div key={file.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors group">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-1.5 rounded bg-blue-500/10 text-blue-500">
                                                                            <FileCode className="w-4 h-4" />
                                                                        </div>
                                                                        <div className="flex flex-col min-w-0">
                                                                            <span className="text-sm font-medium truncate">{file.name}</span>
                                                                            <span className="text-xs text-muted-foreground truncate opacity-70">
                                                                                {/* Optional: Show path or parent name if available */}
                                                                                Ready to execute
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 ring-1 ring-border"
                                                                        onClick={() => handleToggle(file.id, false)}
                                                                    >
                                                                        <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </ScrollArea>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </main>
            </div>

        </div>
    );
}
