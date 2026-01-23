import React, { useState } from 'react';
import { TestCase } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Edit2, Trash2, X, Archive, CheckCircle2, XCircle, AlertCircle, HelpCircle, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MobileTestCaseDetailProps {
    testCase: TestCase | null;
    isEditing: boolean;
    onEditStart: () => void;
    onEditCancel: () => void;
    onSave: (updatedTc: TestCase) => void;
    onDelete: () => void;
    onStatusChange: (status: string) => void;
}

export function MobileTestCaseDetail({
    testCase,
    isEditing,
    onEditStart,
    onEditCancel,
    onSave,
    onDelete,
    onStatusChange
}: MobileTestCaseDetailProps) {
    const [form, setForm] = useState<Partial<TestCase>>({});

    // Sync form when entering editing mode
    React.useEffect(() => {
        if (isEditing && testCase) {
            setForm({ ...testCase });
        }
    }, [isEditing, testCase]);

    if (!testCase) return null;

    const handleSave = () => {
        if (!testCase) return;
        onSave({ ...testCase, ...form } as TestCase);
    };

    const StatusButton = ({ status, current }: { status: string, current: string }) => {
        const isSelected = status === current;
        return (
            <button
                onClick={() => onStatusChange(status)}
                className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl border gap-1.5 transition-all active:scale-95",
                    isSelected
                        ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20"
                        : "bg-card hover:bg-muted/50 border-border/50"
                )}
            >
                {status === 'Pass' && <CheckCircle2 className={cn("h-5 w-5", isSelected ? "text-green-600" : "text-muted-foreground")} />}
                {status === 'Fail' && <XCircle className={cn("h-5 w-5", isSelected ? "text-red-600" : "text-muted-foreground")} />}
                {status === 'Blocked' && <AlertCircle className={cn("h-5 w-5", isSelected ? "text-orange-600" : "text-muted-foreground")} />}
                {status === 'Not Executed' && <HelpCircle className={cn("h-5 w-5", isSelected ? "text-slate-600" : "text-muted-foreground")} />}
                <span className={cn("text-[10px] font-medium whitespace-nowrap", isSelected ? "text-foreground" : "text-muted-foreground")}>
                    {status}
                </span>
            </button>
        );
    };

    return (
        <div className="flex flex-col h-full max-h-[90vh]">
            <DrawerHeader className="border-b pb-4 shrink-0 bg-background/50 backdrop-blur-sm">
                {!isEditing ? (
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 text-left">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground bg-muted/50 shadow-sm border-border/50">
                                    {testCase.testCaseId}
                                </Badge>
                                {testCase.module && (
                                    <Badge variant="secondary" className="text-[10px] font-normal gap-1 px-2 pointer-events-none">
                                        <Archive className="h-3 w-3 opacity-50" />
                                        {testCase.module}
                                    </Badge>
                                )}
                            </div>
                            <DrawerTitle className="font-bold text-lg leading-tight text-foreground pr-8">
                                {testCase.testScenario}
                            </DrawerTitle>
                        </div>
                        <div className="flex gap-1 shrink-0 -mr-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={onEditStart}>
                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={onDelete}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Edit2 className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-semibold text-sm">Edit Test Case</h3>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={onEditCancel}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {!isEditing ? (
                    <>
                        <div className="grid grid-cols-4 gap-2">
                            {['Pass', 'Fail', 'Blocked', 'Not Executed'].map(status => (
                                <StatusButton key={status} status={status} current={testCase.status} />
                            ))}
                        </div>

                        <div className="space-y-6">
                            {testCase.testCaseDescription && (
                                <div className="space-y-1.5">
                                    <h4 className="text-[10px] items-center gap-1.5 flex uppercase font-bold text-muted-foreground tracking-wider">
                                        Description
                                    </h4>
                                    <p className="text-sm text-foreground/80 leading-relaxed bg-muted/5 p-2 rounded-lg border border-transparent">
                                        {testCase.testCaseDescription}
                                    </p>
                                </div>
                            )}

                            <DetailSection title="Pre-Conditions" content={testCase.preConditions} />
                            <DetailSection title="Test Steps" content={testCase.testSteps} isCode />
                            <DetailSection title="Test Data" content={testCase.testData} isMono />

                            <div className="grid grid-cols-1 gap-4">
                                <DetailSection title="Expected Result" content={testCase.expectedResult} accentColor="blue" />
                                <DetailSection title="Actual Result" content={testCase.actualResult} accentColor={testCase.status === 'Pass' ? 'green' : testCase.status === 'Fail' ? 'red' : 'orange'} />
                            </div>

                            {testCase.comments && (
                                <div className="space-y-1.5">
                                    <h4 className="text-[10px] uppercase font-bold text-amber-600/70 tracking-wider">Comments</h4>
                                    <p className="text-sm bg-amber-500/10 p-3 rounded-lg border border-amber-200/50 text-amber-900 dark:text-amber-200">
                                        {testCase.comments}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="space-y-5 pb-8">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Scenario Name</label>
                            <Input
                                className="font-medium bg-muted/30"
                                value={form.testScenario || ''}
                                onChange={e => setForm({ ...form, testScenario: e.target.value })}
                                placeholder="Test Scenario"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Module</label>
                                <Input value={form.module || ''} onChange={e => setForm({ ...form, module: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Case ID</label>
                                <Input value={form.testCaseId || ''} onChange={e => setForm({ ...form, testCaseId: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <TextInput label="Description" value={form.testCaseDescription} onChange={v => setForm({ ...form, testCaseDescription: v })} />
                            <TextInput label="Pre-Conditions" value={form.preConditions} onChange={v => setForm({ ...form, preConditions: v })} />
                            <TextInput label="Test Steps" value={form.testSteps} onChange={v => setForm({ ...form, testSteps: v })} minRows={4} />
                            <TextInput label="Expected Result" value={form.expectedResult} onChange={v => setForm({ ...form, expectedResult: v })} />
                            <TextInput label="Actual Result" value={form.actualResult} onChange={v => setForm({ ...form, actualResult: v })} />
                            <TextInput label="Comments" value={form.comments} onChange={v => setForm({ ...form, comments: v })} />
                        </div>
                    </div>
                )}
            </div>

            <DrawerFooter className="border-t pt-2 bg-background/50 backdrop-blur-sm">
                {isEditing ? (
                    <Button onClick={handleSave} className="w-full">
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                ) : (
                    <DrawerClose asChild>
                        <Button variant="outline" className="w-full">Close</Button>
                    </DrawerClose>
                )}
            </DrawerFooter>
        </div>
    );
}

function DetailSection({ title, content, isCode, isMono, accentColor }: { title: string, content?: string, isCode?: boolean, isMono?: boolean, accentColor?: string }) {
    if (!content) return null;
    return (
        <div className="space-y-1.5">
            <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{title}</h4>
            <div className={cn(
                "text-sm p-3 rounded-lg border-l-2 bg-muted/30",
                isCode && "whitespace-pre-wrap font-mono text-xs",
                isMono && "font-mono text-xs",
                accentColor === 'green' ? "border-green-500/50 bg-green-500/5" :
                    accentColor === 'red' ? "border-red-500/50 bg-red-500/5" :
                        accentColor === 'orange' ? "border-orange-500/50 bg-orange-500/5" :
                            accentColor === 'blue' ? "border-blue-500/50 bg-blue-500/5" :
                                "border-primary/20"
            )}>
                {content}
            </div>
        </div>
    );
}

function TextInput({ label, value, onChange, minRows = 2 }: { label: string, value?: string, onChange: (v: string) => void, minRows?: number }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <Textarea
                className={cn("bg-muted/30 resize-none", minRows === 2 ? "min-h-[60px]" : "min-h-[100px]")}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    );
}
