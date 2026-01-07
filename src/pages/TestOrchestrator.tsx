import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, Play, RefreshCw, Filter, FileText, ChevronRight, ChevronDown, Folder, FileCode } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { FSNode, FileNode, buildFileTree } from './IDE/types';
import { toast } from 'sonner';

// New Components
import { ExecutionConsole } from '@/components/ExecutionConsole';

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

export default function TestOrchestrator() {
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

    const pollingRef = useRef<NodeJS.Timeout | null>(null);

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
                fileIds
            });

            toast.success(`Run Started!`);
            // Set Active Run -> Triggers Polling
            setActiveRunId(response.runId);

            // Init console data placeholder
            setCurrentRunData({
                id: response.runId,
                logs: [`[System] Run Initiated...`],
                status: 'running'
            });

        } catch (error) {
            console.error(error);
            toast.error("Failed to start batch run");
        }
    };

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
                </div>
            </div>

            {/* Main Split Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Suite Builder */}
                <aside className="w-80 border-r bg-muted/10 flex flex-col">
                    <div className="p-3 border-b flex items-center justify-between shrink-0">
                        <span className="font-semibold text-sm">Test Explorer</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-2">
                        {loading && fileSystem.length === 0 ? (
                            <div className="space-y-2 p-2">
                                <Skeleton className="h-4 w-[80%]" />
                                <Skeleton className="h-4 w-[60%]" />
                                <Skeleton className="h-4 w-[90%]" />
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {fileSystem.map(node => (
                                    <FileTreeItem
                                        key={node.id}
                                        node={node}
                                        selectedIds={selectedIds}
                                        onToggle={handleToggle}
                                    />
                                ))}
                                {fileSystem.length === 0 && (
                                    <div className="text-sm text-muted-foreground text-center py-8">
                                        No files found.
                                    </div>
                                )}
                            </div>
                        )}
                    </ScrollArea>
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
                            <div className="flex-1 min-h-[500px] flex flex-col">
                                {activeRunId && currentRunData ? (
                                    <ExecutionConsole
                                        runId={currentRunData.id}
                                        logs={currentRunData.logs || []}
                                        status={currentRunData.status}
                                        progress={currentRunData.results ? (currentRunData.results.length / (selectedCount || 1)) * 100 : 0}
                                    />
                                ) : (
                                    /* Ready to Run Placeholder */
                                    <Card className="flex-1 flex items-center justify-center border-dashed w-full bg-card/50">
                                        <div className="text-center space-y-4">
                                            {selectedCount > 0 ? (
                                                <>
                                                    <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center animate-pulse">
                                                        <Play className="w-10 h-10 text-primary ml-1" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-2xl tracking-tight">Ready to Run {selectedCount} Tests</h3>
                                                        <p className="text-muted-foreground">Click below to start execution in batch mode</p>
                                                    </div>
                                                    <Button size="lg" className="px-8" onClick={handleRunBatch}>Start Batch Execution</Button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="mx-auto bg-muted w-20 h-20 rounded-full flex items-center justify-center">
                                                        <FileText className="w-10 h-10 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">No Tests Selected</h3>
                                                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                                            Select files from the sidebar to add them to the run queue.
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </main>
            </div>

        </div>
    );
}
