import React from 'react';
import { Bug } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit2, Trash2, X, Calendar, User, Tag, AlertTriangle, Bug as BugIcon, CheckCircle2 } from 'lucide-react';
import { DrawerClose } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

interface BugDetailProps {
    bug: Bug;
    onEdit: () => void;
    onDelete: () => void;
    onClose: () => void;
}

export function BugDetail({ bug, onEdit, onDelete, onClose }: BugDetailProps) {
    if (!bug) return null;

    const getSeverityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'fixed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'open': return 'bg-red-100 text-red-700 border-red-200';
            case 'in progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="sticky top-0 z-10 grid gap-4 p-4 pb-2 bg-background/95 backdrop-blur border-b">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {bug.bugId}
                            </span>
                            <Badge variant="outline" className={cn("capitalize", getStatusColor(bug.status))}>
                                {bug.status}
                            </Badge>
                        </div>
                    </div>
                    <DrawerClose asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </DrawerClose>
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-tight">
                    {bug.description}
                </h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Created {new Date(bug.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border bg-card space-y-1">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Severity
                        </span>
                        <div className={cn("text-xs font-medium px-2 py-1 rounded inline-block border", getSeverityColor(bug.severity))}>
                            {bug.severity}
                        </div>
                    </div>
                    <div className="p-3 rounded-lg border bg-card space-y-1">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                            <Tag className="h-3 w-3" /> Priority
                        </span>
                        <div className="font-medium text-sm capitalize">{bug.priority || 'None'}</div>
                    </div>
                    <div className="p-3 rounded-lg border bg-card space-y-1">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                            <User className="h-3 w-3" /> Assignee
                        </span>
                        <div className="font-medium text-sm truncate">{bug.assignee || 'Unassigned'}</div>
                    </div>
                    <div className="p-3 rounded-lg border bg-card space-y-1">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                            <User className="h-3 w-3" /> Reporter
                        </span>
                        <div className="font-medium text-sm truncate">{bug.reporter || 'Unknown'}</div>
                    </div>
                </div>

                <Separator />

                {/* Steps Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2 text-foreground">
                        <BugIcon className="h-4 w-4 text-primary" /> Steps to Reproduce
                    </h3>
                    <div className="p-3 rounded-xl bg-muted/30 border text-sm leading-relaxed whitespace-pre-wrap font-mono">
                        {bug.stepsToReproduce || "No steps provided."}
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2 text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Expected Result
                    </h3>
                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-sm leading-relaxed text-emerald-900">
                        {bug.expectedResult || "No expected result provided."}
                    </div>
                </div>
                <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2 text-foreground">
                        <AlertTriangle className="h-4 w-4 text-red-500" /> Actual Result
                    </h3>
                    <div className="p-3 rounded-xl bg-red-50/50 border border-red-100 text-sm leading-relaxed text-red-900">
                        {bug.actualResult || "No actual result provided."}
                    </div>
                </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="p-4 border-t bg-background/95 backdrop-blur grid grid-cols-2 gap-3 shrink-0">
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
                <Button className="w-full" onClick={onEdit}>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit Bug
                </Button>
            </div>
        </div>
    );
}
