
import React, { useState, useEffect } from 'react';
import { Route } from '@/routes/_authenticated/bugs';
import { Bug, DailyData } from '@/types';
import { api } from '@/lib/api';
import { useProject } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, Bug as BugIcon, AlertTriangle, AlertOctagon, CheckCircle2, XCircle, Clock, ChevronRight, FileText } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function MobileBugs() {
    const loaderData = Route.useLoaderData();
    const { selectedProject } = useProject();

    // State
    const [customPages, setCustomPages] = useState(loaderData.pages || []);
    const [activePageId, setActivePageId] = useState<string>(loaderData.pages && loaderData.pages.length > 0 ? loaderData.pages[0].id : '');
    const [dailyData, setDailyData] = useState<DailyData[]>(loaderData.initialData || []);
    const [searchQuery, setSearchQuery] = useState('');

    // Drawer State
    const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        setCustomPages(loaderData.pages || []);
        if (loaderData.pages && loaderData.pages.length > 0 && !activePageId) {
            setActivePageId(loaderData.pages[0].id);
        }
        if (loaderData.initialData) {
            setDailyData(loaderData.initialData);
        }
    }, [loaderData]);

    const loadDailyData = async (date: string) => {
        if (!selectedProject) return;
        try {
            const data = await api.get(`/api/projects/${selectedProject.id}/daily-data?date=${date}`);
            setDailyData(data);
        } catch (error) {
            console.error("Failed to load data", error);
        }
    };

    const getActivePageData = () => {
        const page = customPages.find(p => p.id === activePageId);
        if (!page) return { bugs: [] };
        return dailyData.find(d => d.date === page.date) || { bugs: [] };
    };

    const handlePageChange = (pageId: string) => {
        setActivePageId(pageId);
        const page = customPages.find(p => p.id === pageId);
        if (page) {
            const hasData = dailyData.some(d => d.date === page.date);
            if (!hasData) {
                loadDailyData(page.date);
            }
        }
    };

    const updateStatus = async (status: string) => {
        if (!selectedBug || !selectedProject || !activePageId) return;
        const page = customPages.find(p => p.id === activePageId);
        if (!page) return;

        // Optimistic Update
        const updatedBug = { ...selectedBug, status: status as any };
        setSelectedBug(updatedBug);

        const currentData = getActivePageData();
        const updatedList = currentData.bugs.map(b => b.id === selectedBug.id ? updatedBug : b);

        // Update Local State
        setDailyData(prev => prev.map(d => d.date === page.date ? { ...d, bugs: updatedList } : d));

        try {
            const fullData = dailyData.find(d => d.date === page.date);
            if (fullData) {
                await api.put(`/api/projects/${selectedProject.id}/daily-data/${page.date}`, {
                    testCases: fullData.testCases || [],
                    bugs: updatedList
                });
                toast.success(`Marked as ${status}`);
            }
        } catch (e) {
            toast.error("Failed to save status");
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'Open': return <Badge className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200">Open</Badge>;
            case 'In Progress': return <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-200">In Progress</Badge>;
            case 'Resolved': return <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200">Resolved</Badge>;
            case 'Closed': return <Badge className="bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-gray-200">Closed</Badge>;
            case 'Rejected': return <Badge variant="outline" className="text-muted-foreground border-dashed">Rejected</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const PriorityIcon = ({ priority }: { priority: string }) => {
        if (!priority) return null;
        const p = priority.toLowerCase();
        if (p === 'high' || p === 'critical') return <AlertOctagon className="h-3 w-3 text-red-500" />;
        if (p === 'medium') return <AlertTriangle className="h-3 w-3 text-orange-400" />;
        return <Clock className="h-3 w-3 text-blue-400" />;
    };

    // Filter
    const activeData = getActivePageData();
    const filteredBugs = (activeData.bugs || []).filter(b =>
        !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bugId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-background pb-16">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-background/95 backdrop-blur z-10 sticky top-0">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-xl font-bold">Bug Binder</h1>
                    <Button size="icon" variant="ghost" className="rounded-full">
                        <Plus className="h-6 w-6 text-primary" />
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search bugs..."
                        className="pl-9 bg-muted/50 border-none rounded-xl"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Page Tabs */}
            {customPages.length > 0 ? (
                <div className="flex overflow-x-auto p-2 gap-2 scrollbar-hide border-b bg-muted/5 shrink-0">
                    {customPages.map(page => (
                        <button
                            key={page.id}
                            onClick={() => handlePageChange(page.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                                activePageId === page.id
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-muted-foreground border-input hover:bg-muted"
                            )}
                        >
                            {page.name}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-muted-foreground">
                    <p>No bug pages found.</p>
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredBugs.length > 0 ? (
                    filteredBugs.map((bug) => (
                        <Card
                            key={bug.id}
                            className="active:scale-[0.99] transition-transform"
                            onClick={() => { setSelectedBug(bug); setIsDetailsOpen(true); }}
                        >
                            <CardContent className="p-4 flex gap-3">
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono text-muted-foreground">
                                                {bug.bugId}
                                            </Badge>
                                            <PriorityIcon priority={bug.priority} />
                                        </div>
                                        <StatusBadge status={bug.status} />
                                    </div>
                                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                                        {bug.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        {bug.module && (
                                            <span className="flex items-center gap-1">
                                                <BugIcon className="h-3 w-3" /> {bug.module}
                                            </span>
                                        )}
                                        {bug.assignee && (
                                            <span className="flex items-center gap-1">
                                                Test Team
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <BugIcon className="h-10 w-10 mb-3 opacity-20" />
                        <p>No bugs found</p>
                    </div>
                )}
            </div>

            {/* Details Drawer */}
            <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DrawerContent className="max-h-[90vh]">
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2 text-left">
                            <span className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">{selectedBug?.bugId}</span>
                            {selectedBug?.priority && (
                                <Badge variant="outline" className="text-[10px] h-5">{selectedBug.priority}</Badge>
                            )}
                        </DrawerTitle>
                        <DrawerDescription className="text-left font-medium text-foreground mt-2 text-base">
                            {selectedBug?.title}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 overflow-y-auto space-y-6">
                        {/* Status Selector */}
                        <div className="grid grid-cols-5 gap-1">
                            {['Open', 'In Progress', 'Resolved', 'Closed', 'Rejected'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => updateStatus(status)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-1 rounded-lg border gap-1 transition-all",
                                        selectedBug?.status === status
                                            ? "bg-slate-900 text-white border-slate-900"
                                            : "bg-muted border-transparent hover:bg-muted/80"
                                    )}
                                >
                                    <span className="text-[9px] font-medium text-center leading-tight py-1">{status}</span>
                                </button>
                            ))}
                        </div>

                        {/* Details */}
                        <div className="space-y-4 text-sm">
                            {selectedBug?.description && (
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-muted-foreground text-xs uppercase">Description</h4>
                                    <p className="p-3 bg-muted/30 rounded-lg whitespace-pre-wrap">{selectedBug.description}</p>
                                </div>
                            )}

                            {selectedBug?.severity && (
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-muted-foreground text-xs uppercase">Severity</h4>
                                    <div className="p-2 border rounded-lg inline-block text-xs font-semibold">
                                        {selectedBug.severity}
                                    </div>
                                </div>
                            )}

                            {selectedBug?.stepsToReproduce && (
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-muted-foreground text-xs uppercase">Steps to Reproduce</h4>
                                    <p className="p-3 bg-muted/30 rounded-lg whitespace-pre-wrap">{selectedBug.stepsToReproduce}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
