import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProject } from '@/context/ProjectContext';
import { api, API_BASE_URL, getHeaders } from '@/lib/api';
import { Eye, Check, X, AlertTriangle, Play, Plus, Camera, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DeleteConfirmationDialog } from '@/features/test-management/DeleteConfirmationDialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VisualTests() {
    const { selectedProject } = useProject();
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTest, setSelectedTest] = useState<any | null>(null);
    const [images, setImages] = useState<{ baseline: string, latest: string, diff: string } | null>(null);
    const [token, setToken] = useState<string>("");

    useEffect(() => {
        getHeaders().then(headers => {
            const t = headers['Authorization']?.split(' ')[1];
            if (t) setToken(t);
        });
    }, []);

    // Create Form
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newUrl, setNewUrl] = useState("");

    // Details Dialog
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        if (selectedProject) fetchTests();
    }, [selectedProject]);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/api/visual?projectId=${selectedProject?.id}`);
            setTests(data);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load visual tests");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newName || !newUrl) return toast.error("Fill all fields");
        try {
            await api.post('/api/visual', {
                name: newName,
                targetUrl: newUrl,
                projectId: selectedProject?.id
            });
            toast.success("Visual Test Created");
            setCreateOpen(false);
            fetchTests();
        } catch {
            toast.error("Failed to create test");
        }
    };

    const [testToDelete, setTestToDelete] = useState<string | null>(null);

    const confirmDeleteTest = async () => {
        if (!testToDelete) return;
        try {
            await api.delete(`/api/visual/${testToDelete}?projectId=${selectedProject?.id}`);
            setTests(prev => prev.filter(t => t.id !== testToDelete));
            toast.success('Test deleted');
            setSelectedTest(null);
            setImages(null);
            setTestToDelete(null);
        } catch (error) {
            toast.error('Failed to delete test');
        }
    };

    const handleRun = async (e: any, testId: string) => {
        if (e) e.stopPropagation();
        toast.info("Running Visual Test...", { duration: 2000 });
        try {
            const result = await api.post(`/api/visual/${testId}/run`, { projectId: selectedProject?.id });
            if (result.diffPercentage > 0) {
                toast.warning(`Mismatch detected: ${result.diffPercentage.toFixed(2)}%`);
            } else {
                toast.success("Test Passed: No Visual Changes");
            }
            fetchTests(); // Refresh last run status if valid
            if (selectedTest?.id === testId && detailsOpen) {
                loadImages(testId);
            }
        } catch {
            toast.error("Run failed");
        }
    };

    const loadImages = async (testId: string) => {
        const ts = Date.now();
        // Use state token if available, else try fetch (though effect should have caught it)
        let currentToken = token;
        if (!currentToken) {
            try { currentToken = (await getHeaders())['Authorization']?.split(' ')[1] || ""; } catch (e) { }
        }

        setImages({
            baseline: `${API_BASE_URL}/api/visual/${testId}/baseline?t=${ts}&token=${currentToken}`,
            latest: `${API_BASE_URL}/api/visual/${testId}/latest?t=${ts}&token=${currentToken}`,
            diff: `${API_BASE_URL}/api/visual/${testId}/diff?t=${ts}&token=${currentToken}`
        });
    };

    const openDetails = (test: any) => {
        setSelectedTest(test);
        loadImages(test.id);
        setDetailsOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedTest) return;
        try {
            await api.post(`/api/visual/${selectedTest.id}/approve`, { projectId: selectedProject?.id });
            toast.success("Changes Approved! New Baseline Set.");
            loadImages(selectedTest.id); // Reload to show baseline match
        } catch (e) {
            toast.error("Failed to approve");
        }
    };

    return (
        <div className="h-full flex flex-col p-8 pt-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 flex-shrink-0">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Visual Regression
                    </h1>
                    <p className="text-muted-foreground max-w-lg">
                        Catch UI bugs before your users do. Monitor visual changes across your application.
                    </p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 transition-all hover:scale-105 border-0 text-white">
                            <Plus className="h-4 w-4 mr-2" /> New Visual Test
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="border-0 bg-card/95 backdrop-blur-xl shadow-2xl sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <div className="p-2 bg-purple-500/10 rounded-md">
                                    <Camera className="h-5 w-5 text-purple-600" />
                                </div>
                                Create Visual Monitor
                            </DialogTitle>
                            <DialogDescription>
                                Set up a new regression test to track UI changes.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-5 py-4">
                            <div className="space-y-2 group">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground group-focus-within:text-purple-600 transition-colors">Test Name</Label>
                                <Input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. Homepage Hero Section"
                                    className="bg-background/50 border-input/50 focus:border-purple-500 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground group-focus-within:text-purple-600 transition-colors">Target URL</Label>
                                <Input
                                    value={newUrl}
                                    onChange={e => setNewUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="bg-background/50 border-input/50 focus:border-purple-500 transition-all font-mono text-xs"
                                />
                            </div>
                            <Button className="w-full bg-purple-600 hover:bg-purple-700 shadow-md" onClick={handleCreate} disabled={!newName || !newUrl}>
                                Create Monitor
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 group">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-500 group-hover:scale-110 transition-transform origin-left">{tests.length}</CardTitle>
                        <Camera className="h-5 w-5 text-purple-400 opacity-50" />
                    </CardHeader>
                    <CardContent className="text-xs font-bold text-purple-700/60 dark:text-purple-300/60 tracking-wider">TOTAL MONITORS</CardContent>
                </Card>
                {/* Future Stats can go here */}
            </div>

            {/* Test Gallery Grid - Premium Glass Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 overflow-y-auto pb-6">
                {tests.map(test => (
                    <Card
                        key={test.id}
                        className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md cursor-pointer flex flex-col ring-1 ring-black/5 dark:ring-white/10 hover:ring-purple-500/40 transform hover:-translate-y-1"
                        onClick={() => openDetails(test)}
                    >
                        <div className="h-[220px] w-full bg-muted/50 relative overflow-hidden flex items-center justify-center">
                            {test.status === 'new' ? (
                                <div className="flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
                                    <Camera className="h-8 w-8 opacity-50" />
                                    <span className="text-xs font-medium uppercase tracking-wider">Ready to Run</span>
                                </div>
                            ) : (
                                <img
                                    src={`${API_BASE_URL}/api/visual/${test.id}/latest?t=${Date.now()}&token=${token}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-[0.95] group-hover:brightness-100"
                                    onError={(e) => { (e.target as any).src = "https://placehold.co/600x400/f3e8ff/purple?text=No+Snapshot"; }}
                                />
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end pb-6 gap-3">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex gap-3">
                                    <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); openDetails(test); }} className="backdrop-blur-md bg-white/20 text-white hover:bg-white/40 border-0">
                                        <Eye className="h-4 w-4 mr-2" /> Inspect
                                    </Button>
                                    <Button variant="default" size="sm" className="bg-purple-600 text-white shadow-lg hover:bg-purple-700 border-0" onClick={(e) => handleRun(e, test.id)}>
                                        <Play className="h-4 w-4 mr-2" /> Run Check
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <CardHeader className="p-5 pb-3 relative">
                            <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1 min-w-0">
                                    <CardTitle className="text-base font-bold truncate text-foreground/90 group-hover:text-purple-600 transition-colors" title={test.name}>{test.name}</CardTitle>
                                    <CardDescription className="text-xs truncate font-mono text-muted-foreground/80 bg-muted/50 px-1.5 py-0.5 rounded inline-block max-w-full">{test.target_url}</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/50 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setTestToDelete(test.id); }}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </CardHeader>
                        {/* <CardContent className="p-4 pt-0">
                            <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                        </CardContent> */}
                    </Card>
                ))}

                {tests.length === 0 && (
                    <Card className="col-span-full border-2 border-dashed border-purple-200 dark:border-purple-900/30 rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-purple-50/20 dark:bg-purple-900/5 h-[400px]">
                        <div className="h-24 w-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg mb-6 ring-4 ring-purple-50 dark:ring-purple-900/20">
                            <Camera className="h-10 w-10 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground/80">No visual monitors active</h3>
                        <p className="max-w-xs text-center mt-2 text-muted-foreground">Start tracking visual regressions by creating your first monitor.</p>
                        <Button variant="default" onClick={() => setCreateOpen(true)} className="mt-6 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/30">
                            <Plus className="h-4 w-4 mr-2" /> Create First Monitor
                        </Button>
                    </Card>
                )}
            </div>

            <DeleteConfirmationDialog
                open={!!testToDelete}
                onOpenChange={(open) => !open && setTestToDelete(null)}
                onConfirm={confirmDeleteTest}
                title="Delete Visual Test?"
                description="This will delete the test configuration and all historical snapshots."
            />

            {/* Detail Viewer Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-[1200px] h-[90vh] flex flex-col border-0 bg-background/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 border-b bg-muted/20 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                    {selectedTest?.name}
                                    <Badge variant="outline" className="font-mono font-normal text-muted-foreground">ID: {selectedTest?.id.slice(0, 6)}</Badge>
                                </DialogTitle>
                                <DialogDescription className="font-mono text-xs text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-sm inline-block">
                                    {selectedTest?.target_url}
                                </DialogDescription>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={(e) => handleRun(null, selectedTest.id)} className="shadow-sm border border-input/50">
                                    <Play className="h-4 w-4 mr-2" /> Run Check
                                </Button>
                                <Button className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20" onClick={handleApprove}>
                                    <Check className="h-4 w-4 mr-2" /> Approve Baseline
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden bg-muted/5 p-6">
                        <Tabs defaultValue="diff" className="h-full flex flex-col">
                            <div className="flex justify-center mb-6">
                                <TabsList className="grid w-[400px] grid-cols-3 bg-muted/50 p-1 border">
                                    <TabsTrigger value="diff" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Difference</TabsTrigger>
                                    <TabsTrigger value="side-by-side" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Side-by-Side</TabsTrigger>
                                    <TabsTrigger value="baseline" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Baseline Only</TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 bg-card border rounded-xl shadow-inner overflow-hidden relative flex items-center justify-center group">
                                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none" />
                                {selectedTest?.status === 'new' ? (
                                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-4">
                                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                                            <Camera className="h-8 w-8 opacity-50" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-semibold text-lg">No Baseline Established</h3>
                                            <p className="text-sm text-muted-foreground max-w-xs mt-1">Run the test first, then approve the result to set a baseline.</p>
                                        </div>
                                        <Button variant="default" onClick={(e) => handleRun(e, selectedTest.id)} className="mt-2">
                                            <Play className="h-4 w-4 mr-2" /> Run First Test
                                        </Button>
                                    </div>
                                ) : images ? (
                                    <>
                                        <TabsContent value="diff" className="w-full h-full flex items-center justify-center p-4 mt-0 animate-in fade-in zoom-in-95 duration-300">
                                            <div className="relative shadow-2xl rounded-lg overflow-hidden borderRing">
                                                <img src={images.diff} className="max-h-[70vh] object-contain" alt="Diff View" onError={(e) => (e.target as any).style.display = 'none'} />
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                                                    Diff Overlay
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="side-by-side" className="w-full h-full flex gap-4 p-4 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="flex-1 flex flex-col min-w-0">
                                                <div className="flex items-center justify-between mb-2 px-1">
                                                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500" /> Baseline
                                                    </span>
                                                </div>
                                                <div className="flex-1 border rounded-lg bg-white/50 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-sm relative">
                                                    <img src={images.baseline} className="max-h-full max-w-full object-contain" alt="Baseline" onError={(e) => (e.target as any).src = "https://placehold.co/600x400/f1f5f9/grey?text=No+Baseline"} />
                                                </div>
                                            </div>
                                            <div className="flex-1 flex flex-col min-w-0">
                                                <div className="flex items-center justify-between mb-2 px-1">
                                                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
                                                        <div className="w-2 h-2 rounded-full bg-purple-500" /> Latest Run
                                                    </span>
                                                </div>
                                                <div className="flex-1 border rounded-lg bg-white/50 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-sm relative">
                                                    <img src={images.latest} className="max-h-full max-w-full object-contain" alt="Latest" />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="baseline" className="w-full h-full flex items-center justify-center p-4 mt-0 animate-in fade-in zoom-in-95 duration-300">
                                            <div className="relative shadow-xl rounded-lg overflow-hidden">
                                                <img src={images.baseline} className="max-h-[70vh] object-contain" alt="Baseline" onError={(e) => (e.target as any).src = "https://placehold.co/600x400/f1f5f9/grey?text=No+Baseline"} />
                                            </div>
                                        </TabsContent>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                                        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                        <p className="text-sm font-medium animate-pulse">Loading high-res snapshots...</p>
                                    </div>
                                )}
                            </div>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
