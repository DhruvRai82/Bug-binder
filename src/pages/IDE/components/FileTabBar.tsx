import { X, FileCode, FileJson, Hash, FileType, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileNode } from '../types';

interface FileTabBarProps {
    openFiles: FileNode[];
    activeFileId: string | null;
    onTabClick: (file: FileNode) => void;
    onTabClose: (e: React.MouseEvent, fileId: string) => void;
}

export function FileTabBar({ openFiles, activeFileId, onTabClick, onTabClose }: FileTabBarProps) {
    if (openFiles.length === 0) return null;

    const getIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.endsWith('.ts') || n.endsWith('.tsx')) return <FileCode className="w-3 h-3 text-blue-500" />;
        if (n.endsWith('.js') || n.endsWith('.jsx')) return <FileCode className="w-3 h-3 text-yellow-500" />;
        if (n.endsWith('.py')) return <Hash className="w-3 h-3 text-blue-400" />;
        if (n.endsWith('.json')) return <FileJson className="w-3 h-3 text-orange-400" />;
        if (n.endsWith('.css') || n.endsWith('.html')) return <FileType className="w-3 h-3 text-orange-500" />;
        return <File className="w-3 h-3 text-muted-foreground" />;
    };

    return (
        <div className="flex items-center overflow-x-auto border-b bg-muted/10 h-9 scrollbar-none">
            {openFiles.map(file => (
                <div
                    key={file.id}
                    onClick={() => onTabClick(file)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 text-xs border-r cursor-pointer min-w-[120px] max-w-[200px] h-full transition-colors select-none group relative",
                        activeFileId === file.id
                            ? "bg-background border-t-2 border-t-primary text-foreground font-medium"
                            : "bg-muted/10 text-muted-foreground hover:bg-muted/20 border-t-2 border-t-transparent"
                    )}
                >
                    {getIcon(file.name)}
                    <span className="truncate flex-1">{file.name}</span>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onTabClose(e, file.id);
                        }}
                        className={cn(
                            "opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20 rounded p-0.5 transition-opacity",
                            activeFileId === file.id && "opacity-100" // Always show close on active
                        )}
                    >
                        <X className="w-3 h-3" />
                    </div>
                </div>
            ))}
        </div>
    );
}
