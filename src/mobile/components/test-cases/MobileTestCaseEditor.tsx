import React, { useState, useEffect } from 'react';
import { TestCase } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, CheckCircle2, XCircle, AlertCircle, HelpCircle, Clock, Archive, LayoutList, FileText, CheckSquare, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface MobileTestCaseEditorProps {
    isOpen: boolean;
    testCase: TestCase | Partial<TestCase>;
    isNew?: boolean;
    onClose: () => void;
    onSave: (data: TestCase | Partial<TestCase>) => void;
}

export function MobileTestCaseEditor({ isOpen, testCase, isNew, onClose, onSave }: MobileTestCaseEditorProps) {
    const [form, setForm] = useState<Partial<TestCase>>({});
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (isOpen) {
            setForm(testCase);
        }
    }, [isOpen, testCase]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(form);
    };

    const StatusButton = ({ status, current }: { status: string, current?: string }) => {
        const isSelected = status === current;
        return (
            <button
                onClick={() => setForm(prev => ({ ...prev, status: status as any }))}
                className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl border gap-1.5 transition-all active:scale-95",
                    isSelected
                        ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20"
                        : "bg-card hover:bg-muted/50 border-border/50"
                )}
            >
                {status === 'Pass' && <CheckCircle2 className={cn("h-5 w-5", isSelected ? "text-green-600 dark:text-green-400" : "text-muted-foreground")} />}
                {status === 'Fail' && <XCircle className={cn("h-5 w-5", isSelected ? "text-red-600 dark:text-red-400" : "text-muted-foreground")} />}
                {status === 'Blocked' && <AlertCircle className={cn("h-5 w-5", isSelected ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground")} />}
                {status === 'Not Executed' && <HelpCircle className={cn("h-5 w-5", isSelected ? "text-slate-600 dark:text-slate-400" : "text-muted-foreground")} />}
                {status === 'Pending' && <Clock className={cn("h-5 w-5", isSelected ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground")} />}
                <span className={cn("text-[10px] font-medium whitespace-nowrap", isSelected ? "text-foreground" : "text-muted-foreground")}>
                    {status}
                </span>
            </button>
        );
    };

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur z-10 shrink-0">
                <Button variant="ghost" size="sm" className="-ml-2 gap-1 text-muted-foreground" onClick={onClose}>
                    <ChevronLeft className="h-5 w-5" /> Back
                </Button>
                <div className="font-semibold text-sm">
                    {isNew ? 'New Test Case' : 'Edit Details'}
                </div>
                <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground gap-2">
                    <Save className="h-4 w-4" /> Save
                </Button>
            </div>

            {/* Tabs Header */}
            <div className="px-4 py-2 border-b bg-muted/5 shrink-0 overflow-x-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-3">
                        <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                        <TabsTrigger value="steps" className="text-xs">Steps</TabsTrigger>
                        <TabsTrigger value="results" className="text-xs">Results</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Content Scroller */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Status Section */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {['Pass', 'Fail', 'Blocked', 'Not Executed', 'Pending'].map(status => (
                                    <StatusButton key={status} status={status} current={form.status} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label>Scenario Name *</Label>
                                <Input
                                    className="font-medium text-lg leading-tight p-3 h-auto"
                                    value={form.testScenario || ''}
                                    onChange={e => setForm(prev => ({ ...prev, testScenario: e.target.value }))}
                                    placeholder="e.g. Verify Login with Valid Credentials"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>Module</Label>
                                    <div className="relative">
                                        <Archive className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" value={form.module || ''} onChange={e => setForm(prev => ({ ...prev, module: e.target.value }))} placeholder="e.g. Auth" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Case ID</Label>
                                    <Input className="font-mono text-sm" value={form.testCaseId || ''} onChange={e => setForm(prev => ({ ...prev, testCaseId: e.target.value }))} placeholder="TC-XXXX" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label>Description</Label>
                                <Textarea
                                    className="min-h-[100px] resize-none text-sm"
                                    value={form.testCaseDescription || ''}
                                    onChange={e => setForm(prev => ({ ...prev, testCaseDescription: e.target.value }))}
                                    placeholder="Detailed description of what this test case covers..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'steps' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-1">
                            <Label className="flex items-center gap-2"><LayoutList className="h-4 w-4" /> Pre-Conditions</Label>
                            <Textarea
                                className="min-h-[80px] bg-muted/50 border-transparent focus:bg-background focus:border-input transition-colors"
                                value={form.preConditions || ''}
                                onChange={e => setForm(prev => ({ ...prev, preConditions: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Test Steps</Label>
                            <Textarea
                                className="min-h-[200px] font-mono text-sm bg-muted/50 border-transparent focus:bg-background focus:border-input transition-colors leading-relaxed"
                                value={form.testSteps || ''}
                                onChange={e => setForm(prev => ({ ...prev, testSteps: e.target.value }))}
                                placeholder="1. Go to URL..."
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="flex items-center gap-2"><CheckSquare className="h-4 w-4" /> Test Data</Label>
                            <Textarea
                                className="min-h-[80px] font-mono text-xs bg-muted/50 border-transparent focus:bg-background focus:border-input transition-colors"
                                value={form.testData || ''}
                                onChange={e => setForm(prev => ({ ...prev, testData: e.target.value }))}
                                placeholder="{{ username: 'admin' }}"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'results' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-1">
                            <Label className="text-blue-600 dark:text-blue-400">Expected Result</Label>
                            <Textarea
                                className="min-h-[100px] border-blue-200 bg-blue-50/50 focus:border-blue-500 dark:border-blue-900/50 dark:bg-blue-950/10"
                                value={form.expectedResult || ''}
                                onChange={e => setForm(prev => ({ ...prev, expectedResult: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className={cn(
                                form.status === 'Pass' ? 'text-green-600' :
                                    form.status === 'Fail' ? 'text-red-600' :
                                        form.status === 'Blocked' ? 'text-orange-600' : ''
                            )}>Actual Result</Label>
                            <Textarea
                                className="min-h-[100px]"
                                value={form.actualResult || ''}
                                onChange={e => setForm(prev => ({ ...prev, actualResult: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="flex items-center gap-2 text-amber-600"><MessageSquare className="h-4 w-4" /> Comments</Label>
                            <Textarea
                                className="min-h-[80px] border-amber-200 bg-amber-50/50 focus:border-amber-500 dark:border-amber-900/50 dark:bg-amber-950/10"
                                value={form.comments || ''}
                                onChange={e => setForm(prev => ({ ...prev, comments: e.target.value }))}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <label className={cn("text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5", className)}>{children}</label>;
}
