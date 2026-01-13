import { Folder, FileCode, FileJson, Hash, FileType, Coffee } from 'lucide-react';
import { FileNode } from '../types';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/common/ThemeProvider';

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Edit, Trash } from 'lucide-react';

interface FolderGridProps {
    items: FileNode[];
    onNavigate: (folder: FileNode) => void;
    onOpenFile: (file: FileNode) => void;
    onRename: (node: FileNode) => void;
    onDelete: (node: FileNode) => void;
}

export function FolderGrid({ items, onNavigate, onOpenFile, onRename, onDelete }: FolderGridProps) {
    const { theme } = useTheme();

    if (items.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <Folder className="w-24 h-24 mb-4 stroke-1" />
                <p className="text-lg font-medium">This folder is empty</p>
                <p className="text-sm">Right-click to create a new item</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-6">
            {items.map((item) => (
                <ContextMenu key={item.id}>
                    <ContextMenuTrigger>
                        <div
                            className="group flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 cursor-pointer transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-border/50"
                            onClick={() => item.type === 'folder' ? onNavigate(item) : onOpenFile(item)}
                        >
                            <div className={cn(
                                "w-20 h-20 flex items-center justify-center rounded-2xl shadow-sm transition-shadow group-hover:shadow-md",
                                item.type === 'folder' ? "bg-amber-100 dark:bg-amber-900/20" : "bg-blue-50 dark:bg-blue-900/10"
                            )}>
                                {getIcon(item)}
                            </div>
                            <span className="text-sm font-medium text-center truncate w-full px-2">
                                {item.name}
                            </span>
                        </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem onClick={() => onRename(item)}>
                            <Edit className="w-4 h-4 mr-2" /> Rename
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => onDelete(item)} className="text-red-500 focus:text-red-500">
                            <Trash className="w-4 h-4 mr-2" /> Delete
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            ))}
        </div>
    );
}

function getIcon(item: FileNode) {
    if (item.type === 'folder') {
        return <Folder className="w-10 h-10 text-amber-500 fill-amber-500/20" />;
    }

    if (item.name.endsWith('.ts')) return <FileCode className="w-10 h-10 text-blue-500" />;
    if (item.name.endsWith('.py')) return <Hash className="w-10 h-10 text-yellow-600" />; // Python
    if (item.name.endsWith('.java')) return <Coffee className="w-10 h-10 text-red-500" />; // Java

    return <FileJson className="w-10 h-10 text-zinc-500" />;
}
