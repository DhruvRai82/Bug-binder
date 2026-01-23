
import React, { useState, useEffect } from 'react';
import { Route } from '@/routes/_authenticated/bugs';
import { Bug, DailyData } from '@/types';
import { api } from '@/lib/api';
import { useProject } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Search, Bug as BugIcon, Layers, ArrowRight } from 'lucide-react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

// Components
import { BugList } from '@/mobile/components/bugs/BugList';
import { BugDetail } from '@/mobile/components/bugs/BugDetail';
import { BugEditor } from '@/mobile/components/bugs/BugEditor';
import { MobileFab } from '@/mobile/components/test-cases/MobileFab'; // Reusing generic FAB or create generic
import { ImportDialog } from '@/features/test-management/ImportDialog'; // Reuse import dialog

export function MobileBugs() {
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
    const [selectedBug, setSelectedBug] = useState<Bug | null>(null);

    // Dialogs State - Reuse minimal logic for page creation since it's shared, or simplified
    const [isNewPageOpen, setIsNewPageOpen] = useState(false);

    // NOTE: Ideally page management is shared, but for now we keep local state or minimal handlers
    // If the user wants full page management here too, we can duplicate the logic or extract a hook later.
    // For now, I will assume basic read access + bug management is priority.

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
        if (!page) return { bugs: [] };
        return dailyData.find(d => d.date === page.date) || { bugs: [] };
    };

    const updateLocalData = (updatedList: Bug[]) => {
        const page = customPages.find(p => p.id === activePageId);
        if (!page) return;
        setDailyData(prev => prev.map(d => d.date === page.date ? { ...d, bugs: updatedList } : d));
    };

    const persistChanges = async (updatedList: Bug[]) => {
        const page = customPages.find(p => p.id === activePageId);
        if (!page || !selectedProject) return;
        const fullData = dailyData.find(d => d.date === page.date);
        try {
            await api.put(`/api/projects/${selectedProject.id}/daily-data/${page.date}`, {
                testCases: fullData?.testCases || [],
                bugs: updatedList
            });
        } catch (e) {
            console.error(e);
            toast.error("Failed to save changes");
        }
    };

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
    const handleSaveBug = async (data: Bug | Partial<Bug>) => {
        if (!selectedProject || !activePageId) return;
        const page = customPages.find(p => p.id === activePageId);
        if (!page) return;

        const currentData = getActivePageData();
        let updatedList: Bug[];

        if (selectedBug) {
            // Update existing
            const updatedBug = { ...selectedBug, ...data, updatedAt: new Date().toISOString() } as Bug;
            updatedList = (currentData.bugs || []).map(b => b.id === selectedBug.id ? updatedBug : b);
            setSelectedBug(updatedBug);
        } else {
            // Create new
            const newBug: Bug = {
                id: Date.now().toString(),
                bugId: `BUG-${Date.now().toString().slice(-4)}`,
                status: 'Open',
                priority: 'Medium',
                severity: 'Medium',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...data
            } as Bug;
            updatedList = [...(currentData.bugs || []), newBug];
        }

        updateLocalData(updatedList);
        persistChanges(updatedList);

        toast.success(selectedBug ? "Saved changes" : "Created bug");
        if (!selectedBug) setViewMode('list');
    };

    const handleDeleteBug = async () => {
        if (!selectedBug || !selectedProject || !activePageId) return;
        if (!confirm("Delete this bug?")) return;

        const currentData = getActivePageData();
        const updatedList = (currentData.bugs || []).filter(b => b.id !== selectedBug.id);

        updateLocalData(updatedList);
        persistChanges(updatedList);

        setSelectedBug(null);
        setViewMode('list');
        toast.success("Deleted");
    };

    // --- Render Logic ---
    const activeData = getActivePageData();
    const hasPages = customPages.length > 0;

    return (
        <div className="flex flex-col h-screen bg-background pb-20">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-background/95 backdrop-blur z-20 sticky top-0 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <BugIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Bugs</h1>
                </div>

                {/* Search */}
                {hasPages && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search bugs..."
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
                                className={cn("px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border shadow-sm",
                                    activePageId === page.id ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-input hover:bg-muted"
                                )}>
                                {page.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        <BugList
                            bugs={activeData.bugs || []}
                            onSelect={(bug) => {
                                setSelectedBug(bug);
                                setViewMode('detail');
                            }}
                            filterQuery={searchQuery}
                        />
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-2">
                        <Layers className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-bold">No Pages Yet</h2>
                    <p className="text-muted-foreground max-w-xs text-sm">
                        Go to Test Cases to create a page first.
                    </p>
                </div>
            )}

            {/* View/Edit Drawers */}
            <Drawer open={viewMode === 'detail' && !!selectedBug} onOpenChange={(open) => !open && setViewMode('list')}>
                <DrawerContent className="max-h-[90vh]">
                    {selectedBug && (
                        <BugDetail
                            bug={selectedBug}
                            onEdit={() => setViewMode('edit')}
                            onDelete={handleDeleteBug}
                            onClose={() => setViewMode('list')}
                        />
                    )}
                </DrawerContent>
            </Drawer>

            <BugEditor
                isOpen={viewMode === 'edit'}
                bug={selectedBug || {}}
                isNew={!selectedBug}
                onClose={() => setViewMode(selectedBug ? 'detail' : 'list')}
                onSave={handleSaveBug}
            />

            {/* FAB - Using Generic FAB but stripping unwanted actions if needed */}
            {hasPages && (
                <MobileFab
                    onNewTestCase={() => {
                        // Hijack for New Bug
                        setSelectedBug(null);
                        setViewMode('edit');
                    }}
                    onNewPage={() => { }} // Disabled here
                    onAiGenerate={() => { }} // Disabled
                    onImport={() => { }} // Disabled
                />
            )}
        </div>
    );
}
