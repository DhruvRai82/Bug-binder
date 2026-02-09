/**
 * Module: ExecutionQueue (Premium Design)
 * Purpose: Displays selected tests with rich visual feedback and animations
 * Why: Users need to see what tests will run with beautiful presentation
 * Design: Gradient cards, slide-in animations, hover effects, empty state illustration
 */

import { FileCode, X, Layers, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileNode } from '../types';
import { cn } from '@/lib/utils';

interface ExecutionQueueProps {
    selectedFiles: FileNode[];
    onRemove: (fileId: string) => void;
    onClearAll: () => void;
}

/**
 * What: Premium execution queue with animations
 * Why: Visual confirmation before running tests
 * Design: Gradient cards, slide-in animations, hover effects
 */
export function ExecutionQueue({ selectedFiles, onRemove, onClearAll }: ExecutionQueueProps) {
    const count = selectedFiles.length;

    return (
        <Card className="flex flex-col min-h-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 backdrop-blur-xl border-2 border-blue-500/20 shadow-2xl overflow-hidden">
            <CardHeader className="py-4 px-5 border-b flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-base font-bold flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
                        <Layers className="w-4 h-4 text-blue-400" />
                    </div>
                    <span>Execution Queue</span>
                    {count > 0 && (
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/40 font-mono text-sm px-3 font-bold">
                            {count}
                        </Badge>
                    )}
                </CardTitle>
                {count > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        onClick={onClearAll}
                    >
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Clear All
                    </Button>
                )}
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full">
                    {count === 0 ? (
                        /* Premium Empty State */
                        <div className="flex flex-col items-center justify-center h-96 text-center px-8">
                            <div className="relative mb-6">
                                {/* Animated gradient background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
                                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-dashed border-white/20">
                                    <Layers className="w-12 h-12 text-blue-400/50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold flex items-center gap-2 justify-center">
                                    <Sparkles className="w-5 h-5 text-yellow-400" />
                                    No Tests Queued
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-sm">
                                    Select test files from the explorer to build your execution queue
                                </p>
                                <div className="flex items-center gap-2 justify-center mt-4 text-xs text-muted-foreground">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    <span>Tip: Select folders to queue all tests inside</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Test Cards List */
                        <div className="p-3 space-y-2">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={file.id}
                                    className={cn(
                                        "group relative p-4 rounded-xl border-2 transition-all duration-300",
                                        "bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10",
                                        "border-blue-500/20 hover:border-blue-400/40",
                                        "hover:shadow-lg hover:shadow-blue-500/10",
                                        "hover:scale-[1.02] hover:-translate-y-0.5",
                                        "animate-in slide-in-from-right-4 fade-in"
                                    )}
                                    style={{ animationDelay: `${index * 30}ms` }}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* File Icon with Gradient */}
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 shrink-0">
                                            <FileCode className="w-5 h-5 text-blue-400" />
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold truncate">
                                                    {file.name}
                                                </span>
                                                <Badge variant="outline" className="text-xs font-mono px-2 py-0">
                                                    {file.extension || 'spec'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                {file.path || 'Ready to execute'}
                                            </p>
                                        </div>

                                        {/* Remove Button */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-9 w-9 shrink-0 transition-all",
                                                "opacity-0 group-hover:opacity-100",
                                                "ring-1 ring-white/10 hover:ring-red-500/50",
                                                "hover:bg-red-500/10 hover:text-red-400"
                                            )}
                                            onClick={() => onRemove(file.id)}
                                            title="Remove from queue"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Hover Glow Effect */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
