import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useProject } from '@/context/ProjectContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FileCode, FilePlus, FolderClosed, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface FSNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
}

interface FlowExplorerProps {
    onFileSelect: (file: FSNode) => void;
}

export function FlowExplorer({ onFileSelect }: FlowExplorerProps) {
    const { selectedProject } = useProject();
    const [files, setFiles] = useState<FSNode[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadFiles = async () => {
        if (!selectedProject) {
            console.log("No project selected, skipping loadFiles");
            return;
        }
        setIsLoading(true);
        console.log(`[FlowExplorer] Fetching files for Project: ${selectedProject.id}`);
        try {
            const res = await api.get(`/api/fs?projectId=${selectedProject.id}`);
            console.log("[FlowExplorer] API Response:", res.data);

            // Filter only .flow.json files
            const flowFiles = res.data.filter((f: any) => f.name.endsWith('.flow.json'));
            console.log(`[FlowExplorer] Found ${flowFiles.length} flow files`);
            setFiles(flowFiles);
        } catch (error: any) {
            console.error("[FlowExplorer] Load Failed:", error.response?.data || error.message);
            toast.error("Failed to load files: " + (error.response?.data?.error || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, [selectedProject]);

    const handleCreateNew = async () => {
        if (!selectedProject) {
            toast.error("Please select a project first");
            return;
        }
        const name = `flow-${Date.now()}.flow.json`;
        console.log(`[FlowExplorer] Creating new file: ${name}`);
        try {
            const initialContent = JSON.stringify({ nodes: [], edges: [] });
            const res = await api.post('/api/fs', {
                projectId: selectedProject.id,
                name,
                type: 'file',
                language: 'json',
                content: initialContent
            });
            console.log("[FlowExplorer] Create Success:", res.data);
            toast.success('New Flow Created');
            await loadFiles();
            onFileSelect(res.data);
        } catch (error: any) {
            console.error("[FlowExplorer] Create Failed:", error.response?.data || error.message);
            toast.error('Failed to create file: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="w-64 bg-background border-r flex flex-col h-full bg-slate-50/50">
            <div className="p-4 border-b flex items-center justify-between">
                <span className="font-semibold text-sm">Flow Files</span>
                <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={loadFiles}>
                        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCreateNew}>
                        <FilePlus className="w-3 h-3" />
                    </Button>
                </div>
            </div>
            <ScrollArea className="flex-1 p-2">
                {!selectedProject ? (
                    <div className="text-center py-10 text-muted-foreground text-xs text-red-500">
                        Please select a project<br />in the top dropdown.
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-xs">
                        No flows found.<br />Click + to create one.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {files.map(file => (
                            <div
                                key={file.id}
                                onClick={() => onFileSelect(file)}
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-white hover:shadow-sm cursor-pointer transition-all border border-transparent hover:border-border/50 text-sm group"
                            >
                                <FileCode className="w-4 h-4 text-indigo-500" />
                                <span className="truncate flex-1">{file.name.replace('.flow.json', '')}</span>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
