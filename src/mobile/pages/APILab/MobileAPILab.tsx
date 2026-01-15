import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { MobileNavBar } from '@/components/common/MobileNavBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Plus, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import RunnerDrawer from './RunnerDrawer';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MobileAPILab() {
    const { selectedProject } = useProject();
    const [collections, setCollections] = useState<any[]>([]);

    // Runner State
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Create State
    const [createOpen, setCreateOpen] = useState(false);
    const [newColName, setNewColName] = useState("");

    // Create Request State
    const [createReqOpen, setCreateReqOpen] = useState(false);
    const [newReqName, setNewReqName] = useState("");
    const [newReqMethod, setNewReqMethod] = useState("GET");
    const [activeColId, setActiveColId] = useState<string | null>(null);

    useEffect(() => {
        if (selectedProject) fetchCollections();
    }, [selectedProject]);

    const fetchCollections = async () => {
        try {
            const data = await api.get(`/api/lab/collections?projectId=${selectedProject?.id}`);
            setCollections(data);
        } catch { toast.error("Failed to load collections"); }
    };

    const fetchRequests = async (colId: string) => {
        try {
            const reqs = await api.get(`/api/lab/collections/${colId}/requests?projectId=${selectedProject?.id}`);
            setCollections(prev => prev.map(c => c.id === colId ? { ...c, requests: reqs } : c));
        } catch { toast.error("Failed to load requests"); }
    };

    const handleOpenRequest = (req: any) => {
        setSelectedRequest(req);
        setDrawerOpen(true);
    };

    const handleSaveRequest = async (updatedReq: any) => {
        try {
            await api.put(`/api/lab/requests/${updatedReq.id}`, {
                ...updatedReq,
                projectId: selectedProject?.id
            });
            toast.success("Saved");
            // Refresh parent collection if needed, or optimistic update:
            setCollections(prev => prev.map(c => ({
                ...c,
                requests: c.requests?.map((r: any) => r.id === updatedReq.id ? updatedReq : r)
            })));
        } catch { toast.error("Save Failed"); }
    };

    const handleCreateCollection = async () => {
        if (!newColName) return;
        try {
            await api.post('/api/lab/collections', { name: newColName, projectId: selectedProject?.id });
            toast.success("Collection created");
            setCreateOpen(false);
            setNewColName("");
            fetchCollections();
        } catch { toast.error("Failed"); }
    };

    const handlePrepareCreateRequest = (colId: string) => {
        setActiveColId(colId);
        setNewReqName("");
        setNewReqMethod("GET");
        setCreateReqOpen(true);
    };

    const handleCreateStartRequest = async () => {
        if (!activeColId || !newReqName) return;
        try {
            const newReq = await api.post('/api/lab/requests', {
                collectionId: activeColId,
                name: newReqName,
                method: newReqMethod,
                url: '',
                projectId: selectedProject?.id
            });
            toast.success("Request Created");
            setCreateReqOpen(false);

            // Refresh requests for that collection
            const reqs = await api.get(`/api/lab/collections/${activeColId}/requests?projectId=${selectedProject?.id}`);

            // Update Interface
            setCollections(prev => prev.map(c => c.id === activeColId ? { ...c, requests: reqs } : c));

            // Open it immediately
            setSelectedRequest(newReq);
            setDrawerOpen(true);

        } catch { toast.error("Failed to create request"); }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <MobileNavBar />

            <div className="p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Globe className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">API Runner</h1>
                            <p className="text-sm text-muted-foreground">Test endpoints on the go</p>
                        </div>
                    </div>
                </div>

                {/* Create Action */}
                <Button variant="outline" className="w-full border-dashed" onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> New Collection
                </Button>

                {/* Create Collection Dialog */}
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>New Collection</DialogTitle></DialogHeader>
                        <div className="space-y-4 pt-4">
                            <Input placeholder="Collection Name" value={newColName} onChange={e => setNewColName(e.target.value)} />
                            <Button className="w-full bg-blue-600" onClick={handleCreateCollection}>Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Create Request Dialog */}
                <Dialog open={createReqOpen} onOpenChange={setCreateReqOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>New Request</DialogTitle></DialogHeader>
                        <div className="space-y-4 pt-4">
                            <Input placeholder="Request Name" value={newReqName} onChange={e => setNewReqName(e.target.value)} />
                            <Select value={newReqMethod} onValueChange={setNewReqMethod}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button className="w-full bg-blue-600" onClick={handleCreateStartRequest}>Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Collections List */}
                <Accordion type="multiple" className="space-y-2">
                    {collections.map(col => (
                        <AccordionItem value={col.id} key={col.id} className="border rounded-xl px-4 bg-muted/10 data-[state=open]:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between pr-2">
                                <AccordionTrigger onClick={() => {
                                    // Always fetch to ensure we get data even if initialized as empty array
                                    fetchRequests(col.id);
                                }} className="hover:no-underline py-4 flex-1">
                                    <span className="font-semibold text-sm">{col.name}</span>
                                </AccordionTrigger>
                                <Button size="sm" variant="ghost" className="h-8 w-8 text-blue-600" onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrepareCreateRequest(col.id);
                                }}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <AccordionContent className="pb-4 pt-0">
                                <div className="space-y-2">
                                    {col.requests && col.requests.length > 0 ? (
                                        col.requests.map((req: any) => (
                                            <div
                                                key={req.id}
                                                onClick={() => handleOpenRequest(req)}
                                                className="flex items-center justify-between p-3 rounded-lg bg-background border shadow-sm active:scale-[0.98] transition-transform"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono uppercase bg-muted/50 border-0">
                                                        {req.method}
                                                    </Badge>
                                                    <span className="text-sm font-medium truncate">{req.name}</span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-xs text-muted-foreground italic">
                                            No requests. Tap + to add one.
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                    {collections.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Globe className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No collections found.</p>
                        </div>
                    )}
                </Accordion>
            </div>

            <RunnerDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                request={selectedRequest}
                projectId={selectedProject?.id}
                onSave={handleSaveRequest}
            />
        </div>
    );
}
