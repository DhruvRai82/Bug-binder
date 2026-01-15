import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Save, Code, Braces, AlignLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RunnerDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: any;
    projectId?: string;
    onSave?: (req: any) => void;
}

export default function RunnerDrawer({ open, onOpenChange, request, projectId, onSave }: RunnerDrawerProps) {
    // Local State
    const [method, setMethod] = useState("GET");
    const [url, setUrl] = useState("");
    const [headers, setHeaders] = useState("{}");
    const [body, setBody] = useState("");

    // Execution State
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any | null>(null);

    // Sync props to state when opened
    useEffect(() => {
        if (open && request) {
            setMethod(request.method || "GET");
            setUrl(request.url || "");
            setHeaders(JSON.stringify(request.headers || {}, null, 2));
            setBody(request.body || "");
            setResponse(null);
        }
    }, [open, request]);

    const handleSend = async () => {
        if (!url) return toast.error("Enter URL");
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
                statusText: "Error",
                data: e.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRequest = () => {
        if (onSave) {
            onSave({
                ...request,
                method,
                url,
                headers: JSON.parse(headers),
                body
            });
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-[95vh] flex flex-col">
                <DrawerHeader className="border-b pb-2 flex-shrink-0">
                    <DrawerTitle className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                            "font-mono font-bold",
                            method === 'GET' ? 'text-green-600 border-green-200' :
                                method === 'POST' ? 'text-blue-600 border-blue-200' : 'text-orange-600 border-orange-200'
                        )}>{method}</Badge>
                        <span className="truncate text-sm font-normal text-muted-foreground max-w-[200px]">{request?.name || 'New Request'}</span>
                    </DrawerTitle>
                    <DrawerDescription className="hidden">Runner</DrawerDescription>
                </DrawerHeader>

                <div className="flex-1 overflow-hidden flex flex-col bg-muted/5">
                    {/* URL Bar */}
                    <div className="p-4 bg-background border-b space-y-3">
                        <div className="flex gap-2">
                            <Select value={method} onValueChange={setMethod}>
                                <SelectTrigger className="w-[90px] h-10 font-bold text-xs bg-muted/50 border-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="DELETE">DEL</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="https://api..."
                                className="flex-1 font-mono text-xs h-10 bg-muted/50 border-0"
                            />
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-md h-11" onClick={handleSend} disabled={loading}>
                            {loading ? "Sending..." : <><Play className="h-4 w-4 mr-2fill-white" /> Send Request</>}
                        </Button>
                    </div>

                    {/* Editor / Response Tabs */}
                    <Tabs defaultValue={response ? "response" : "body"} className="flex-1 flex flex-col min-h-0">
                        <TabsList className="w-full justify-start rounded-none border-b h-11 bg-muted/20 px-4">
                            {response && <TabsTrigger value="response" className="data-[state=active]:text-green-600">Response</TabsTrigger>}
                            <TabsTrigger value="body">Body</TabsTrigger>
                            <TabsTrigger value="headers">Headers</TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-hidden relative">
                            {/* Body Editor */}
                            <TabsContent value="body" className="absolute inset-0 m-0 p-0">
                                <textarea
                                    className="w-full h-full p-4 font-mono text-xs resize-none focus:outline-none bg-transparent"
                                    placeholder="{ json: body }"
                                    value={body}
                                    onChange={e => setBody(e.target.value)}
                                />
                            </TabsContent>

                            {/* Headers Editor */}
                            <TabsContent value="headers" className="absolute inset-0 m-0 p-0">
                                <textarea
                                    className="w-full h-full p-4 font-mono text-xs resize-none focus:outline-none bg-transparent"
                                    placeholder='{ "Authorization": "..." }'
                                    value={headers}
                                    onChange={e => setHeaders(e.target.value)}
                                />
                            </TabsContent>

                            {/* Response Viewer */}
                            {response && (
                                <TabsContent value="response" className="absolute inset-0 m-0 flex flex-col bg-background animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center justify-between p-2 px-4 border-b bg-muted/10 text-xs text-muted-foreground">
                                        <div className="flex gap-3">
                                            <span className={cn("font-bold", response.status >= 200 && response.status < 300 ? "text-green-600" : "text-red-500")}>
                                                {response.status} {response.statusText}
                                            </span>
                                            <span>{response.duration}ms</span>
                                        </div>
                                        <span>{response.size} B</span>
                                    </div>
                                    <div className="flex-1 overflow-auto p-4">
                                        <pre className="text-[10px] font-mono whitespace-pre-wrap text-foreground">
                                            {JSON.stringify(response.data, null, 2)}
                                        </pre>
                                    </div>
                                </TabsContent>
                            )}
                        </div>
                    </Tabs>
                </div>

                <DrawerFooter className="border-t">
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={handleSaveRequest}>
                            <Save className="h-4 w-4 mr-2" /> Save Changes
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="ghost" className="flex-1">Close</Button>
                        </DrawerClose>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
