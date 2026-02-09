/**
 * Module: TestTree
 * Purpose: Hierarchical display of test files with multi-select capability
 * Why: Users need to browse and select tests organized in folders
 * Performance: Virtualized rendering for large trees (future), memoized node rendering
 */

import { useState, memo } from 'react';
import { ChevronRight, ChevronDown, Folder, FileCode } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { FileNode } from '../types';

interface TestTreeProps {
    fileSystem: FileNode[];
    selectedIds: Set<string>;
    onToggle: (id: string, checked: boolean, fileSystem: FileNode[]) => void;
}

/**
 * What: Individual tree node (file or folder) with expand/collapse
 * Why: Recursive component pattern for nested file structure
 * Performance: Memoized to prevent re-rendering unchanged nodes
 */
const FileTreeNode = memo(({
    node,
    level = 0,
    selectedIds,
    onToggle,
    fileSystem,
    searchTerm
}: {
    node: FileNode;
    level?: number;
    selectedIds: Set<string>;
    onToggle: (id: string, checked: boolean, fileSystem: FileNode[]) => void;
    fileSystem: FileNode[];
    searchTerm?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const isChecked = selectedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    // Filter logic: show node if it matches search or has matching descendants
    const matchesSearch = !searchTerm || node.name.toLowerCase().includes(searchTerm.toLowerCase());
    const hasMatchingDescendants = (n: FileNode): boolean => {
        if (n.name.toLowerCase().includes(searchTerm?.toLowerCase() || '')) return true;
        return n.children?.some(hasMatchingDescendants) || false;
    };

    if (searchTerm && !matchesSearch && !hasMatchingDescendants(node)) {
        return null; // Hide nodes that don't match
    }

    const handleCheck = (checked: boolean) => {
        onToggle(node.id, checked, fileSystem);
    };

    return (
        <div>
            <div
                className="flex items-center gap-2 py-1.5 px-2 hover:bg-accent/50 rounded-md cursor-pointer select-none group transition-colors"
                style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
                {/* Expand/Collapse Icon */}
                <div
                    className="w-4 h-4 flex items-center justify-center shrink-0"
                    onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                >
                    {hasChildren && (
                        isOpen ?
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> :
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                </div>

                {/* Checkbox */}
                <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheck(checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0"
                />

                {/* Icon & Name */}
                <div
                    className="flex items-center gap-2 overflow-hidden flex-1 min-w-0"
                    onClick={() => hasChildren && setIsOpen(!isOpen)}
                >
                    {node.type === 'folder' ? (
                        <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                        <FileCode className="w-4 h-4 text-blue-500 shrink-0" />
                    )}
                    <span className={`text-sm truncate ${matchesSearch && searchTerm ? 'font-medium text-primary' : ''}`}>
                        {node.name}
                    </span>
                </div>
            </div>

            {/* Children */}
            {isOpen && hasChildren && (
                <div className="ml-0.5">
                    {node.children!.map(child => (
                        <FileTreeNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            selectedIds={selectedIds}
                            onToggle={onToggle}
                            fileSystem={fileSystem}
                            searchTerm={searchTerm}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

FileTreeNode.displayName = 'FileTreeNode';

/**
 * What: Main test tree component with search functionality
 * Why: Container for the entire file tree with filtering
 */
export function TestTree({ fileSystem, selectedIds, onToggle }: TestTreeProps) {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="flex flex-col h-full">
            {/* Search Bar */}
            <div className="p-3 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-8 h-9 text-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-accent rounded"
                        >
                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                    )}
                </div>
            </div>

            {/* Tree Content */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
                    {fileSystem.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileCode className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No test files found</p>
                            <p className="text-xs opacity-70">Click "Rescan Disk" to find tests</p>
                        </div>
                    ) : (
                        fileSystem.map(node => (
                            <FileTreeNode
                                key={node.id}
                                node={node}
                                selectedIds={selectedIds}
                                onToggle={onToggle}
                                fileSystem={fileSystem}
                                searchTerm={searchTerm}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
