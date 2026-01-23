import React, { useState, useEffect } from 'react';
import { Bug } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface BugEditorProps {
    isOpen: boolean;
    bug: Bug | Partial<Bug>;
    isNew?: boolean;
    onClose: () => void;
    onSave: (bug: Bug | Partial<Bug>) => void;
}

export function BugEditor({ isOpen, bug, isNew, onClose, onSave }: BugEditorProps) {
    const [formData, setFormData] = useState<Partial<Bug>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(bug || {});
        }
    }, [isOpen, bug]);

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <div className={cn(
            "fixed inset-0 z-50 bg-background transition-transform duration-300 ease-in-out flex flex-col",
            isOpen ? "translate-x-0" : "translate-x-full"
        )}>
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between bg-background/95 backdrop-blur shrink-0">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onClose} className="-ml-2">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <h2 className="text-lg font-semibold">{isNew ? 'New Bug' : 'Edit Bug'}</h2>
                </div>
                <Button onClick={handleSave} size="sm" className="gap-2">
                    <Save className="h-4 w-4" /> Save
                </Button>
            </div>

            {/* Content with Tabs */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <Tabs defaultValue="details" className="flex-1 flex flex-col">
                    <div className="px-4 border-b bg-muted/5 shrink-0">
                        <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-6">
                            <TabsTrigger value="details" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0">Details</TabsTrigger>
                            <TabsTrigger value="steps" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0">Reproduction</TabsTrigger>
                            <TabsTrigger value="meta" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0">Metadata</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-muted/5">
                        <TabsContent value="details" className="p-4 space-y-4 m-0 h-full">
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    className="min-h-[120px] resize-none text-base bg-background"
                                    placeholder="Brief summary of the bug..."
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={formData.status || 'Open'}
                                        onValueChange={v => setFormData({ ...formData, status: v as any })}
                                    >
                                        <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Open">Open</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="Fixed">Fixed</SelectItem>
                                            <SelectItem value="Closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Severity</Label>
                                    <Select
                                        value={formData.severity || 'Medium'}
                                        onValueChange={v => setFormData({ ...formData, severity: v as any })}
                                    >
                                        <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Critical">Critical</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="steps" className="p-4 space-y-4 m-0 h-full">
                            <div className="space-y-2">
                                <Label>Steps to Reproduce</Label>
                                <Textarea
                                    className="min-h-[150px] font-mono text-sm bg-background"
                                    placeholder="1. Go to page...&#10;2. Click button..."
                                    value={formData.stepsToReproduce || ''}
                                    onChange={e => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Expected Result</Label>
                                <Textarea
                                    className="min-h-[80px] bg-background"
                                    placeholder="What should happen..."
                                    value={formData.expectedResult || ''}
                                    onChange={e => setFormData({ ...formData, expectedResult: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Actual Result</Label>
                                <Textarea
                                    className="min-h-[80px] bg-background"
                                    placeholder="What actually happens..."
                                    value={formData.actualResult || ''}
                                    onChange={e => setFormData({ ...formData, actualResult: e.target.value })}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="meta" className="p-4 space-y-4 m-0 h-full">
                            <div className="space-y-2">
                                <Label>Assignee</Label>
                                <Input
                                    className="bg-background"
                                    placeholder="e.g. John Doe"
                                    value={formData.assignee || ''}
                                    onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Reporter</Label>
                                <Input
                                    className="bg-background"
                                    placeholder="e.g. Jane Smith"
                                    value={formData.reporter || ''}
                                    onChange={e => setFormData({ ...formData, reporter: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select
                                    value={formData.priority || 'Medium'}
                                    onValueChange={v => setFormData({ ...formData, priority: v as any })}
                                >
                                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
