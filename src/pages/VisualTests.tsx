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
        let token = "";
        try { token = (await getHeaders())['Authorization']?.split(' ')[1] || ""; } catch (e) { }

        setImages({
            baseline: `${API_BASE_URL}/api/visual/${testId}/baseline?t=${ts}&token=${token}`,
            latest: `${API_BASE_URL}/api/visual/${testId}/latest?t=${ts}&token=${token}`,
            diff: `${API_BASE_URL}/api/visual/${testId}/diff?t=${ts}&token=${token}`
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
        <div className="p-8 space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        Visual Regression
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Catch UI bugs before your users do.
                    </p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 transition-all hover:scale-105">
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

            {/* Dashboard Stats (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-purple-500/10 border-0 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-purple-600 font-bold text-2xl">{tests.length}</CardTitle></CardHeader>
                    <CardContent className="text-xs font-semibold text-purple-700/70">TOTAL MONITORS</CardContent>
                </Card>
                {/* We could calculate pass/fail if backend returned it. For now, just placeholders or simple counts */}
            </div>

            {/* Test Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 overflow-y-auto pb-4">
                {tests.map(test => (
                    <Card key={test.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card/50 cursor-pointer flex flex-col" onClick={() => openDetails(test)}>
                        <div className="h-[200px] w-full bg-muted/50 relative overflow-hidden flex items-center justify-center">
                            {/* Use latest image as thumbnail, fallback to placeholder */}
                            <img
                                src={`${API_BASE_URL}/api/visual/${test.id}/latest?t=${Date.now()}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                onError={(e) => { (e.target as any).src = "https://placehold.co/600x400?text=No+Snapshot"; }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); openDetails(test); }}>
                                    <Eye className="h-4 w-4 mr-2" /> Inspect
                                </Button>
                                <Button variant="default" size="sm" className="bg-purple-600" onClick={(e) => handleRun(e, test.id)}>
                                    <Play className="h-4 w-4 mr-2" /> Run
                                </Button>
                            </div>
                        </div>
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base font-semibold truncate" title={test.name}>{test.name}</CardTitle>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500 -mt-1 -mr-2" onClick={(e) => { e.stopPropagation(); setTestToDelete(test.id); }}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                            <CardDescription className="text-xs truncate">{test.target_url}</CardDescription>
                        </CardHeader>
                        {/* <CardContent className="p-4 pt-0">
                            <Badge variant="outline" className="text-[10px] mt-2">Passed</Badge>
                        </CardContent> */}
                    </Card>
                ))}

                {tests.length === 0 && (
                    <Card className="col-span-full border-dashed p-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                        <Camera className="h-12 w-12 mb-4 opacity-20" />
                        <p>No visual monitors active.</p>
                        <Button variant="link" onClick={() => setCreateOpen(true)} className="mt-2 text-purple-600">Create Monitor</Button>
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
                                {images ? (
                                    <>
                                        <TabsContent value="diff" className="w-full h-full flex items-center justify-center p-4 mt-0 animate-in fade-in zoom-in-95 duration-300">
                                            <div className="relative shadow-2xl rounded-lg overflow-hidden borderRing">
                                                <img src={images.diff} className="max-h-[70vh] object-contain" alt="Diff View" />
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
                                                    <img src={images.baseline} className="max-h-full max-w-full object-contain" alt="Baseline" />
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
                                                <img src={images.baseline} className="max-h-[70vh] object-contain" alt="Baseline" />
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
