import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProject } from '@/context/ProjectContext';
import { api, API_BASE_URL, getHeaders } from '@/lib/api';
import { Eye, Check, X, AlertTriangle, Play, Plus, Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';

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

    useEffect(() => {
        if (selectedProject) fetchTests();
    }, [selectedProject]);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/api/visual?projectId=${selectedProject.id}`);
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
            await api.delete(`/api/visual/${testToDelete}`);
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
        e.stopPropagation();
        toast.info("Running Visual Test...", { duration: 2000 });
        try {
            const result = await api.post(`/api/visual/${testId}/run`, {});
            if (result.diffPercentage > 0) {
                toast.warning(`Mismatch detected: ${result.diffPercentage.toFixed(2)}%`);
            } else {
                toast.success("Test Passed: No Visual Changes");
            }
            // Refresh images if this test is selected
            if (selectedTest?.id === testId) {
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

    const handleApprove = async () => {
        if (!selectedTest) return;
        try {
            await api.post(`/api/visual/${selectedTest.id}/approve`, {});
            toast.success("Changes Approved! New Baseline Set.");
            loadImages(selectedTest.id); // Reload to show baseline match
        } catch (e) {
            toast.error("Failed to approve");
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        Visual Regression Tests
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Compare UI snapshots against baselines.
                    </p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="h-4 w-4 mr-2" /> New Test
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Valid Test</DialogTitle>
                            <DialogDescription>
                                Define a new visual regression test case.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Test Name</Label>
                                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Homepage Hero" />
                            </div>
                            <div className="space-y-2">
                                <Label>Target URL</Label>
                                <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://example.com" />
                            </div>
                            <Button className="w-full" onClick={handleCreate}>Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Test List */}
                <Card className="col-span-1 h-[600px] border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Tests</CardTitle>
                        <CardDescription>Select a test to review</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {tests.map(test => (
                                <div
                                    key={test.id}
                                    onClick={() => { setSelectedTest(test); loadImages(test.id); }}
                                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors flex justify-between items-center ${selectedTest?.id === test.id ? 'bg-muted border-primary' : ''}`}
                                >
                                    <div className="flex items-center gap-2 font-medium">
                                        <Camera className="h-4 w-4 text-purple-500" />
                                        <div className="overflow-hidden">
                                            <div className="truncate w-[150px]">{test.name}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">{test.target_url}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-purple-100 hover:text-purple-600" onClick={(e) => handleRun(e, test.id)}>
                                            <Play className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100 hover:text-red-600" onClick={(e) => { e.stopPropagation(); setTestToDelete(test.id); }}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Viewer */}
                <Card className="col-span-2 min-h-[600px] border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Snapshot Viewer</CardTitle>
                            <CardDescription>
                                {selectedTest ? selectedTest.name : "Select a test"}
                            </CardDescription>
                        </div>
                        {selectedTest && (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleRun({ stopPropagation: () => { } }, selectedTest.id)}>
                                    <Play className="h-4 w-4 mr-1" /> Re-Run
                                </Button>
                                <Button variant="default" size="sm" onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                                    <Check className="h-4 w-4 mr-1" /> Approve Difference
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {selectedTest && images ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="font-semibold text-center text-sm text-muted-foreground">Baseline</div>
                                        <div className="border rounded-lg overflow-hidden h-[250px] relative bg-slate-900 group">
                                            <img src={images.baseline} alt="Baseline" className="w-full h-full object-contain"
                                                onError={(e) => { (e.target as any).src = "https://placehold.co/600x400?text=No+Baseline"; }} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="font-semibold text-center text-sm text-muted-foreground">Latest Run</div>
                                        <div className="border rounded-lg overflow-hidden h-[250px] relative bg-slate-900">
                                            <img src={images.latest} alt="Latest" className="w-full h-full object-contain"
                                                onError={(e) => { (e.target as any).src = "https://placehold.co/600x400?text=No+Run+Data"; }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="font-semibold text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" /> Diff View
                                    </div>
                                    <div className="border rounded-lg overflow-hidden h-[300px] relative bg-slate-900">
                                        <img src={images.diff} alt="Diff" className="w-full h-full object-contain"
                                            onError={(e) => { (e.target as any).style.display = 'none'; }} />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground text-sm">
                                            (Diff highlighted here)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                                <Eye className="h-12 w-12 mb-4 opacity-50" />
                                Select a test to view snapshots.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmationDialog
                open={!!testToDelete}
                onOpenChange={(open) => !open && setTestToDelete(null)}
                onConfirm={confirmDeleteTest}
                title="Delete Visual Test?"
                description="This will delete the test configuration and all historical snapshots (baseline, latest, diffs)."
            />
        </div>
    );
}
