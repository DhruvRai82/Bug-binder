/**
 * Module: SavedSuites
 * Purpose: Displays and manages saved test suites for quick access
 * Why: Users want to save and rerun common test combinations
 * Design: Card grid with hover effects and delete actions
 */

import { Layers, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { TestSuite } from '../types';

interface SavedSuitesProps {
    suites: TestSuite[];
    onLoadSuite: (suite: TestSuite) => void;
    onDeleteSuite: (suiteId: string) => void;
}

/**
 * What: Grid of saved test suites
 * Why: Quick access to predefined test combinations
 */
export function SavedSuites({ suites, onLoadSuite, onDeleteSuite }: SavedSuitesProps) {
    if (suites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                <div className="p-4 rounded-full bg-muted/20 mb-4">
                    <Layers className="w-8 h-8 opacity-30" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No Saved Suites</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                    Select tests and click "Save as Suite" to create reusable test combinations
                </p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
                {suites.map((suite) => (
                    <Card
                        key={suite.id}
                        className="cursor-pointer hover:bg-accent/50 hover:shadow-md transition-all duration-200 group border-2 hover:border-primary/20"
                        onClick={() => onLoadSuite(suite)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary shrink-0">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-sm mb-1 truncate">
                                            {suite.name}
                                        </div>
                                        {suite.description && (
                                            <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                                {suite.description}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs font-mono">
                                                {suite.fileIds.length} tests
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-500/10 hover:text-green-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onLoadSuite(suite);
                                        }}
                                        title="Load suite"
                                    >
                                        <Play className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Delete suite "${suite.name}"?`)) {
                                                onDeleteSuite(suite.id);
                                            }
                                        }}
                                        title="Delete suite"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    );
}
