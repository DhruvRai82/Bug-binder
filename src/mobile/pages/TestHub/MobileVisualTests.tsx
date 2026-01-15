import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api, API_BASE_URL } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Play, Trash2, Eye, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MobileVisualTests() {
    const { selectedProject } = useProject();
    const [tests, setTests] = useState<any[]>([]);
    const [selectedTest, setSelectedTest] = useState<any>(null);
    const [images, setImages] = useState<any>(null);

    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newUrl, setNewUrl] = useState("");

    useEffect(() => {
        if (selectedProject) fetchTests();
    }, [selectedProject]);

    const fetchTests = async () => {
        try {
            const data = await api.get(`/api/visual?projectId=${selectedProject?.id}`);
            setTests(data);
        } catch {
            toast.error("Failed to load visual tests");
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
            toast.success("Monitor Created");
            setCreateOpen(false);
            setNewName("");
            setNewUrl("");
            fetchTests();
        } catch {
            toast.error("Failed to create");
        }
    };

    const handleRun = async (e: any, testId: string) => {
        if (e) e.stopPropagation();
        toast.info("Running Check...", { duration: 2000 });
        try {
            await api.post(`/api/visual/${testId}/run`, { projectId: selectedProject?.id });
            toast.success("Check Complete");
            fetchTests();
            if (selectedTest?.id === testId) {
                loadImages(testId);
            }
        } catch {
            toast.error("Run failed");
        }
    };

    const loadImages = (testId: string) => {
        const ts = Date.now();
        setImages({
            latest: `${API_BASE_URL}/api/visual/${testId}/latest?t=${ts}`,
            diff: `${API_BASE_URL}/api/visual/${testId}/diff?t=${ts}`
        });
    };

    const openDetails = (test: any) => {
        setSelectedTest(test);
        loadImages(test.id);
    };

    const handleDelete = async (testId: string) => {
        if (!confirm("Delete this visual monitor?")) return;
        try {
            await api.delete(`/api/visual/${testId}?projectId=${selectedProject?.id}`);
            fetchTests();
        } catch {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="space-y-4 pb-20">
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> New Monitor
            </Button>

            <div className="grid grid-cols-2 gap-3">
                {tests.map(test => (
                    <Card key={test.id} className="overflow-hidden active:scale-[0.98] transition-transform" onClick={() => openDetails(test)}>
                        <div className="aspect-video bg-muted relative">
                            <img
                                src={`${API_BASE_URL}/api/visual/${test.id}/latest?t=${Date.now()}`}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as any).src = "https://placehold.co/300x200?text=No+Img"; }}
                            />
                            <div className="absolute inset-0 bg-black/10" />
                        </div>
                        <div className="p-3">
                            <h3 className="font-semibold text-xs truncate mb-1">{test.name}</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-muted-foreground truncate max-w-[60px]">{test.target_url}</span>
                                <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => handleRun(e, test.id)}>
                                        <Play className="h-3 w-3 fill-current" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {tests.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No visual monitors.</p>
                </div>
            )}

            {/* View Drawer */}
            <Drawer open={!!selectedTest} onOpenChange={(o) => !o && setSelectedTest(null)}>
                <DrawerContent className="h-[90vh]">
                    <DrawerHeader>
                        <DrawerTitle>{selectedTest?.name}</DrawerTitle>
                        <DrawerDescription>{selectedTest?.target_url}</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Latest Screenshot</Label>
                                <Button size="sm" onClick={(e) => handleRun(e, selectedTest.id)}>Run Again</Button>
                            </div>
                            <div className="aspect-video rounded-lg overflow-hidden border">
                                {images && <img src={images.latest} className="w-full h-full object-contain" />}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Difference Overlay</Label>
                            <div className="aspect-video rounded-lg overflow-hidden border bg-muted/30">
                                {images && <img src={images.diff} className="w-full h-full object-contain" />}
                            </div>
                        </div>

                        <Button variant="destructive" className="w-full" onClick={() => {
                            handleDelete(selectedTest.id);
                            setSelectedTest(null);
                        }}>
                            Delete Monitor
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Create Drawer */}
            <Drawer open={createOpen} onOpenChange={setCreateOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>New Visual Monitor</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Homepage" />
                        </div>
                        <div className="space-y-2">
                            <Label>URL</Label>
                            <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." />
                        </div>
                        <Button className="w-full bg-purple-600" onClick={handleCreate}>Create</Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
