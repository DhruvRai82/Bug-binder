import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { MobileNavBar } from '@/components/common/MobileNavBar';
import { Button } from '@/components/ui/button';
import { Folder, FileText, ChevronRight, Hash, FileCode, FileJson, FileType, Code, ArrowLeft, Plus, FolderPlus, FilePlus } from 'lucide-react';
import { toast } from 'sonner';
import ScriptDrawer from './ScriptDrawer';
import { FileNode, FSNode, buildFileTree } from '@/pages/IDE/types';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function MobileDevStudio() {
    const { selectedProject } = useProject();
    const [fileSystem, setFileSystem] = useState<FileNode[]>([]);
    const [currentPath, setCurrentPath] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState(false);

    // Runner State
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Create State
    const [createOpen, setCreateOpen] = useState(false);
    const [createType, setCreateType] = useState<'file' | 'folder'>('file');
    const [createName, setCreateName] = useState('');

    useEffect(() => {
        if (selectedProject) fetchFileSystem();
    }, [selectedProject]);

    const fetchFileSystem = async () => {
        if (!selectedProject) return;
        setLoading(true);
        try {
            const data = await api.get(`/api/fs?projectId=${selectedProject.id}`);
            const tree = buildFileTree(data as FSNode[]);
            setFileSystem(tree);
        } catch { toast.error("Failed to load files"); }
        finally { setLoading(false); }
    };

    // Navigation
    const currentItems = currentPath.length === 0
        ? fileSystem
        : currentPath[currentPath.length - 1].children || [];

    const handleNavigate = (folder: FileNode) => {
        setCurrentPath([...currentPath, folder]);
    };

    const handleBack = () => {
        setCurrentPath(prev => prev.slice(0, prev.length - 1));
    };

    const handleFileClick = (file: FileNode) => {
        setSelectedFile(file);
        setDrawerOpen(true);
    };

    const handleOpenCreate = (type: 'file' | 'folder') => {
        setCreateType(type);
        setCreateName('');
        setCreateOpen(true);
    };

    const handleCreateSubmit = async () => {
        if (!createName.trim()) return;
        setCreateOpen(false);

        try {
            const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
            await api.post('/api/fs', {
                projectId: selectedProject?.id,
                parentId,
                name: createName,
                type: createType,
                language: createType === 'file' ? getLanguage(createName) : undefined
            });
            toast.success(`${createType} created`);
            fetchFileSystem();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Create failed");
        }
    };

    const getLanguage = (name: string) => {
        const n = name.toLowerCase();
        if (n.endsWith('.py')) return 'python';
        if (n.endsWith('.java')) return 'java';
        if (n.endsWith('.js')) return 'javascript';
        if (n.endsWith('.ts') || n.endsWith('.tsx')) return 'typescript';
        return 'typescript';
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <MobileNavBar />

            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Code className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Dev Studio</h1>
                            <p className="text-sm text-muted-foreground">Mobile Code Runner</p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="outline" className="rounded-full h-10 w-10">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenCreate('folder')}>
                                <FolderPlus className="h-4 w-4 mr-2" /> New Folder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenCreate('file')}>
                                <FilePlus className="h-4 w-4 mr-2" /> New File
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New {createType === 'file' ? 'File' : 'Folder'}</DialogTitle>
                            <DialogDescription>Create in {currentPath.length > 0 ? currentPath[currentPath.length - 1].name : 'root'}</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label>Name</Label>
                            <Input
                                value={createName}
                                onChange={e => setCreateName(e.target.value)}
                                placeholder={createType === 'file' ? "script.ts" : "FolderName"}
                                autoFocus
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateSubmit}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Breadcrumb / Back */}
                <div className="flex items-center gap-2 h-10">
                    {currentPath.length > 0 ? (
                        <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            <span className="truncate max-w-[150px]">{currentPath[currentPath.length - 1].name}</span>
                        </Button>
                    ) : (
                        <span className="text-sm font-semibold text-muted-foreground">/ root</span>
                    )}
                </div>

                {/* File List */}
                <div className="space-y-2">
                    {loading ? (
                        <div className="text-center py-10 text-muted-foreground">Loading...</div>
                    ) : (
                        currentItems.map(item => (
                            <div
                                key={item.id}
                                onClick={() => item.type === 'folder' ? handleNavigate(item) : handleFileClick(item)}
                                className="flex items-center justify-between p-3 rounded-lg bg-background border shadow-sm active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <FileIcon item={item} />
                                    <span className="text-sm font-medium truncate">{item.name}</span>
                                </div>
                                {item.type === 'folder' && <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />}
                            </div>
                        ))
                    )}
                    {!loading && currentItems.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground italic text-xs">
                            Empty folder
                        </div>
                    )}
                </div>
            </div>

            <ScriptDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                file={selectedFile}
            />
        </div>
    );
}

function FileIcon({ item }: { item: FileNode }) {
    if (item.type === 'folder') return <Folder className="h-5 w-5 text-amber-500 fill-amber-500/20" />;

    // File
    const name = item.name.toLowerCase();
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return <FileCode className="h-5 w-5 text-blue-500" />;
    if (name.endsWith('.js') || name.endsWith('.jsx')) return <FileCode className="h-5 w-5 text-yellow-500" />;
    if (name.endsWith('.py')) return <Hash className="h-5 w-5 text-blue-400" />;
    if (name.endsWith('.json')) return <FileJson className="h-5 w-5 text-orange-400" />;
    if (name.endsWith('.css') || name.endsWith('.html')) return <FileType className="h-5 w-5 text-orange-500" />;

    return <FileText className="h-5 w-5 text-muted-foreground" />;
}
