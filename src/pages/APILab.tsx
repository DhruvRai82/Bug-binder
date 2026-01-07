import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, FileCode, Play, Plus, Save, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { CreateCollectionDialog } from '@/components/CreateCollectionDialog';
import { CreateRequestDialog } from '@/components/CreateRequestDialog';

export default function APILab() {
    const { selectedProject } = useProject();
    const [collections, setCollections] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [response, setResponse] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    // Request State (Synced with selectedRequest or standalone)
    const [method, setMethod] = useState("GET");
    const [url, setUrl] = useState("");
    const [headers, setHeaders] = useState("{\n  \"Content-Type\": \"application/json\"\n}");
    const [body, setBody] = useState("");

    useEffect(() => {
        if (selectedProject) fetchCollections();
    }, [selectedProject]);

    useEffect(() => {
        if (selectedRequest) {
            setMethod(selectedRequest.method);
            setUrl(selectedRequest.url);
            setHeaders(JSON.stringify(selectedRequest.headers || {}, null, 2));
            setBody(selectedRequest.body || "");
            setResponse(null);
        }
    }, [selectedRequest]);

    const fetchCollections = async () => {
        try {
            const data = await api.get(`/api/lab/collections?projectId=${selectedProject?.id}`);
            setCollections(data);
        } catch { toast.error("Failed to load collections"); }
    };

    const handleSend = async () => {
        if (!url) return toast.error("Enter a URL");
        setLoading(true);
        try {
            let parsedHeaders = {};
            try { parsedHeaders = JSON.parse(headers); } catch { return toast.error("Invalid Headers JSON"); }

            const res = await api.post('/api/lab/proxy', {
                method,
                url,
                headers: parsedHeaders,
                body: body ? JSON.parse(body) : undefined
            });
            setResponse(res);
        } catch (e: any) {
            setResponse({
                status: 0,
                statusText: "Network Error",
                data: e.message
            });
        } finally {
            setLoading(false);
        }
    };

    const [showCollectionDialog, setShowCollectionDialog] = useState(false);
    const [showRequestDialog, setShowRequestDialog] = useState(false);
    const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

    const handleSave = async () => {
        if (!selectedRequest) return toast.error("Select a request to save");
        try {
            await api.put(`/api/lab/requests/${selectedRequest.id}`, {
                method,
                url,
                headers: JSON.parse(headers),
                body,
                projectId: selectedProject?.id
            });

            // Optimistic Update (Local State)
            setCollections(prev => prev.map(col => ({
                ...col,
                requests: (col.requests || []).map((r: any) =>
                    r.id === selectedRequest.id
                        ? { ...r, method, url, headers: JSON.parse(headers), body }
                        : r
                )
            })));

            toast.success("Saved successfully");
        } catch { toast.error("Save Failed"); }
    };

    const handleCreateCollection = async (name: string) => {
        try {
            await api.post('/api/lab/collections', { name, projectId: selectedProject?.id });
            fetchCollections();
        } catch { toast.error("Failed"); }
    };

    const handleCreateRequest = async (name: string, method: string) => {
        if (!activeCollectionId) return;
        try {
            await api.post('/api/lab/requests', {
                collectionId: activeCollectionId,
                name,
                method,
                url: '',
                projectId: selectedProject?.id
            });
            fetchCollections();
        } catch { toast.error("Failed"); }
    };

    const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);
    const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

    const confirmDeleteCollection = async () => {
        if (!collectionToDelete) return;
        try {
            await api.delete(`/api/lab/collections/${collectionToDelete}?projectId=${selectedProject?.id}`);
            fetchCollections();
            setCollectionToDelete(null);
        } catch { toast.error("Delete Failed"); }
    };

    const confirmDeleteRequest = async () => {
        if (!requestToDelete) return;
        try {
            await api.delete(`/api/lab/requests/${requestToDelete}?projectId=${selectedProject?.id}`);
            fetchCollections();
            if (selectedRequest?.id === requestToDelete) setSelectedRequest(null);
            setRequestToDelete(null);
        } catch { toast.error("Delete Failed"); }
    };

    return (
        <div className="flex h-[calc(100vh-3rem)]">
            {/* Sidebar */}
            <div className="w-[300px] border-r bg-muted/10 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <span className="font-semibold">Collections</span>
                    <Button variant="ghost" size="icon" onClick={() => setShowCollectionDialog(true)}><Plus className="h-4 w-4" /></Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
                        {collections.map(col => (
                            <div key={col.id} className="space-y-1">
                                <div
                                    className="flex items-center justify-between px-2 py-1 hover:bg-muted rounded group cursor-pointer select-none"
                                    onClick={async () => {
                                        // Toggle Expand / Fetch
                                        if (!col.expanded) {
                                            // Fetch if empty
                                            if (!col.requests || col.requests.length === 0) {
                                                try {
                                                    const reqs = await api.get(`/api/lab/collections/${col.id}/requests?projectId=${selectedProject?.id}`);
                                                    setCollections(prev => prev.map(c => c.id === col.id ? { ...c, requests: reqs, expanded: true } : c));
                                                } catch { toast.error("Failed to load requests"); }
                                            } else {
                                                // Just expand
                                                setCollections(prev => prev.map(c => c.id === col.id ? { ...c, expanded: true } : c));
                                            }
                                        } else {
                                            // Collapse
                                            setCollections(prev => prev.map(c => c.id === col.id ? { ...c, expanded: false } : c));
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-2 font-medium">
                                        {col.expanded ? <ChevronDown className="h-4 w-4 text-orange-500" /> : <ChevronRight className="h-4 w-4 text-orange-500" />}
                                        <span className="truncate w-[150px]">{col.name}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setActiveCollectionId(col.id); setShowRequestDialog(true); }}><Plus className="h-3 w-3" /></Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={(e) => { e.stopPropagation(); setCollectionToDelete(col.id); }}><Trash2 className="h-3 w-3" /></Button>
                                    </div>
                                </div>
                                {col.expanded && (
                                    <div className="pl-6 space-y-1">
                                        {(col.requests || []).map((req: any) => (
                                            <div
                                                key={req.id}
                                                onClick={() => setSelectedRequest(req)}
                                                className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer text-sm ${selectedRequest?.id === req.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold w-10 ${req.method === 'GET' ? 'text-green-600' : req.method === 'POST' ? 'text-blue-600' : 'text-orange-600'}`}>{req.method}</span>
                                                    <span className="truncate w-[120px]">{req.name}</span>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setRequestToDelete(req.id); }}><Trash2 className="h-3 w-3" /></Button>
                                            </div>
                                        ))}
                                    </div>

                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <DeleteConfirmationDialog
                    open={!!collectionToDelete}
                    onOpenChange={(open) => !open && setCollectionToDelete(null)}
                    onConfirm={confirmDeleteCollection}
                    title="Delete Collection?"
                    description="This will delete the entire collection and all requests inside it."
                />
                <DeleteConfirmationDialog
                    open={!!requestToDelete}
                    onOpenChange={(open) => !open && setRequestToDelete(null)}
                    onConfirm={confirmDeleteRequest}
                    title="Delete Request?"
                    description="This will permanently delete this request."
                />
                <CreateCollectionDialog
                    open={showCollectionDialog}
                    onOpenChange={setShowCollectionDialog}
                    onSave={handleCreateCollection}
                />
                <CreateRequestDialog
                    open={showRequestDialog}
                    onOpenChange={setShowRequestDialog}
                    onSave={handleCreateRequest}
                />
            </div >

            {/* Main Area */}
            < div className="flex-1 flex flex-col min-w-0" >
                {/* Request Bar */}
                < div className="p-4 border-b flex gap-2 items-center bg-background" >
                    <Select value={method} onValueChange={setMethod}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Enter URL (e.g. https://api.example.com/users)" className="flex-1 font-mono" />
                    <Button onClick={handleSend} disabled={loading} className="w-[100px]">
                        {loading ? "Sending..." : <><Play className="h-4 w-4 mr-2" /> Send</>}
                    </Button>
                    <Button variant="outline" onClick={handleSave} disabled={!selectedRequest}>
                        <Save className="h-4 w-4" />
                    </Button>
                </div >

                {/* Editors */}
                < div className="flex-1 flex flex-col md:flex-row min-h-0" >
                    {/* Request Params/Body */}
                    < div className="flex-1 border-r flex flex-col" >
                        <Tabs defaultValue="body" className="flex-1 flex flex-col">
                            <TabsList className="w-full justify-start rounded-none border-b px-4 h-10 bg-muted/20">
                                <TabsTrigger value="params">Params</TabsTrigger>
                                <TabsTrigger value="headers">Headers</TabsTrigger>
                                <TabsTrigger value="body">Body</TabsTrigger>
                            </TabsList>
                            <TabsContent value="body" className="flex-1 p-0 m-0">
                                <textarea
                                    className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-background"
                                    placeholder="{json: body}"
                                    value={body}
                                    onChange={e => setBody(e.target.value)}
                                />
                            </TabsContent>
                            <TabsContent value="headers" className="flex-1 p-0 m-0">
                                <textarea
                                    className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-background"
                                    placeholder='{ "Authorization": "Bearer..." }'
                                    value={headers}
                                    onChange={e => setHeaders(e.target.value)}
                                />
                            </TabsContent>
                        </Tabs>
                    </div >

                    {/* Response */}
                    < div className="flex-1 flex flex-col bg-muted/5" >
                        <div className="h-10 border-b px-4 flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
                            <span>Response</span>
                            {response && (
                                <div className="flex gap-4">
                                    <span className={response.status >= 200 && response.status < 300 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                                        {response.status} {response.statusText}
                                    </span>
                                    <span>{response.duration}ms</span>
                                    <span>{response.size} B</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            {response ? (
                                <pre className="text-xs font-mono whitespace-pre-wrap">
                                    {JSON.stringify(response.data, null, 2)}
                                </pre>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No response yet
                                </div>
                            )}
                        </div>
                    </div >
                </div >
            </div >
        </div >
    );
}
