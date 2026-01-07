import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Play, Trash2, Eye, Download, FileJson, FileText, Code, Clock, CheckCircle2, XCircle, LayoutList, MoreHorizontal, Calendar, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProject } from '@/context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
// import { supabase } from '@/integrations/supabase/client';

interface RecordedScript {
    id: string;
    projectId: string;
    name: string;
    module: string;
    steps: any[];
    createdAt: string;
}

export default function RecordedScriptsLibrary() {
    const navigate = useNavigate();
    const { selectedProject } = useProject();
    const [scripts, setScripts] = useState<RecordedScript[]>([]);
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [viewScript, setViewScript] = useState<RecordedScript | null>(null);
    const [executionModalOpen, setExecutionModalOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
    const [stepStatuses, setStepStatuses] = useState<Record<number, 'pending' | 'running' | 'success' | 'error'>>({});
    const [executionError, setExecutionError] = useState<string | null>(null);

    useEffect(() => {
        loadScripts();
    }, [selectedProject]);

    const loadScripts = async () => {
        try {
            const projectId = selectedProject?.id;
            const url = projectId
                ? `/api/recorder/list?projectId=${projectId}`
                : '/api/recorder/list';

            const data = await api.get(url);
            setScripts(data);
        } catch (error) {
            console.error('Error loading scripts:', error);
        }
    };

    const handlePlay = async (script: RecordedScript) => {
        if (!confirm(`Run "${script.name}" on the backend runner?`)) return;

        try {
            toast.info('Starting execution...');
            // Trigger backend run
            const result = await api.post('/api/runner/execute', {
                scriptId: script.id,
                projectId: selectedProject?.id,
                source: 'manual'
            });

            if (result.runId) {
                toast.success('Execution started!');
            } else {
                toast.error('Failed to trigger execution');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Error playing script');
        }
    };

    const [scriptToDelete, setScriptToDelete] = useState<string | null>(null);

    const confirmDelete = async () => {
        if (!scriptToDelete) return;
        try {
            await api.delete(`/api/recorder/${scriptToDelete}?projectId=${selectedProject?.id}`);
            toast.success('Script deleted');
            loadScripts();
            setScriptToDelete(null);
        } catch (error) {
            toast.error('Error deleting script');
        }
    };

    const handleExport = async (id: string, format: 'side' | 'java' | 'python') => {
        try {
            // Local Export: Directly use window.open or fetch from backend API
            // The backend endpoint should handle streaming the file download
            // Authentication is mock-local, so standard headers work

            const response = await api.download(`/api/recorder/export/${id}/${format}`);

            // Create Blob download
            const url = window.URL.createObjectURL(response);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${id}.${format === 'side' ? 'side' : format === 'java' ? 'java' : 'py'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Export Error:', error);
            toast.error('Error exporting script');
        }
    };

    return (
        <div className="p-4 w-full space-y-6">
            <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Recorded Scripts
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Manage, replay, and export your automated test scenarios.
                </p>
            </div>

            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Library</CardTitle>
                    <CardDescription>All recorded scripts for {selectedProject?.name}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-background">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead className="w-[300px]">Name</TableHead>
                                    <TableHead>Module</TableHead>
                                    <TableHead>Steps</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scripts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Terminal className="h-8 w-8 mb-2 opacity-50" />
                                                <p>No scripts found. Start recording to build your library.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    scripts.map((script) => (
                                        <TableRow key={script.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    {script.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal">
                                                    {script.module}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                                    {script.steps.length} steps
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-muted-foreground text-sm">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {new Date(script.createdAt).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setViewScript(script)}
                                                        title="View Steps"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Export As</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleExport(script.id, 'side')}>
                                                                <FileJson className="h-4 w-4 mr-2" /> Selenium IDE (.side)
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleExport(script.id, 'java')}>
                                                                <FileText className="h-4 w-4 mr-2" /> Java (WebDriver)
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleExport(script.id, 'python')}>
                                                                <Code className="h-4 w-4 mr-2" /> Python (WebDriver)
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handlePlay(script)}
                                                        disabled={isPlaying !== null}
                                                        className="h-8 px-3 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                                                    >
                                                        {isPlaying === script.id ? (
                                                            <Clock className="h-3 w-3 animate-spin mr-1" />
                                                        ) : (
                                                            <Play className="h-3 w-3 mr-1" />
                                                        )}
                                                        Play
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => setScriptToDelete(script.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* View Steps / Live Execution Dialog */}
            <Dialog open={!!viewScript || executionModalOpen} onOpenChange={(open) => {
                if (!open) {
                    setViewScript(null);
                    if (!isPlaying) setExecutionModalOpen(false);
                }
            }}>
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-6 border-b bg-muted/30">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            {executionModalOpen ? (
                                <>
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    Live Execution
                                </>
                            ) : (
                                <><FileText className="h-5 w-5 text-muted-foreground" /> Script Details</>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-1">
                            {viewScript?.name} • {viewScript?.steps.length} steps
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto bg-background">
                        {executionError && (
                            <div className="m-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200 flex items-center gap-2">
                                <XCircle className="h-4 w-4" />
                                <strong>Error:</strong> {executionError}
                            </div>
                        )}

                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                <TableRow>
                                    <TableHead className="w-12 pl-6">#</TableHead>
                                    <TableHead>Command</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Value</TableHead>
                                    {executionModalOpen && <TableHead className="w-24 text-right pr-6">Status</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {viewScript?.steps.map((step, index) => (
                                    <TableRow key={index} className={
                                        executionModalOpen && currentStepIndex === index ? 'bg-blue-50/50' : ''
                                    }>
                                        <TableCell className="font-mono text-xs text-muted-foreground pl-6">{index + 1}</TableCell>
                                        <TableCell className="font-medium">
                                            <Badge variant="outline" className="font-mono text-xs uppercase">
                                                {step.command}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate" title={step.target}>
                                            {step.target}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground max-w-[100px] truncate" title={step.value}>
                                            {step.value || '-'}
                                        </TableCell>
                                        {executionModalOpen && (
                                            <TableCell className="text-right pr-6">
                                                {stepStatuses[index] === 'running' && <Clock className="h-4 w-4 animate-spin text-blue-500 ml-auto" />}
                                                {stepStatuses[index] === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />}
                                                {stepStatuses[index] === 'error' && <XCircle className="h-4 w-4 text-red-500 ml-auto" />}
                                                {!stepStatuses[index] && <span className="text-muted-foreground text-xs">-</span>}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            <DeleteConfirmationDialog
                open={!!scriptToDelete}
                onOpenChange={(open) => !open && setScriptToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Script?"
                description="This will permanently delete this recorded script and its history."
            />
        </div >
    );
}
