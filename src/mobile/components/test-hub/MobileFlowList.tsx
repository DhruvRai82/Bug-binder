
import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitGraph, MoreVertical, Play, Edit, Folder, FileJson, ChevronRight } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { FSNode, buildFileTree, FileNode } from '@/pages/IDE/types';

export function MobileFlowList() {
    const { selectedProject } = useProject();
    const [fileSystem, setFileSystem] = useState<FileNode[]>([]);
    const [currentPath, setCurrentPath] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (selectedProject) fetchFileSystem();
    }, [selectedProject]);

    const fetchFileSystem = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/api/fs?projectId=${selectedProject?.id}`);
            const tree = buildFileTree(data as FSNode[]);
            setFileSystem(tree);
        } catch (error) {
            console.error("Failed to load file system", error);
            toast.error("Failed to load flows");
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (folder: FileNode) => {
        setCurrentPath([...currentPath, folder]);
    };

    const handleBack = () => {
        setCurrentPath(prev => prev.slice(0, prev.length - 1));
    };

    // Filter to show only Folders or .json/.flow files (assuming flows are saved as JSON)
    const currentItems = (currentPath.length === 0 ? fileSystem : currentPath[currentPath.length - 1].children || [])
        .filter(item => item.type === 'folder' || item.name.endsWith('.json'));

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading file system...</div>;

    if (currentItems.length === 0 && currentPath.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center">
                    <GitGraph className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg">No Flows Found</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Create flows in the Desktop Flow Builder.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2 pb-20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 h-10 px-1">
                {currentPath.length > 0 ? (
                    <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2 h-8">
                        <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                        <span className="truncate max-w-[150px]">{currentPath[currentPath.length - 1].name}</span>
                    </Button>
                ) : (
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Root Directory</span>
                )}
            </div>

            {currentItems.map((item) => (
                <div
                    key={item.id}
                    onClick={() => item.type === 'folder' ? handleNavigate(item) : null}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border shadow-sm active:scale-[0.98] transition-all"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        {item.type === 'folder' ? (
                            <Folder className="h-5 w-5 text-amber-500 fill-amber-500/20" />
                        ) : (
                            <GitGraph className="h-5 w-5 text-indigo-500" />
                        )}
                        <div className="min-w-0">
                            <h3 className="font-medium text-sm truncate">{item.name}</h3>
                            {item.type !== 'folder' && (
                                <p className="text-[10px] text-muted-foreground">Flow File</p>
                            )}
                        </div>
                    </div>

                    {item.type === 'folder' ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Play className="h-4 w-4 mr-2" /> Execute Flow
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" /> View Details
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            ))}
        </div>
    );
}
