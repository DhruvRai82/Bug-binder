import { useState, useEffect } from 'react';
import { Folder, FolderOpen, FileCode, FileJson, Hash, FileType, ChevronRight, ChevronDown, Edit, Trash, FilePlus, FolderPlus, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileNode } from '../types';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/components/ui/context-menu";

interface FileExplorerProps {
    files: FileNode[];
    activeFileId: string | null;
    onFileClick: (file: FileNode) => void;
    onRename: (node: FileNode) => void;
    onDelete: (node: FileNode) => void;
    onCreate: (parentId: string | null, type: 'file' | 'folder') => void;
    level?: number;
    expandedIds?: Set<string>;
}

export function FileExplorer({ files, activeFileId, onFileClick, onRename, onDelete, onCreate, level = 0, expandedIds }: FileExplorerProps) {
    return (
        <div className="flex flex-col select-none">
            {files.map((node) => (
                <FileExplorerItem
                    key={node.id}
                    node={node}
                    activeFileId={activeFileId}
                    onFileClick={onFileClick}
                    onRename={onRename}
                    onDelete={onDelete}
                    onCreate={onCreate}
                    level={level}
                    expandedIds={expandedIds}
                />
            ))}
        </div>
    );
}

function FileExplorerItem({ node, activeFileId, onFileClick, onRename, onDelete, onCreate, level, expandedIds }: {
    node: FileNode;
    activeFileId: string | null;
    onFileClick: (file: FileNode) => void;
    onRename: (node: FileNode) => void;
    onDelete: (node: FileNode) => void;
    onCreate: (parentId: string | null, type: 'file' | 'folder') => void;
    level: number;
    expandedIds?: Set<string>;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const isActive = node.id === activeFileId;

    // Auto-expand if in expandedIds
    useEffect(() => {
        if (expandedIds && expandedIds.has(node.id)) {
            setIsOpen(true);
        }
    }, [expandedIds, node.id]);

    const handleClick = () => {
        if (node.type === 'folder') {
            setIsOpen(!isOpen);
        } else {
            onFileClick(node);
        }
    };

    let Icon = FileCode;
    let colorClass = "text-blue-500/80";

    if (node.type === 'folder') {
        Icon = isOpen ? FolderOpen : Folder;
        colorClass = "text-amber-500/80";
    } else if (node.name.endsWith('.json')) {
        Icon = FileJson;
        colorClass = "text-yellow-600/80";
    } else if (node.name.endsWith('.py')) {
        Icon = Hash;
        colorClass = "text-yellow-500/80";
    } else if (node.name.endsWith('.java')) {
        Icon = Coffee;
        colorClass = "text-red-500/80";
    } else if (node.name.endsWith('.js') || node.name.endsWith('.ts')) {
        Icon = FileCode;
        colorClass = "text-blue-500/80";
    }

    return (
        <div>
            <ContextMenu>
                <ContextMenuTrigger>
                    <div
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1 text-sm cursor-pointer transition-colors border-l-2 border-transparent",
                            isActive
                                ? "bg-accent text-accent-foreground border-primary"
                                : "hover:bg-muted/50 text-foreground/80 hover:text-foreground"
                        )}
                        style={{ paddingLeft: `${level * 12 + 12}px` }}
                        onClick={handleClick}
                    >
                        {node.type === 'folder' && (
                            <span className="opacity-50">
                                {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </span>
                        )}
                        {node.type === 'file' && <span className="w-3" />}

                        <Icon
                            className={cn(
                                "w-4 h-4 shrink-0",
                                colorClass
                            )}
                        />
                        <span className="truncate">{node.name}</span>
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    {node.type === 'folder' && (
                        <>
                            <ContextMenuItem onClick={() => {
                                setIsOpen(true);
                                onCreate(node.id, 'file');
                            }}>
                                <FilePlus className="w-4 h-4 mr-2" /> New File
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => {
                                setIsOpen(true);
                                onCreate(node.id, 'folder');
                            }}>
                                <FolderPlus className="w-4 h-4 mr-2" /> New Folder
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                        </>
                    )}
                    <ContextMenuItem onClick={() => onRename(node)}>
                        <Edit className="w-4 h-4 mr-2" /> Rename
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => onDelete(node)} className="text-red-500 focus:text-red-500">
                        <Trash className="w-4 h-4 mr-2" /> Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            {node.type === 'folder' && isOpen && node.children && (
                <FileExplorer
                    files={node.children}
                    activeFileId={activeFileId}
                    onFileClick={onFileClick}
                    onRename={onRename}
                    onDelete={onDelete}
                    onCreate={onCreate}
                    level={level + 1}
                    expandedIds={expandedIds}
                />
            )}
        </div>
    );
}
