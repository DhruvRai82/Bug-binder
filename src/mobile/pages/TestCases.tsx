
import React, { useState, useEffect } from 'react';
import { Route } from '@/routes/_authenticated/test-cases';
import { TestCase, DailyData, Project } from '@/types';
import { api } from '@/lib/api';
import { useProject } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, Calendar, Filter, Archive, CheckCircle2, XCircle, AlertCircle, HelpCircle, ChevronRight, FileText, Edit2, Save, X, MoreVertical, Trash2, Pencil, Copy } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export function MobileTestCases() {
    const loaderData = Route.useLoaderData();
    const { selectedProject } = useProject();

    // Data State
    const [customPages, setCustomPages] = useState(loaderData.pages || []);
    const [activePageId, setActivePageId] = useState<string>(loaderData.pages && loaderData.pages.length > 0 ? loaderData.pages[0].id : '');
    const [dailyData, setDailyData] = useState<DailyData[]>(loaderData.initialData || []);

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Forms State
    const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
    const [editForm, setEditForm] = useState<Partial<TestCase>>({});

    // Page Management State
    const [isNewPageOpen, setIsNewPageOpen] = useState(false);
    const [isRenamePageOpen, setIsRenamePageOpen] = useState(false);
    const [pageForm, setPageForm] = useState({ name: '', date: '' });

    // New Test Case State
    const [isNewTestCaseOpen, setIsNewTestCaseOpen] = useState(false);
    const [newTestCaseForm, setNewTestCaseForm] = useState<Partial<TestCase>>({});

    useEffect(() => {
        setCustomPages(loaderData.pages || []);
        if (loaderData.pages && loaderData.pages.length > 0 && !activePageId) {
            setActivePageId(loaderData.pages[0].id);
        }
        if (loaderData.initialData) {
            setDailyData(loaderData.initialData);
        }
    }, [loaderData]);

    // --- Data Loading ---
    const loadDailyData = async (date: string) => {
        if (!selectedProject) return;
        try {
            const data = await api.get(`/api/projects/${selectedProject.id}/daily-data?date=${date}`);
            setDailyData(prev => {
                const newData = [...prev];
                data.forEach((d: DailyData) => {
                    const idx = newData.findIndex(existing => existing.date === d.date);
                    if (idx >= 0) newData[idx] = d;
                    else newData.push(d);
                });
                return newData;
            });
        } catch (error) {
            console.error("Failed to load data", error);
        }
    };

    const getActivePageData = () => {
        const page = customPages.find(p => p.id === activePageId);
        if (!page) return { testCases: [] };
        return dailyData.find(d => d.date === page.date) || { testCases: [] };
    };

    const handlePageChange = (pageId: string) => {
        setActivePageId(pageId);
        const page = customPages.find(p => p.id === pageId);
        if (page) {
            const hasData = dailyData.some(d => d.date === page.date);
            if (!hasData) loadDailyData(page.date);
        }
    };

    // --- Page Mgmt ---
    const handleCreatePage = async () => {
        if (!selectedProject || !pageForm.name || !pageForm.date) return;
        try {
            const newPage = {
                id: Date.now().toString(),
                name: pageForm.name,
                date: pageForm.date
            };
            const savedPage = await api.post(`/api/projects/${selectedProject.id}/pages`, newPage);
            setCustomPages([...customPages, savedPage]);
            // Create empty data
            await api.post(`/api/projects/${selectedProject.id}/daily-data`, {
                date: savedPage.date,
                testCases: [],
                bugs: []
            });
            setActivePageId(savedPage.id);
            setDailyData(prev => [...prev, { date: savedPage.date, testCases: [], bugs: [] }]);
            setIsNewPageOpen(false);
            setPageForm({ name: '', date: '' });
            toast.success("Page created");
        } catch (e) {
            toast.error("Failed to create page");
        }
    };

    const handleDeletePage = async () => {
        if (!selectedProject || !activePageId) return;
        if (!confirm("Are you sure? This will delete all test cases in this page.")) return;
        try {
            await api.delete(`/api/projects/${selectedProject.id}/pages/${activePageId}`);
            const remaining = customPages.filter(p => p.id !== activePageId);
            setCustomPages(remaining);
            if (remaining.length > 0) setActivePageId(remaining[0].id);
            else setActivePageId('');
            toast.success("Page deleted");
        } catch (e) {
            toast.error("Delete failed");
        }
    };

    const handleRenamePage = async () => {
        if (!selectedProject || !activePageId || !pageForm.name) return;
        try {
            await api.put(`/api/projects/${selectedProject.id}/pages/${activePageId}`, { name: pageForm.name });
            setCustomPages(prev => prev.map(p => p.id === activePageId ? { ...p, name: pageForm.name } : p));
            setIsRenamePageOpen(false);
            setPageForm({ name: '', date: '' });
            toast.success("Renamed successfully");
        } catch (e) {
            toast.error("Rename failed");
        }
    };

    // --- Test Case Actions ---
    const handleCreateTestCase = async () => {
        if (!selectedProject || !activePageId) return;
        const page = customPages.find(p => p.id === activePageId);
        if (!page) return;

        const newCase: TestCase = {
            id: Date.now().toString(),
            testCaseId: newTestCaseForm.testCaseId || `TC-${Date.now().toString().slice(-4)}`,
            testScenario: newTestCaseForm.testScenario || 'New Scenario',
            status: 'Not Executed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...newTestCaseForm
        } as TestCase;

        const currentData = getActivePageData();
        const updatedList = [...(currentData.testCases || []), newCase];
        const fullData = dailyData.find(d => d.date === page.date);

        // Optimistic
        setDailyData(prev => prev.map(d => d.date === page.date ? { ...d, testCases: updatedList } : d));
        setIsNewTestCaseOpen(false);
        setNewTestCaseForm({});

        try {
            await api.put(`/api/projects/${selectedProject.id}/daily-data/${page.date}`, {
                testCases: updatedList,
                bugs: fullData?.bugs || []
            });
            toast.success("Test Case Added");
        } catch (e) {
            toast.error("Failed to add test case");
        }
    };

    const startEditing = () => {
        setEditForm(selectedTestCase || {});
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedTestCase || !selectedProject || !activePageId) return;
        const page = customPages.find(p => p.id === activePageId);
        if (!page) return;

        const updatedTC = {
            ...selectedTestCase,
            ...editForm,
            updatedAt: new Date().toISOString()
        } as TestCase;

        const currentData = getActivePageData();
        const updatedList = (currentData.testCases || []).map(tc => tc.id === selectedTestCase.id ? updatedTC : tc);
        const fullData = dailyData.find(d => d.date === page.date);

        // Optimistic
        setSelectedTestCase(updatedTC);
        setDailyData(prev => prev.map(d => d.date === page.date ? { ...d, testCases: updatedList } : d));
        setIsEditing(false);

        try {
            await api.put(`/api/projects/${selectedProject.id}/daily-data/${page.date}`, {
                testCases: updatedList,
                bugs: fullData?.bugs || []
            });
            toast.success("Saved");
        } catch (e) {
            toast.error("Failed to save");
        }
    };

    const handleDeleteTestCase = async () => {
        if (!selectedTestCase || !selectedProject || !activePageId) return;
        if (!confirm("Delete this test case?")) return;

        const page = customPages.find(p => p.id === activePageId);
        if (!page) return;

        const currentData = getActivePageData();
        const updatedList = (currentData.testCases || []).filter(tc => tc.id !== selectedTestCase.id);
        const fullData = dailyData.find(d => d.date === page.date);

        setDailyData(prev => prev.map(d => d.date === page.date ? { ...d, testCases: updatedList } : d));
        setIsDetailsOpen(false);

        try {
            await api.put(`/api/projects/${selectedProject.id}/daily-data/${page.date}`, {
                testCases: updatedList,
                bugs: fullData?.bugs || []
            });
            toast.success("Deleted");
        } catch (e) { toast.error("Delete failed"); }
    };

    // --- Render Helpers ---
    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'Pass': return <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200">Pass</Badge>;
            case 'Fail': return <Badge className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200">Fail</Badge>;
            case 'Blocked': return <Badge className="bg-orange-500/15 text-orange-700 hover:bg-orange-500/25 border-orange-200">Blocked</Badge>;
            default: return <Badge variant="outline" className="text-muted-foreground">Not Run</Badge>;
        }
    };

    const activeData = getActivePageData();
    const filteredCases = (activeData.testCases || []).filter(tc =>
        !searchQuery ||
        tc.testScenario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tc.testCaseId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-background pb-16">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-background/95 backdrop-blur z-10 sticky top-0">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-xl font-bold">Test Cases</h1>
                    <div className="flex gap-2">
                        <Button size="icon" variant="secondary" className="rounded-full shadow-sm" onClick={() => setIsNewTestCaseOpen(true)}>
                            <Plus className="h-5 w-5" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="rounded-full">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Page Options</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setIsNewPageOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" /> New Page
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    const p = customPages.find(x => x.id === activePageId);
                                    if (p) { setPageForm({ name: p.name, date: p.date }); setIsRenamePageOpen(true); }
                                }}>
                                    <Edit2 className="mr-2 h-4 w-4" /> Rename Page
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={handleDeletePage}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Page
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search cases..." className="pl-9 bg-muted/50 border-none rounded-xl" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
            </div>

            {/* Page Tabs */}
            {customPages.length > 0 ? (
                <div className="flex overflow-x-auto p-2 gap-2 scrollbar-hide border-b bg-muted/5 shrink-0">
                    {customPages.map(page => (
                        <button key={page.id} onClick={() => handlePageChange(page.id)}
                            className={cn("px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                                activePageId === page.id ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:bg-muted"
                            )}>
                            {page.name}
                        </button>
                    ))}
                </div>
            ) : <div className="p-8 text-center text-muted-foreground"><p>No pages. Tap menu to create one.</p></div>}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/5">
                {filteredCases.map(tc => (
                    <Card key={tc.id} className="active:scale-[0.99] transition-all border-border/50 shadow-sm" onClick={() => { setSelectedTestCase(tc); setIsEditing(false); setIsDetailsOpen(true); }}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground bg-muted/50">{tc.testCaseId}</Badge>
                                <StatusBadge status={tc.status} />
                            </div>
                            <h3 className="font-semibold text-sm leading-snug mb-2">{tc.testScenario}</h3>
                            {tc.module && <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full w-fit text-xs text-muted-foreground"><Archive className="h-3 w-3" /> {tc.module}</span>}
                        </CardContent>
                    </Card>
                ))}
                {filteredCases.length === 0 && <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50"><FileText className="h-10 w-10 mb-2" />Empty</div>}
            </div>

            {/* Details Drawer */}
            <Drawer open={isDetailsOpen} onOpenChange={(o) => { setIsDetailsOpen(o); if (!o) setIsEditing(false); }}>
                <DrawerContent className="max-h-[95vh] flex flex-col">
                    <DrawerHeader className="border-b pb-4 shrink-0">
                        {!isEditing ? (
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <DrawerTitle className="font-mono text-sm text-muted-foreground text-left flex gap-2 items-center">
                                        {selectedTestCase?.testCaseId}
                                        <Badge variant="secondary" className="text-xs font-normal">{selectedTestCase?.module}</Badge>
                                    </DrawerTitle>
                                    <DrawerDescription className="text-left font-bold text-foreground text-lg leading-tight mt-1">{selectedTestCase?.testScenario}</DrawerDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={startEditing}><Edit2 className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDeleteTestCase}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between"><h3 className="font-semibold">Edit Test Case</h3><Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /></Button></div>
                                <Input className="font-bold" value={editForm.testScenario || ''} onChange={e => setEditForm({ ...editForm, testScenario: e.target.value })} placeholder="Test Scenario" />
                            </div>
                        )}
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {!isEditing ? (
                            <>
                                {/* View Mode - Expanded */}
                                <div className="grid grid-cols-4 gap-2">
                                    {['Pass', 'Fail', 'Blocked', 'Not Executed'].map(status => (
                                        <button key={status} onClick={() => {
                                            if (!selectedTestCase || !selectedProject || !activePageId) return;
                                            const uTC = { ...selectedTestCase, status: status as any };
                                            setSelectedTestCase(uTC);
                                            const page = customPages.find(p => p.id === activePageId);
                                            if (!page) return;
                                            const currentData = getActivePageData();
                                            const updatedList = (currentData.testCases || []).map(tc => tc.id === selectedTestCase.id ? uTC : tc);
                                            setDailyData(prev => prev.map(d => d.date === page?.date ? { ...d, testCases: updatedList } : d));
                                            const fd = dailyData.find(d => d.date === page?.date);
                                            api.put(`/api/projects/${selectedProject.id}/daily-data/${page?.date}`, { testCases: updatedList, bugs: fd?.bugs || [] }).then(() => toast.success("Updated"));
                                        }} className={cn("flex flex-col items-center justify-center p-2 rounded-xl border gap-1 transition-all active:scale-95", selectedTestCase?.status === status ? "bg-accent border-primary" : "bg-card hover:bg-muted/50")}>
                                            <span className="text-[10px] whitespace-nowrap">{status}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    {selectedTestCase?.testCaseDescription && (
                                        <div className="space-y-1"><h4 className="font-semibold text-xs uppercase text-muted-foreground">Description</h4><p className="text-sm text-foreground/80">{selectedTestCase?.testCaseDescription}</p></div>
                                    )}

                                    <div className="space-y-1"><h4 className="font-semibold text-xs uppercase text-muted-foreground">Pre-Conditions</h4><p className="text-sm bg-muted/30 p-3 rounded-lg border-l-2 border-primary/20">{selectedTestCase?.preConditions || '-'}</p></div>

                                    <div className="space-y-1"><h4 className="font-semibold text-xs uppercase text-muted-foreground">Steps</h4><p className="text-sm bg-muted/30 p-3 rounded-lg border-l-2 border-primary/20 whitespace-pre-wrap">{selectedTestCase?.testSteps || '-'}</p></div>

                                    <div className="space-y-1"><h4 className="font-semibold text-xs uppercase text-muted-foreground">Test Data</h4><p className="text-sm font-mono bg-muted/30 p-3 rounded-lg border-l-2 border-primary/20">{selectedTestCase?.testData || '-'}</p></div>

                                    <div className="space-y-1"><h4 className="font-semibold text-xs uppercase text-muted-foreground">Expected</h4><p className="text-sm bg-muted/30 p-3 rounded-lg border-l-2 border-primary/20">{selectedTestCase?.expectedResult || '-'}</p></div>

                                    <div className="space-y-1"><h4 className="font-semibold text-xs uppercase text-muted-foreground">Actual Result</h4><p className="text-sm bg-muted/30 p-3 rounded-lg border-l-2 border-primary/20">{selectedTestCase?.actualResult || '-'}</p></div>

                                    {selectedTestCase?.comments && <div className="space-y-1"><h4 className="font-semibold text-xs uppercase text-muted-foreground">Comments</h4><p className="text-sm bg-yellow-500/10 p-3 rounded-lg border-yellow-200 text-yellow-800">{selectedTestCase?.comments}</p></div>}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-5 pb-8">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1"><Label>Module</Label><Input value={editForm.module || ''} onChange={e => setEditForm({ ...editForm, module: e.target.value })} /></div>
                                    <div className="space-y-1"><Label>Case ID</Label><Input value={editForm.testCaseId || ''} onChange={e => setEditForm({ ...editForm, testCaseId: e.target.value })} /></div>
                                </div>

                                <div className="space-y-1"><Label>Description Detail</Label><textarea className="w-full rounded-md border bg-transparent p-2 text-sm min-h-[80px]" value={editForm.testCaseDescription || ''} onChange={e => setEditForm({ ...editForm, testCaseDescription: e.target.value })} placeholder="Full description" /></div>

                                <div className="space-y-1"><Label>Pre-Conditions</Label><textarea className="w-full rounded-md border bg-transparent p-2 text-sm min-h-[60px]" value={editForm.preConditions || ''} onChange={e => setEditForm({ ...editForm, preConditions: e.target.value })} /></div>

                                <div className="space-y-1"><Label>Test Steps</Label><textarea className="w-full rounded-md border bg-transparent p-2 text-sm min-h-[100px]" value={editForm.testSteps || ''} onChange={e => setEditForm({ ...editForm, testSteps: e.target.value })} /></div>

                                <div className="space-y-1"><Label>Test Data</Label><textarea className="w-full rounded-md border bg-transparent p-2 text-sm min-h-[60px]" value={editForm.testData || ''} onChange={e => setEditForm({ ...editForm, testData: e.target.value })} placeholder="e.g. User: admin, Pass: 123" /></div>

                                <div className="space-y-1"><Label>Expected Result</Label><textarea className="w-full rounded-md border bg-transparent p-2 text-sm min-h-[60px]" value={editForm.expectedResult || ''} onChange={e => setEditForm({ ...editForm, expectedResult: e.target.value })} /></div>

                                <div className="space-y-1"><Label>Actual Result</Label><textarea className="w-full rounded-md border bg-transparent p-2 text-sm min-h-[60px]" value={editForm.actualResult || ''} onChange={e => setEditForm({ ...editForm, actualResult: e.target.value })} /></div>

                                <div className="space-y-1"><Label>Comments</Label><textarea className="w-full rounded-md border bg-transparent p-2 text-sm min-h-[60px]" value={editForm.comments || ''} onChange={e => setEditForm({ ...editForm, comments: e.target.value })} /></div>
                            </div>
                        )}
                    </div>

                    <DrawerFooter className="border-t pt-2">
                        {isEditing && <Button onClick={handleSaveEdit}>Save Changes</Button>}
                        <DrawerClose asChild><Button variant="outline">Close</Button></DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* New Test Case Drawer - Updated to match new fields */}
            <Drawer open={isNewTestCaseOpen} onOpenChange={setIsNewTestCaseOpen}>
                <DrawerContent className="max-h-[90vh] flex flex-col">
                    <DrawerHeader>
                        <DrawerTitle>New Test Case</DrawerTitle>
                        <DrawerDescription>Add a new test case to {customPages.find(p => p.id === activePageId)?.name}</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
                        <div className="space-y-1"><Label>Scenario *</Label><Input value={newTestCaseForm.testScenario || ''} onChange={e => setNewTestCaseForm({ ...newTestCaseForm, testScenario: e.target.value })} placeholder="e.g. User Login" /></div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1"><Label>Module</Label><Input value={newTestCaseForm.module || ''} onChange={e => setNewTestCaseForm({ ...newTestCaseForm, module: e.target.value })} placeholder="e.g. Auth" /></div>
                            <div className="space-y-1"><Label>ID (Optional)</Label><Input value={newTestCaseForm.testCaseId || ''} onChange={e => setNewTestCaseForm({ ...newTestCaseForm, testCaseId: e.target.value })} placeholder="Auto-gen" /></div>
                        </div>
                        <div className="space-y-1"><Label>Description</Label><textarea className="w-full rounded-md border bg-transparent p-2 text-sm min-h-[60px]" value={newTestCaseForm.testCaseDescription || ''} onChange={e => setNewTestCaseForm({ ...newTestCaseForm, testCaseDescription: e.target.value })} /></div>
                        <div className="space-y-1"><Label>Steps</Label><textarea className="w-full rounded-md border bg-transparent p-2 text-sm min-h-[80px]" value={newTestCaseForm.testSteps || ''} onChange={e => setNewTestCaseForm({ ...newTestCaseForm, testSteps: e.target.value })} /></div>
                        <div className="space-y-1"><Label>Test Data</Label><textarea className="w-full rounded-md border bg-transparent p-2 text-sm min-h-[60px]" value={newTestCaseForm.testData || ''} onChange={e => setNewTestCaseForm({ ...newTestCaseForm, testData: e.target.value })} /></div>
                        <div className="space-y-1"><Label>Expected Result</Label><textarea className="w-full rounded-md border bg-transparent p-2 text-sm min-h-[60px]" value={newTestCaseForm.expectedResult || ''} onChange={e => setNewTestCaseForm({ ...newTestCaseForm, expectedResult: e.target.value })} /></div>
                    </div>
                    <DrawerFooter>
                        <Button onClick={handleCreateTestCase} disabled={!newTestCaseForm.testScenario}>Create Case</Button>
                        <DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* New Page Dialog */}
            <Dialog open={isNewPageOpen} onOpenChange={setIsNewPageOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New Page</DialogTitle><DialogDescription>Create a new testing phase/sprint.</DialogDescription></DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1"><Label>Name</Label><Input value={pageForm.name} onChange={e => setPageForm({ ...pageForm, name: e.target.value })} placeholder="Sprint X" /></div>
                        <div className="space-y-1"><Label>Date</Label><Input type="date" value={pageForm.date} onChange={e => setPageForm({ ...pageForm, date: e.target.value })} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleCreatePage}>Create</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isRenamePageOpen} onOpenChange={setIsRenamePageOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Rename Page</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1"><Label>Name</Label><Input value={pageForm.name} onChange={e => setPageForm({ ...pageForm, name: e.target.value })} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleRenamePage}>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
