import { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Plus, FolderPlus, FilePlus, ArrowLeft, Layers, BarChart, RefreshCw } from 'lucide-react';

// Reuse IDE Components & Types
import { FolderGrid } from '@/pages/IDE/components/FolderGrid';
import { BreadcrumbNav } from '@/pages/IDE/components/BreadcrumbNav';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// IMPORT SHARED TYPES
import { FileNode, FSNode, buildFileTree } from '@/pages/IDE/types';

interface FlowManagerProps {
    onFileSelect: (file: FileNode, isOutput?: boolean) => void;
}

export function FlowManager({ onFileSelect }: FlowManagerProps) {
    const { selectedProject } = useProject();

    // STATE: View Mode & File System
    const [viewMode, setViewMode] = useState<'editor' | 'output'>('editor');
    const [fileSystem, setFileSystem] = useState<FileNode[]>([]);
    const [currentPath, setCurrentPath] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState(false);

    // Dialogs
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create_file' | 'create_folder'>('create_file');
    const [dialogName, setDialogName] = useState('');

    const fetchFileSystem = async () => {
        if (!selectedProject) return;
        setLoading(true);
        // Current path management is tricky when switching modes. 
        // For simplicity, we might reset path when toggling, or try to persist if structure matches.
        // Here we will rely on currentPath state, but be careful if IDs don't match across environments.

        try {
            let tree: FileNode[] = [];

            if (viewMode === 'editor') {
                const res = await api.get(`/api/fs?projectId=${selectedProject.id}`);
                const rawData = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
                const allNodes = rawData as FSNode[];
                const validNodes = allNodes.filter(n => n.type === 'folder' || n.name.endsWith('.flow.json'));
                tree = buildFileTree(validNodes);
            } else {
                // OUTPUT MODE (Physical /runs folder)
                // We construct the path string from the currentPath nodes
                // currentPath nodes in 'output' mode will be ad-hoc objects, not DB nodes.
                // Actually, let's keep it simple: fetch layout for current path.

                // Construct relative path string from Breadcrumbs
                const relativePath = currentPath.map(p => p.name).join('/');
                console.log('[FlowManager] Fetching Runs Path:', relativePath);
                const res = await api.get(`/api/runs?path=${encodeURIComponent(relativePath)}`);
                const rawNodes = Array.isArray(res) ? res : (res.data || []);
                console.log('[FlowManager] Runs Received:', rawNodes);

                // Map API nodes to FileNode structure
                tree = rawNodes.map((n: any) => ({
                    id: n.path, // Use path as ID for physical files
                    name: n.name,
                    type: n.type,
                    children: [], // Flat list return from API usually, but we might want nested logic? 
                    // The /api/runs returns direct children of requested path.
                    // So 'tree' here is actually just the children of current view.
                    // Wait, FolderGrid expects a full tree usually? 
                    // Or does it expect just the list of items to show?
                    // FolderGrid takes `items`. 
                    parentId: null
                }));
            }

            setFileSystem(tree);

        } catch (error: any) {
            console.error(error);
            toast.error("Failed to load content");
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when Mode or Project changes
    // Note: When traversing directories in 'output' mode, we might need to fetch *inside* handleNavigate instead of global fetch?
    // Let's refine: 
    // - Editor: Fetches ALL nodes once, builds tree. Navigation is local.
    // - Output: Fetches ONLY current folder.
    useEffect(() => {
        if (viewMode === 'editor') {
            fetchFileSystem();
        } else {
            // In Output mode, we fetch whenever currentPath changes
            fetchFileSystem();
        }
    }, [selectedProject?.id, viewMode, currentPath]);

    // Reset path when switching modes
    const handleModeSwitch = (mode: string) => {
        if (mode === viewMode) return;
        setViewMode(mode as any);
        setCurrentPath([]); // Reset to root
        setFileSystem([]);
    };

    const currentFolderChildren = viewMode === 'editor'
        ? (currentPath.length === 0 ? fileSystem : (currentPath[currentPath.length - 1].children || []))
        : fileSystem; // In output mode, fileSystem IS the current folder's children

    const handleNavigate = (folder: FileNode) => {
        setCurrentPath([...currentPath, folder]);
    };

    const handleBreadcrumbClick = (index: number) => {
        if (index === -1) setCurrentPath([]);
        else setCurrentPath(currentPath.slice(0, index + 1));
    };

    const handleCreate = async () => {
        if (!dialogName) return;
        setDialogOpen(false);

        let name = dialogName;
        if (dialogMode === 'create_file' && !name.toLowerCase().endsWith('.flow.json')) {
            name += '.flow.json';
        }

        const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : undefined;

        try {
            const content = dialogMode === 'create_file' ? JSON.stringify({ nodes: [], edges: [] }) : '';
            await api.post('/api/fs', {
                projectId: selectedProject?.id,
                parentId,
                name,
                type: dialogMode === 'create_file' ? 'file' : 'folder',
                language: 'json',
                content
            });

            toast.success("Created successfully");
            if (viewMode === 'editor') fetchFileSystem();
        } catch (e) {
            toast.error("Create failed");
        }
    };

    const handleOpenDialog = (mode: 'create_file' | 'create_folder') => {
        setDialogMode(mode);
        setDialogName('');
        setDialogOpen(true);
    }

    // Handle File Open (Different for Editor vs Output)
    const onOpenFileWrapper = (file: FileNode) => {
        if (viewMode === 'output') {
            // Notify parent it's an output file
            onFileSelect(file, true);
        } else {
            onFileSelect(file, false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            {/* Toolbar */}
            <div className="h-14 border-b flex items-center justify-between px-4 bg-background/50 backdrop-blur shrink-0 transition-all">
                <div className="flex items-center gap-3">
                    {/* 1. Mode Switcher */}
                    <Tabs value={viewMode} onValueChange={handleModeSwitch} className="w-[160px]">
                        <TabsList className="grid w-full grid-cols-2 h-8">
                            <TabsTrigger value="editor" className="text-xs">Editor</TabsTrigger>
                            <TabsTrigger value="output" className="text-xs">Results</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Refresh Button */}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchFileSystem} title="Refresh">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {/* 2. New Button (Only in Editor) */}
                {viewMode === 'editor' && (
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="h-8 gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                                    <Plus className="w-3.5 h-3.5" /> New
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleOpenDialog('create_folder')}>
                                    <FolderPlus className="w-4 h-4 mr-2" /> Folder
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenDialog('create_file')}>
                                    <FilePlus className="w-4 h-4 mr-2" /> Flow Chart
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            {/* Breadcrumbs */}
            <div className="px-4 py-2 border-b bg-muted/20 flex items-center gap-2 overflow-hidden">
                <div
                    className={`cursor-pointer px-2 py-1 rounded hover:bg-muted/50 text-xs ${currentPath.length === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
                    onClick={() => handleBreadcrumbClick(-1)}
                >
                    Home
                </div>
                {currentPath.length > 0 && <span className="text-muted-foreground/50 text-xs">/</span>}
                <BreadcrumbNav path={currentPath} onNavigate={handleBreadcrumbClick} />
            </div>

            {/* Grid Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                {loading ? (
                    <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-muted-foreground w-8 h-8" /></div>
                ) : (
                    <>
                        {currentFolderChildren.length === 0 ? (
                            <div className="text-center mt-20 text-muted-foreground animate-in fade-in zoom-in-95 duration-300">
                                <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {viewMode === 'editor' ? <FolderPlus className="w-8 h-8 text-muted-foreground" /> : <BarChart className="w-8 h-8 text-muted-foreground" />}

                                </div>
                                <p className="font-medium">
                                    {viewMode === 'editor' ? 'No flows found' : 'No execution history'}
                                </p>
                                {viewMode === 'editor' && (
                                    <Button variant="link" onClick={() => handleOpenDialog('create_file')} className="mt-2">Create a Flow</Button>
                                )}
                            </div>
                        ) : (
                            <FolderGrid
                                items={currentFolderChildren}
                                onNavigate={handleNavigate}
                                onOpenFile={onOpenFileWrapper}
                                onRename={async (file, newName) => {
                                    if (viewMode === 'output') {
                                        try {
                                            await api.post('/api/runs/rename', { path: file.id, newName });
                                            toast.success("Renamed successfully");
                                            fetchFileSystem();
                                        } catch (e) {
                                            toast.error("Rename failed");
                                        }
                                    } else {
                                        // Editor Mode Rename (Existing Logic Placeholder)
                                        try {
                                            await api.put(`/api/fs/${file.id}/rename`, { name: newName });
                                            toast.success("Renamed successfully");
                                            fetchFileSystem();
                                        } catch (e: any) {
                                            toast.error("Rename failed");
                                        }
                                    }
                                }}
                                onDelete={async (file) => {
                                    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;

                                    if (viewMode === 'output') {
                                        try {
                                            await api.delete(`/api/runs?path=${encodeURIComponent(file.id)}`);
                                            toast.success("Deleted successfully");
                                            fetchFileSystem();
                                        } catch (e) {
                                            toast.error("Delete failed");
                                        }
                                    } else {
                                        // Editor Mode Delete
                                        try {
                                            await api.delete(`/api/fs/${file.id}`);
                                            toast.success("Deleted successfully");
                                            fetchFileSystem();
                                        } catch (e) {
                                            toast.error("Delete failed");
                                        }
                                    }
                                }}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogMode === 'create_folder' ? 'New Folder' : 'New Flow'}</DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create_folder' ? 'Create a container for your flows' : 'Enter a name for your flow (e.g. Login Flow)'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Name</Label>
                        <Input
                            value={dialogName}
                            onChange={e => setDialogName(e.target.value)}
                            placeholder={dialogMode === 'create_folder' ? "Folder Name" : "MyFlow"}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
