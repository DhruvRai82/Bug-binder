import { useState, useCallback } from 'react';
import { FlowManager } from './FlowManager';
import { Button } from '@/components/ui/button';
import { FlowCanvas } from './FlowCanvas';
import { api, API_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';
import { FileNode } from '@/pages/IDE/types';

export function FlowBuilder() {
    const [activeFile, setActiveFile] = useState<FileNode | null>(null);
    const [initialData, setInitialData] = useState<{ nodes: any[], edges: any[] }>({ nodes: [], edges: [] });

    // Live State for Saving
    const [liveNodes, setLiveNodes] = useState<any[]>([]);
    const [liveEdges, setLiveEdges] = useState<any[]>([]);

    // Output Viewer State
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerSrc, setViewerSrc] = useState('');
    const [viewerTitle, setViewerTitle] = useState('');

    // Handle opening a file (Editor or Output)
    const handleFileSelect = async (file: FileNode, isOutput = false) => {
        if (isOutput) {
            // Handle Output Files (e.g. Screenshots, JSON logs)
            if (file.name.endsWith('.png') || file.name.endsWith('.jpg')) {
                try {
                    const blob = await api.download(`/api/runs/file?path=${encodeURIComponent(file.id)}`);
                    const objectUrl = URL.createObjectURL(blob);

                    setViewerSrc(objectUrl);
                    setViewerTitle(file.name);
                    setViewerOpen(true);
                } catch (e) {
                    console.error("Failed to load image", e);
                    toast.error("Failed to load image");
                }
            } else {
                toast.info(`Opening ${file.name} is not supported yet.`);
            }
            return;
        }

        // --- Normal Editor File Loading ---
        try {
            // In case file object is stale/lightweight, fetch content fresh if needed
            const res = await api.get(`/api/fs/${file.id}`);
            const fetchedData = res.data || res;
            const content = fetchedData.content;
            const fullFile = { ...file, ...fetchedData };

            // Parse Content
            try {
                const parsed = JSON.parse(content || '{"nodes":[], "edges":[]}');
                setInitialData(parsed);
                // Initialize live state
                setLiveNodes(parsed.nodes || []);
                setLiveEdges(parsed.edges || []);
            } catch (e) {
                console.error("Invalid JSON", e);
                setInitialData({ nodes: [], edges: [] });
            }

            setActiveFile(fullFile);

        } catch (error) {
            console.error(error);
            toast.error("Failed to load file content");
        }
    };

    // Callback from Canvas when things change
    const onCanvasChange = useCallback((nodes: any[], edges: any[]) => {
        setLiveNodes(nodes);
        setLiveEdges(edges);
    }, []);

    const handleSave = async () => {
        if (!activeFile) return;
        const toastId = toast.loading("Saving...");

        const newContent = JSON.stringify({ nodes: liveNodes, edges: liveEdges }, null, 2);

        try {
            await api.put(`/api/fs/${activeFile.id}/content`, { content: newContent });
            toast.dismiss(toastId);
            toast.success("Flow Saved");
        } catch (error) {
            toast.dismiss(toastId);
            console.error("Save failed", error);
            toast.error("Save Failed");
        }
    };

    return (
        <div className="h-full w-full bg-background relative overflow-hidden">
            {/* 1. FILE MANAGER - Always Rendered, Hidden when activeFile exists */}
            <div className={`h-full w-full ${activeFile ? 'hidden' : 'block'}`}>
                <FlowManager onFileSelect={handleFileSelect} />
            </div>

            {/* 2. EDITOR (CANVAS) - Rendered only when activeFile exists */}
            {activeFile && (
                <div className="absolute inset-0 z-10 bg-background flex flex-col h-full w-full animate-in fade-in duration-200">
                    {/* Header / Back Button */}
                    <div className="h-14 border-b bg-background px-4 flex items-center justify-between shrink-0 shadow-sm z-20">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setActiveFile(null)}>
                                ← Back to Files
                            </Button>
                            <div className="h-4 w-px bg-border mx-2" />
                            <span className="font-semibold text-sm">{activeFile.name}</span>
                        </div>
                        <Button size="sm" onClick={handleSave} className="bg-primary hover:bg-primary/90">
                            Save Flow
                        </Button>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 relative">
                        <FlowCanvas
                            key={activeFile.id}
                            initialNodes={initialData.nodes}
                            initialEdges={initialData.edges}
                            onSave={onCanvasChange} // Report changes up
                            sourcePath={activeFile.path}
                        />
                    </div>
                </div>
            )}

            {/* 3. Output Viewer Dialog (Floating Image) */}
            {viewerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200" onClick={() => setViewerOpen(false)}>
                    <div className="bg-background rounded-lg overflow-hidden max-w-4xl max-h-[90vh] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-3 border-b flex items-center justify-between">
                            <span className="font-semibold">{viewerTitle}</span>
                            <Button variant="ghost" size="sm" onClick={() => setViewerOpen(false)}>Close</Button>
                        </div>
                        <div className="p-4 bg-muted/20 flex items-center justify-center overflow-auto">
                            <img src={viewerSrc} alt={viewerTitle} className="max-w-full max-h-[80vh] object-contain rounded border shadow-sm" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
