import { useState, useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderGrid } from './components/FolderGrid';
import { BreadcrumbNav } from './components/BreadcrumbNav';
import { CodeEditor } from './components/CodeEditor';
import { FileExplorer } from './components/FileExplorer';
import { TerminalPanel } from './components/TerminalPanel';
import { FileTabBar } from './components/FileTabBar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Play, Plus, FolderPlus, FilePlus, RefreshCcw, File, FileCode, FileJson, Hash, FileType, Folder } from 'lucide-react';
import { FileNode, FSNode, buildFileTree } from './types';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function IdeLayout() {
    const { selectedProject } = useProject();
    const [viewMode, setViewMode] = useState<'browser' | 'editor'>('browser');
    const [fileSystem, setFileSystem] = useState<FileNode[]>([]);
    const [currentPath, setCurrentPath] = useState<FileNode[]>([]); // For Grid View navigation

    // TABBED EDITOR STATE
    const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create_file' | 'create_folder' | 'rename'>('create_file');
    const [dialogName, setDialogName] = useState('');
    const [dialogData, setDialogData] = useState<{ parentId?: string | null, node?: FileNode }>({});

    // Terminal state
    const [termLogs, setTermLogs] = useState<string[]>(['Ready...']);

    // Fetch File System
    const fetchFileSystem = async () => {
        if (!selectedProject) return;
        setLoading(true);
        try {
            const data = await api.get(`/api/fs?projectId=${selectedProject.id}`);
            const tree = buildFileTree(data as FSNode[]);
            setFileSystem(tree);
            setCurrentPath([]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load file system");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Reset tabs on project switch? 
        // Ideally preserve, but for now reset to avoid ID conflicts
        setOpenFiles([]);
        setActiveFileId(null);
        fetchFileSystem();
    }, [selectedProject?.id]);

    // Derived state for Grid View
    const currentFolderChildren = currentPath.length === 0
        ? fileSystem
        : currentPath[currentPath.length - 1].children || [];;

    // Navigation Handlers
    const handleGridNavigate = (folder: FileNode) => {
        setCurrentPath([...currentPath, folder]);

        // Auto-expand sidebar on grid navigation
        const pathIds = findPathIds(fileSystem, folder.id);
        if (pathIds) {
            setExpandedFolderIds(prev => {
                const newSet = new Set(prev);
                pathIds.forEach(id => newSet.add(id));
                newSet.add(folder.id);
                return newSet;
            });
        }
    };

    const handleBreadcrumbClick = (index: number) => {
        if (index === -1) {
            setCurrentPath([]); // Root
        } else {
            setCurrentPath(currentPath.slice(0, index + 1));
        }
    };

    const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
    const [scopedRootId, setScopedRootId] = useState<string | null>(null);

    // Helper to find path to a node
    const findPathIds = (nodes: FileNode[], targetId: string, path: string[] = []): string[] | null => {
        for (const node of nodes) {
            if (node.id === targetId) return path;
            if (node.children) {
                const found = findPathIds(node.children, targetId, [...path, node.id]);
                if (found) return found;
            }
        }
        return null;
    };

    const handleOpenFile = async (file: FileNode) => {
        // Optimistic open (show immediately what we have)
        if (!openFiles.find(f => f.id === file.id)) {
            setOpenFiles(prev => [...prev, file]);
        }
        setActiveFileId(file.id);
        setViewMode('editor');

        // Fetch fresh content from API
        try {
            const freshData = await api.get(`/api/fs/${file.id}`);
            // Update openFiles with fresh content
            setOpenFiles(prev => prev.map(f =>
                f.id === file.id ? { ...f, content: freshData.content } : f
            ));
            // Update fileSystem (source of truth for re-opening) logic is hard with recursion.
            // But updating openFiles is enough for the active session.
        } catch (e) {
            console.error("Failed to refresh file content", e);
        }

        // Auto-expand sidebar
        const pathIds = findPathIds(fileSystem, file.id);
        if (pathIds) {
            setExpandedFolderIds(prev => {
                const newSet = new Set(prev);
                pathIds.forEach(id => newSet.add(id));
                return newSet;
            });

            if (pathIds.length > 0) {
                setScopedRootId(pathIds[0]);
            } else {
                setScopedRootId(null);
            }
        }
    };

    const handleCloseTab = (e: React.MouseEvent, fileId: string) => {
        e.stopPropagation(); // Prevent tab click
        const newFiles = openFiles.filter(f => f.id !== fileId);
        setOpenFiles(newFiles);

        // If closing active file, switch to neighbor
        if (activeFileId === fileId) {
            if (newFiles.length > 0) {
                // Determine new active (last one or previous?)
                // Use the last one in list
                setActiveFileId(newFiles[newFiles.length - 1].id);
            } else {
                setActiveFileId(null);
                // Optional: Switch back to browser if no files open?
                // setViewMode('browser'); 
            }
        }
    };

    const activeFile = openFiles.find(f => f.id === activeFileId) || null;

    const handleBackToBrowser = () => {
        setViewMode('browser');
    };

    const handleClearScope = () => {
        setScopedRootId(null);
    };

    // Derived state for Sidebar
    const sidebarFiles = scopedRootId
        ? fileSystem.filter(n => n.id === scopedRootId)
        : fileSystem;

    // CRUD Operations (Modified to use Dialog)
    const handleCreate = (type: 'file' | 'folder', targetParentId?: string | null) => {
        let parentId = targetParentId;
        if (parentId === undefined) {
            parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
        }

        setDialogMode(type === 'file' ? 'create_file' : 'create_folder');
        setDialogData({ parentId });
        setDialogName('');
        setDialogOpen(true);
    };

    const handleRename = (node: FileNode) => {
        setDialogMode('rename');
        setDialogData({ node });
        setDialogName(node.name);
        setDialogOpen(true);
    };

    const handleDialogSubmit = async () => {
        if (!dialogName.trim()) return;
        setDialogOpen(false);

        try {
            if (dialogMode === 'rename') {
                const node = dialogData.node;
                if (!node) return;
                if (dialogName === node.name) return;

                await api.patch(`/api/fs/${node.id}`, { name: dialogName });
                toast.success("Renamed successfully");
            } else {
                // Create
                const type = dialogMode === 'create_file' ? 'file' : 'folder';
                const parentId = dialogData.parentId;

                await api.post('/api/fs', {
                    projectId: selectedProject?.id,
                    parentId,
                    name: dialogName,
                    type,
                    language: (() => {
                        const n = dialogName.toLowerCase();
                        if (type !== 'file') return undefined;
                        if (n.endsWith('.py')) return 'python';
                        if (n.endsWith('.java')) return 'java';
                        if (n.endsWith('.js')) return 'javascript';
                        return 'typescript';
                    })()
                });
                toast.success(`${type} created`);
            }
            fetchFileSystem();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Operation failed");
        }
    };

    const handleDelete = async (node: FileNode) => {
        if (!confirm(`Are you sure you want to delete ${node.name}?`)) return;

        try {
            await api.delete(`/api/fs/${node.id}`);
            toast.success("Deleted successfully");

            // Close tab if deleted
            if (openFiles.find(f => f.id === node.id)) {
                const newFiles = openFiles.filter(f => f.id !== node.id);
                setOpenFiles(newFiles);
                if (activeFileId === node.id) setActiveFileId(null);
            }

            fetchFileSystem();
        } catch (error: any) {
            toast.error("Failed to delete");
        }
    };

    // Editor Actions
    const handleSaveFile = async () => {
        if (!activeFile) return;
        const toastId = toast.loading("Saving...");
        try {
            // Update backend
            await api.put(`/api/fs/${activeFile.id}/content`, {
                content: activeFile.content
            });

            toast.dismiss(toastId);
            toast.success(`Saved ${activeFile.name}`);

            // Also update the main fileSystem tree so re-opening works without network fetch if we wanted
            // But handleOpenFile now fetches fresh, so we are safe.
            // We still update the local 'openFiles' state which is already updated by 'handleEditorChange'

        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Failed to save");
            console.error(error);
        }
    };

    const handleRunFile = async () => {
        if (!activeFile) return;
        setTermLogs(['> Preparing execution...', `> Running ${activeFile.name}...`]);

        // Determine language
        let language = '';
        const name = activeFile.name.toLowerCase();

        if (name.endsWith('.java')) language = 'java';
        else if (name.endsWith('.py')) language = 'python';
        else if (name.endsWith('.js')) language = 'javascript';
        else if (name.endsWith('.ts') || name.endsWith('.tsx')) language = 'typescript';
        else language = activeFile.language || '';

        if (!language) {
            setTermLogs(prev => [...prev, '> Error: Unknown language. Cannot execute.']);
            return;
        }

        try {
            // Save first
            // Note: Update content in openFiles array too? 
            // The CodeEditor uses internal state or controlled?
            // CodeEditor uses 'file' prop. If we modify 'activeFile.content' directly in handleSave/Run,
            // it updates the ref in the array, but might not trigger re-render if we don't setOpenFiles.
            // Let's ensure we update state.

            await api.put(`/api/fs/${activeFile.id}/content`, {
                content: activeFile.content
            });

            const response = await api.post('/api/runner/execute-raw', {
                content: activeFile.content,
                language
            });

            const execLogs = response.logs || [];
            if (execLogs.length === 0) {
                setTermLogs(prev => [...prev, '> (No output)']);
            } else {
                setTermLogs(prev => [...prev, ...execLogs]);
            }
            setTermLogs(prev => [...prev, `> Process exited with code ${response.exitCode}`]);
        } catch (error: any) {
            console.error(error);
            setTermLogs(prev => [...prev, `> API Error: ${error.message || 'Unknown error'}`]);
        }
    };

    // Controlled Editor Change
    const handleEditorChange = (val: string | undefined) => {
        if (!activeFileId || val === undefined) return;

        // Update the file content in the openFiles array
        setOpenFiles(prev => prev.map(f =>
            f.id === activeFileId ? { ...f, content: val } : f
        ));
    };

    if (loading && fileSystem.length === 0) {
        return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-background text-foreground overflow-hidden">
            {/* Dialog Component */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {dialogMode === 'rename' ? 'Rename Item' :
                                dialogMode === 'create_file' ? 'Create New File' : 'Create New Folder'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'rename' ? 'Enter the new name for the item.' :
                                'Enter the name for the new item.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-4">
                            {/* Dynamic Icon */}
                            <div className="w-10 h-10 flex items-center justify-center bg-muted/20 rounded-md shrink-0 ring-1 ring-border shadow-sm">
                                {(() => {
                                    if (dialogMode === 'create_folder') return <Folder className="w-6 h-6 text-amber-500" />;

                                    // File Mode - Dynamic Icon
                                    const name = dialogName.toLowerCase();
                                    if (name.endsWith('.ts') || name.endsWith('.tsx')) return <FileCode className="w-6 h-6 text-blue-500" />;
                                    if (name.endsWith('.js') || name.endsWith('.jsx')) return <FileCode className="w-6 h-6 text-yellow-500" />;
                                    if (name.endsWith('.py')) return <Hash className="w-6 h-6 text-blue-400" />;
                                    if (name.endsWith('.json')) return <FileJson className="w-6 h-6 text-orange-400" />;
                                    if (name.endsWith('.css') || name.endsWith('.html')) return <FileType className="w-6 h-6 text-orange-500" />;
                                    return <File className="w-6 h-6 text-muted-foreground" />;
                                })()}
                            </div>

                            <div className="flex-1">
                                <Label htmlFor="name" className="sr-only">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={dialogName}
                                    onChange={(e) => setDialogName(e.target.value)}
                                    placeholder={dialogMode === 'create_folder' ? "Folder name" : "filename.ext"}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleDialogSubmit();
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleDialogSubmit}>
                            {dialogMode === 'rename' ? 'Save Changes' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Top Bar */}
            <div className="h-14 border-b flex items-center justify-between px-4 bg-muted/20 shrink-0">
                <div className="flex items-center gap-4">
                    {viewMode === 'editor' && (
                        <Button variant="ghost" size="icon" onClick={handleBackToBrowser} title="Back to Grid">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    )}

                    {viewMode === 'browser' ? (
                        <div className="flex items-center gap-2">
                            <div
                                className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${currentPath.length === 0 ? 'font-bold' : 'text-muted-foreground'}`}
                                onClick={() => handleBreadcrumbClick(-1)}
                            >
                                Home
                            </div>
                            {currentPath.length > 0 && <span className="text-muted-foreground">/</span>}
                            <BreadcrumbNav path={currentPath} onNavigate={handleBreadcrumbClick} />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Editor Mode</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {viewMode === 'browser' && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" className="gap-2">
                                    <Plus className="w-4 h-4" /> New
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleCreate('folder')}>
                                    <FolderPlus className="w-4 h-4 mr-2" /> Folder
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCreate('file')}>
                                    <FilePlus className="w-4 h-4 mr-2" /> File
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {viewMode === 'editor' && (
                        <>
                            <Button size="sm" variant="outline" onClick={handleSaveFile}>
                                <Save className="w-4 h-4 mr-2" /> Save Active
                            </Button>
                            <Button size="sm" onClick={handleRunFile} className="bg-green-600 hover:bg-green-700 text-white">
                                <Play className="w-4 h-4 mr-2" /> Run Active
                            </Button>
                        </>
                    )}
                    <Button size="icon" variant="ghost" onClick={fetchFileSystem}>
                        <RefreshCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {viewMode === 'browser' ? (
                    <div className="p-6 h-full overflow-y-auto">
                        <FolderGrid
                            items={currentFolderChildren}
                            onNavigate={handleGridNavigate}
                            onOpenFile={handleOpenFile}
                            onRename={handleRename}
                            onDelete={handleDelete}
                        />
                    </div>
                ) : (
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                        {/* Sidebar Tree (VS Code Style) */}
                        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="border-r bg-muted/10">
                            <div className="h-full flex flex-col">
                                <div className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <span>Explorer</span>
                                        {scopedRootId && (
                                            <Button variant="link" size="sm" className="h-4 p-0 text-[10px] ml-2" onClick={handleClearScope}>
                                                (Back to All)
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleCreate('file', null)} title="New File">
                                            <FilePlus className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleCreate('folder', null)} title="New Folder">
                                            <FolderPlus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    <FileExplorer
                                        files={sidebarFiles} // Use scoped list
                                        activeFileId={activeFileId}
                                        onFileClick={(file) => {
                                            if (file.type === 'file') handleOpenFile(file);
                                            // Folders toggle in tree
                                        }}
                                        onRename={handleRename}
                                        onDelete={handleDelete}
                                        onCreate={(parentId, type) => handleCreate(type, parentId)}
                                        expandedIds={expandedFolderIds}
                                    />
                                </div>
                            </div>
                        </ResizablePanel>

                        <ResizableHandle />

                        {/* Editor + Terminal */}
                        <ResizablePanel defaultSize={80}>
                            <ResizablePanelGroup direction="vertical">
                                <ResizablePanel defaultSize={75}>
                                    <div className="flex flex-col h-full">
                                        {/* TAB BAR */}
                                        <FileTabBar
                                            openFiles={openFiles}
                                            activeFileId={activeFileId}
                                            onTabClick={handleOpenFile}
                                            onTabClose={handleCloseTab}
                                        />

                                        <div className="flex-1 overflow-hidden">
                                            {activeFile ? (
                                                <CodeEditor
                                                    file={activeFile}
                                                    onChange={handleEditorChange}
                                                />
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                                    Select a file to edit
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={25}>
                                    <TerminalPanel logs={termLogs} />
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
            </div>
        </div>
    );
}
