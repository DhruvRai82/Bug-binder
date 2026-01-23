import React, { useState, useEffect, useRef } from 'react';
import { Route } from '@/routes/_authenticated/test-cases';
import { TestCase, DailyData } from '@/types';
import { api } from '@/lib/api';
import { useProject } from '@/context/ProjectContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Search, LayoutGrid, Layers, ArrowRight } from 'lucide-react';
import { MobileTestCaseList } from '@/mobile/components/test-cases/MobileTestCaseList';
import { MobileTestCaseDetail } from '@/mobile/components/test-cases/MobileTestCaseDetail';
import { MobileTestCaseEditor } from '@/mobile/components/test-cases/MobileTestCaseEditor';
import { MobileFab } from '@/mobile/components/test-cases/MobileFab';
import { MobileAIGenDialog } from '@/mobile/components/test-cases/MobileAIGenDialog';
import { ImportDialog } from '@/features/test-management/ImportDialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Plus, Edit2, Trash2 } from 'lucide-react';

export function MobileTestCases() {
    const loaderData = Route.useLoaderData();
    const { selectedProject } = useProject();

    // Data State
    const [customPages, setCustomPages] = useState(loaderData.pages || []);
    const [activePageId, setActivePageId] = useState<string>(loaderData.pages && loaderData.pages.length > 0 ? loaderData.pages[0].id : '');
    const [dailyData, setDailyData] = useState<DailyData[]>(loaderData.initialData || []);

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'edit'>('list');

    // Selection State
    const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);

    // Dialogs State
    const [isNewPageOpen, setIsNewPageOpen] = useState(false);
    const [isRenamePageOpen, setIsRenamePageOpen] = useState(false);
    const [showAiDialog, setShowAiDialog] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [pageForm, setPageForm] = useState({ name: '', date: '' });

    const importContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCustomPages(loaderData.pages || []);
        if (loaderData.pages && loaderData.pages.length > 0 && !activePageId) {
            setActivePageId(loaderData.pages[0].id);
        }
        if (loaderData.initialData) {
            setDailyData(loaderData.initialData);
        }
    }, [loaderData]);

    // --- Helpers ---
    const getActivePageData = () => {
        const page = customPages.find(p => p.id === activePageId);
        if (!page) return { testCases: [] };
        return dailyData.find(d => d.date === page.date) || { testCases: [] };
    };

    const updateLocalData = (updatedList: TestCase[]) => {
        const page = customPages.find(p => p.id === activePageId);
        if (!page) return;
        setDailyData(prev => prev.map(d => d.date === page.date ? { ...d, testCases: updatedList } : d));
    };

    const persistChanges = async (updatedList: TestCase[]) => {
        const page = customPages.find(p => p.id === activePageId);
        if (!page || !selectedProject) return;
        const fullData = dailyData.find(d => d.date === page.date);
        try {
            await api.put(`/api/projects/${selectedProject.id}/daily-data/${page.date}`, {
                testCases: updatedList,
                bugs: fullData?.bugs || []
            });
        } catch (e) {
            console.error(e);
            toast.error("Failed to save changes");
        }
    };

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

    const handlePageChange = (pageId: string) => {
        setActivePageId(pageId);
        const page = customPages.find(p => p.id === pageId);
        if (page) {
            const hasData = dailyData.some(d => d.date === page.date);
            if (!hasData) loadDailyData(page.date);
        }
    };

    // --- Actions ---
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

    const handleImport = (data: any[]) => {
        if (!selectedProject || !activePageId) return;
        const page = customPages.find(p => p.id === activePageId);
        if (!page) {
            toast.error("Select a page first");
            return;
        }

        const newCases = data.map((tc: any) => ({
            id: Date.now().toString() + Math.random().toString().slice(2, 6),
            testCaseId: tc.testCaseId || `TC-${Math.random().toString().slice(2, 6)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'Not Executed',
            ...tc
        })) as TestCase[];

        const currentData = getActivePageData();
        const updatedList = [...(currentData.testCases || []), ...newCases];

        updateLocalData(updatedList);
        persistChanges(updatedList).then(() => toast.success(`Imported ${newCases.length} test cases`));
    };

    const handleSaveTestCase = async (data: TestCase | Partial<TestCase>) => {
        if (!selectedProject || !activePageId) return;
        const page = customPages.find(p => p.id === activePageId);
        if (!page) return;

        const currentData = getActivePageData();
        let updatedList: TestCase[];

        if (selectedTestCase) {
            // Update existing
            const updatedTC = { ...selectedTestCase, ...data, updatedAt: new Date().toISOString() } as TestCase;
            updatedList = (currentData.testCases || []).map(tc => tc.id === selectedTestCase.id ? updatedTC : tc);
            setSelectedTestCase(updatedTC); // Update local selection
        } else {
            // Create new
            const newCase: TestCase = {
                id: Date.now().toString(),
                testCaseId: `TC-${Date.now().toString().slice(-4)}`,
                testScenario: 'New Scenario',
                status: 'Not Executed',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...data
            } as TestCase;
            updatedList = [...(currentData.testCases || []), newCase];
        }

        updateLocalData(updatedList);
        persistChanges(updatedList);

        toast.success(selectedTestCase ? "Saved changes" : "Created test case");

        if (!selectedTestCase) {
            setViewMode('list'); // Close editor on create
        }
    };

    const handleDeleteTestCase = async () => {
        if (!selectedTestCase || !selectedProject || !activePageId) return;
        if (!confirm("Delete this test case?")) return;

        const currentData = getActivePageData();
        const updatedList = (currentData.testCases || []).filter(tc => tc.id !== selectedTestCase.id);

        updateLocalData(updatedList);
        persistChanges(updatedList);

        setSelectedTestCase(null);
        setViewMode('list');
        toast.success("Deleted");
    };

    const handleStatusChange = (status: string) => {
        if (!selectedTestCase) return;
        // Just leverage handleSaveTestCase for partial update
        handleSaveTestCase({ status: status as any });
    };

    const handleAIGenerate = async (prompt: string) => {
        setIsGenerating(true);
        try {
            const response = await api.post('/api/ai/generate-bulk-test-cases', { prompt });
            console.log("AI Response", response);

            const generatedTestCases = Array.isArray(response) ? response : [response];

            // Format them correctly
            const newCases = generatedTestCases.map((tc: any) => ({
                id: Date.now().toString() + Math.random().toString().slice(2, 6),
                testCaseId: tc.testCaseId || `TC-${Math.random().toString().slice(2, 6)}`,
                testScenario: tc.testScenario || 'AI Generated',
                status: 'Not Executed',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...tc
            })) as TestCase[];

            const currentData = getActivePageData();
            const updatedList = [...(currentData.testCases || []), ...newCases];

            updateLocalData(updatedList);
            persistChanges(updatedList);

            toast.success(`Generated ${newCases.length} test cases`);
            setShowAiDialog(false);
        } catch (e) {
            console.error(e);
            toast.error("AI Generation Failed");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Render Logic ---
    const activeData = getActivePageData();
    const filteredCases = (activeData.testCases || []).filter(tc =>
        !searchQuery ||
        tc.testScenario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tc.testCaseId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const hasPages = customPages.length > 0;

    return (
        <div className="flex flex-col h-screen bg-background pb-20">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-background/95 backdrop-blur z-20 sticky top-0 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <LayoutGrid className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Test Cases</h1>
                    </div>

                    {/* Page Actions Menu - Only show if we have pages or to delete/rename */}
                    {hasPages && (
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
                    )}
                </div>

                {/* Search - only show if pages exist */}
                {hasPages && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search cases..."
                            className="pl-9 bg-muted/50 border-transparent focus:bg-background focus:border-input transition-all rounded-xl shadow-inner h-10"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* Page Tabs OR Empty State */}
            {hasPages ? (
                <>
                    <div className="flex overflow-x-auto p-2 gap-2 scrollbar-hide border-b bg-muted/5 shrink-0">
                        {customPages.map(page => (
                            <button key={page.id} onClick={() => handlePageChange(page.id)}
                                className={cn("px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border shadow-sm flex items-center gap-2",
                                    activePageId === page.id ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-input hover:bg-muted"
                                )}>
                                {page.name}
                                {activePageId === page.id && (
                                    <Edit2
                                        className="h-3 w-3 opacity-50 ml-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPageForm({ name: page.name, date: page.date });
                                            setIsRenamePageOpen(true);
                                        }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        <MobileTestCaseList
                            testCases={activeData.testCases || []}
                            onSelect={(tc) => {
                                setSelectedTestCase(tc);
                                setViewMode('detail');
                            }}
                            filterQuery={searchQuery}
                        />
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in duration-500">
                    <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                        <Layers className="h-10 w-10 text-indigo-500" />
                    </div>
                    <h2 className="text-xl font-bold">No Pages Yet</h2>
                    <p className="text-muted-foreground max-w-xs text-sm">
                        Create a Sprint or Page to start adding test cases. Context is key!
                    </p>
                    <Button onClick={() => setIsNewPageOpen(true)} className="gap-2">
                        Create First Page <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* View/Edit Drawers */}
            {/* View Mode (Drawer) - For Quick Access */}
            <Drawer open={viewMode === 'detail' && !!selectedTestCase} onOpenChange={(open) => !open && setViewMode('list')}>
                <DrawerContent className="max-h-[90vh]">
                    {selectedTestCase && (
                        <MobileTestCaseDetail
                            testCase={selectedTestCase}
                            isEditing={false}
                            onEditStart={() => setViewMode('edit')}
                            onEditCancel={() => { }}
                            onSave={() => { }}
                            onDelete={handleDeleteTestCase}
                            onStatusChange={handleStatusChange}
                        />
                    )}
                </DrawerContent>
            </Drawer>

            <MobileTestCaseEditor
                isOpen={viewMode === 'edit'}
                testCase={selectedTestCase || {}}
                isNew={!selectedTestCase}
                onClose={() => setViewMode(selectedTestCase ? 'detail' : 'list')}
                onSave={handleSaveTestCase}
            />

            {/* FAB - Conditionally render actions */}
            {hasPages && (
                <MobileFab
                    onNewTestCase={() => {
                        setSelectedTestCase(null);
                        setViewMode('edit');
                    }}
                    onNewPage={() => setIsNewPageOpen(true)}
                    onAiGenerate={() => setShowAiDialog(true)}
                    onImport={() => {
                        const btn = importContainerRef.current?.querySelector('button');
                        if (btn instanceof HTMLElement) btn.click();
                        else toast.error("Import tool unavailable in mobile view");
                    }}
                />
            )}

            {/* Hidden Import Dialog Trigger Wrapper */}
            <div ref={importContainerRef} className="fixed opacity-0 pointer-events-none -top-full">
                <ImportDialog type="testcases" onImport={handleImport} />
            </div>

            {/* AI Dialog */}
            <MobileAIGenDialog
                open={showAiDialog}
                onOpenChange={setShowAiDialog}
                isGenerating={isGenerating}
                onGenerate={handleAIGenerate}
            />

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
                    <DialogHeader><DialogTitle>Manage Page</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Page Name</Label>
                            <Input value={pageForm.name} onChange={e => setPageForm({ ...pageForm, name: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter className="flex-row justify-between sm:justify-between items-center gap-2">
                        <div className="flex-1">
                            <Button variant="destructive" size="sm" onClick={() => { setIsRenamePageOpen(false); handleDeletePage(); }}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                        </div>
                        <Button onClick={handleRenamePage}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
