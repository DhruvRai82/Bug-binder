import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Play, Save, Lock, Unlock, Terminal, Code } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FileNode } from '@/pages/IDE/types';

interface ScriptDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: FileNode | null;
}

export default function ScriptDrawer({ open, onOpenChange, file }: ScriptDrawerProps) {
    const [content, setContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState("code"); // code | console

    // Sync content when file opens
    useEffect(() => {
        if (open && file) {
            loadFileContent();
            setLogs(['Ready...']);
            setIsEditing(false);
            setActiveTab("code");
        }
    }, [open, file]);

    const loadFileContent = async () => {
        if (!file) return;
        try {
            // Check if file object already has content, else fetch
            // Ideally always fetch fresh
            const data = await api.get(`/api/fs/${file.id}`);
            setContent(data.content || "");
        } catch {
            toast.error("Failed to load file");
        }
    };

    const handleSave = async () => {
        if (!file) return;
        try {
            await api.put(`/api/fs/${file.id}/content`, { content });
            toast.success("Saved");
            setIsEditing(false);
        } catch { toast.error("Save Failed"); }
    };

    const handleRun = async () => {
        if (!file) return;
        setIsRunning(true);
        setLogs(['> Preparing execution...', `> Running ${file.name}...`]);
        setActiveTab("console");

        let language = '';
        const name = file.name.toLowerCase();
        if (name.endsWith('.java')) language = 'java';
        else if (name.endsWith('.py')) language = 'python';
        else if (name.endsWith('.js')) language = 'javascript';
        else if (name.endsWith('.ts') || name.endsWith('.tsx')) language = 'typescript';

        if (!language) {
            setLogs(prev => [...prev, '> Error: Unknown language.']);
            setIsRunning(false);
            return;
        }

        try {
            // Save before run if edited
            if (isEditing) {
                await api.put(`/api/fs/${file.id}/content`, { content });
            }

            const response = await api.post('/api/runner/execute-raw', {
                content, // Sending current content state
                language
            });

            const execLogs = response.logs || [];
            if (execLogs.length === 0) {
                setLogs(prev => [...prev, '> (No output)']);
            } else {
                setLogs(prev => [...prev, ...execLogs]);
            }
            setLogs(prev => [...prev, `> Process exited with code ${response.exitCode}`]);
        } catch (error: any) {
            setLogs(prev => [...prev, `> API Error: ${error.message || 'Unknown error'}`]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-[95vh] flex flex-col">
                <DrawerHeader className="border-b pb-2 flex-shrink-0">
                    <DrawerTitle className="flex items-center gap-2">
                        <FileCodeIcon filename={file?.name} />
                        <span className="truncate text-sm font-normal text-muted-foreground max-w-[200px]">{file?.name}</span>
                    </DrawerTitle>
                    <DrawerDescription className="hidden">Script Runner</DrawerDescription>
                </DrawerHeader>

                <div className="flex-1 overflow-hidden flex flex-col bg-muted/5">
                    {/* Controls */}
                    <div className="p-2 border-b bg-background flex items-center justify-between">
                        <div className="flex gap-1">
                            {isEditing ? (
                                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setIsEditing(false)}>
                                    <Unlock className="h-3 w-3 mr-1 text-orange-500" /> Editing
                                </Button>
                            ) : (
                                <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground" onClick={() => setIsEditing(true)}>
                                    <Lock className="h-3 w-3 mr-1" /> Read Only
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {isEditing && (
                                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleSave}>
                                    <Save className="h-3 w-3 mr-1" /> Save
                                </Button>
                            )}
                            <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700" onClick={handleRun} disabled={isRunning}>
                                {isRunning ? "Running..." : <><Play className="h-3 w-3 mr-1" /> Run</>}
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                        <TabsList className="w-full justify-start rounded-none border-b h-10 bg-muted/20 px-4">
                            <TabsTrigger value="code" className="text-xs data-[state=active]:bg-background">
                                <Code className="h-3 w-3 mr-2" /> Code
                            </TabsTrigger>
                            <TabsTrigger value="console" className="text-xs data-[state=active]:bg-background">
                                <Terminal className="h-3 w-3 mr-2" /> Console
                                {logs.length > 1 && <Badge variant="secondary" className="ml-2 h-4 px-1 text-[9px]">{logs.length}</Badge>}
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-hidden relative">
                            {/* Code Editor */}
                            <TabsContent value="code" className="absolute inset-0 m-0 p-0">
                                <textarea
                                    className={cn(
                                        "w-full h-full p-4 font-mono text-[11px] resize-none focus:outline-none bg-background leading-relaxed",
                                        !isEditing && "text-muted-foreground bg-muted/5"
                                    )}
                                    readOnly={!isEditing}
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    spellCheck={false}
                                />
                            </TabsContent>

                            {/* Console */}
                            <TabsContent value="console" className="absolute inset-0 m-0 p-0 bg-[#1e1e1e] text-white">
                                <div className="h-full overflow-auto p-4 font-mono text-[10px]">
                                    {logs.map((log, i) => (
                                        <div key={i} className="whitespace-pre-wrap mb-1 opacity-90">{log}</div>
                                    ))}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                <DrawerFooter className="border-t pt-2 pb-6">
                    <DrawerClose asChild>
                        <Button variant="outline" className="w-full">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

function FileCodeIcon({ filename }: { filename?: string }) {
    if (!filename) return <Code className="h-4 w-4" />;
    const ext = filename.split('.').pop()?.toLowerCase();

    // Simple color coding
    if (ext === 'ts' || ext === 'tsx') return <Badge variant="outline" className="text-[9px] px-1 border-blue-200 text-blue-600">TS</Badge>;
    if (ext === 'js' || ext === 'jsx') return <Badge variant="outline" className="text-[9px] px-1 border-yellow-200 text-yellow-600">JS</Badge>;
    if (ext === 'py') return <Badge variant="outline" className="text-[9px] px-1 border-blue-200 text-blue-500">PY</Badge>;
    if (ext === 'java') return <Badge variant="outline" className="text-[9px] px-1 border-red-200 text-red-600">JV</Badge>;

    return <Code className="h-4 w-4 text-muted-foreground" />;
}
