import { useState, useEffect, Fragment } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { DeleteConfirmationDialog } from '@/features/test-management/DeleteConfirmationDialog';
import { ScriptHistoryPanel } from '@/features/execution/ScriptHistoryPanel';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
    // const navigate = useNavigate();
    const { selectedProject } = useProject();
    const { user } = useAuth();
    const [scripts, setScripts] = useState<RecordedScript[]>([]);
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [viewScript, setViewScript] = useState<RecordedScript | null>(null);
    const [expandedScriptId, setExpandedScriptId] = useState<string | null>(null); // Accordion State
    const [executionModalOpen, setExecutionModalOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
    const [stepStatuses, setStepStatuses] = useState<Record<number, 'pending' | 'running' | 'success' | 'error'>>({});
    const [executionError, setExecutionError] = useState<string | null>(null);

    useEffect(() => {
        if (selectedProject && user) loadScripts();
    }, [selectedProject, user]);

    const loadScripts = async () => {
        try {
            const projectId = selectedProject?.id;
            const uid = user?.uid || '';
            const url = projectId
                ? `/api/recorder/list?projectId=${projectId}&userId=${uid}`
                : `/api/recorder/list?userId=${uid}`;

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
            {/* Premium Header */}
            <div className="flex flex-col space-y-2 mb-2 pt-4">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Script Library
                </h1>
                <p className="text-muted-foreground text-md max-w-2xl">
                    Manage and replay your recorded automation scenarios.
                </p>
            </div>

            {/* Main Content - Floating Glass Card */}
            <Card className="border-0 shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                <CardHeader className="border-b bg-blue-50/50 dark:bg-blue-900/10 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                <LayoutList className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Saved Scripts</CardTitle>
                                <CardDescription>Repository of {selectedProject?.name}</CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                            {scripts.length} Scripts
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="min-h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-blue-100 dark:border-blue-900/30">
                                    <TableHead className="w-[300px] pl-6 h-12 text-xs font-semibold uppercase tracking-wider text-blue-900/60 dark:text-blue-200/60">Name</TableHead>
                                    <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-blue-900/60 dark:text-blue-200/60">Module</TableHead>
                                    <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-blue-900/60 dark:text-blue-200/60">Complexity</TableHead>
                                    <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-blue-900/60 dark:text-blue-200/60">Created</TableHead>
                                    <TableHead className="text-right pr-6 h-12 text-xs font-semibold uppercase tracking-wider text-blue-900/60 dark:text-blue-200/60">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scripts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-96 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground space-y-4">
                                                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center animate-pulse">
                                                    <Terminal className="h-10 w-10 text-blue-300" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-medium text-foreground">Library is Empty</h3>
                                                    <p className="max-w-xs mx-auto">Switch to the "Web Recorder" tab to record your first automation script.</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    scripts.map((script) => (
                                        <Fragment key={script.id}>
                                            <TableRow
                                                className={`group hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all border-b border-gray-100 dark:border-gray-800 ${expandedScriptId === script.id ? 'bg-blue-50/30' : ''}`}
                                            >
                                                <TableCell className="font-medium pl-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 rounded-full hover:bg-black/5"
                                                            onClick={() => setExpandedScriptId(expandedScriptId === script.id ? null : script.id)}
                                                        >
                                                            {expandedScriptId === script.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 opacity-50" />}
                                                        </Button>
                                                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-base text-gray-700 dark:text-gray-200 font-semibold">{script.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs">
                                                        {script.module}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground bg-transparent">
                                                            {script.steps.length} steps
                                                        </Badge>
                                                        {script.steps.length > 20 && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 text-[10px]">Complex</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center text-muted-foreground text-xs font-medium">
                                                        <Calendar className="h-3 w-3 mr-1.5 opacity-70" />
                                                        {new Date(script.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setViewScript(script)}
                                                            title="View Steps"
                                                            className="h-8 w-8 p-0 rounded-full hover:bg-blue-100 hover:text-blue-600"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setExpandedScriptId(expandedScriptId === script.id ? null : script.id)}
                                                            title="Toggle Execution History"
                                                            className={`h-8 w-8 p-0 rounded-full hover:bg-purple-100 hover:text-purple-600 ${expandedScriptId === script.id ? 'bg-purple-100 text-purple-600' : ''}`}
                                                        >
                                                            <Clock className="h-4 w-4" />
                                                        </Button>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-indigo-100 hover:text-indigo-600">
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuLabel>Export Script</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleExport(script.id, 'side')}>
                                                                    <FileJson className="h-4 w-4 mr-2" /> Selenium IDE
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleExport(script.id, 'java')}>
                                                                    <FileText className="h-4 w-4 mr-2" /> Java Selenium
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleExport(script.id, 'python')}>
                                                                    <Code className="h-4 w-4 mr-2" /> Python Selenium
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handlePlay(script)}
                                                            disabled={isPlaying !== null}
                                                            className="h-8 px-3 ml-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all rounded-full"
                                                        >
                                                            {isPlaying === script.id ? (
                                                                <Clock className="h-3 w-3 animate-spin mr-1" />
                                                            ) : (
                                                                <Play className="h-3 w-3 mr-1 fill-white/20" />
                                                            )}
                                                            Run
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 ml-1 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => setScriptToDelete(script.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {expandedScriptId === script.id && (
                                                <TableRow className="bg-gray-50/50 dark:bg-slate-900/30 hover:bg-gray-50/50">
                                                    <TableCell colSpan={5} className="p-0 border-b border-gray-100 dark:border-gray-800 shadow-inner">
                                                        <ScriptHistoryPanel
                                                            scriptId={script.id}
                                                            projectId={selectedProject?.id || ''}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Fragment>
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
                <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl ring-1 ring-black/5">
                    <DialogHeader className="p-6 border-b border-gray-100 dark:border-white/10 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${executionModalOpen ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'} shadow-sm`}>
                                    {executionModalOpen ? <Play className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                                </div>
                                <div>
                                    <DialogTitle className="flex items-center gap-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                                        {executionModalOpen ? 'Live Execution Monitor' : 'Script Details'}
                                        {executionModalOpen && (
                                            <Badge variant="outline" className="animate-pulse bg-green-50 text-green-700 border-green-200">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2" />
                                                Running
                                            </Badge>
                                        )}
                                    </DialogTitle>
                                    <DialogDescription asChild>
                                        <div className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                                            <span className="font-semibold text-foreground">{viewScript?.name}</span>
                                            <span>•</span>
                                            <Badge variant="secondary" className="text-[10px] h-5">{viewScript?.steps.length} steps</Badge>
                                            <span>•</span>
                                            <span className="font-mono text-xs opacity-70">ID: {viewScript?.id.slice(0, 8)}</span>
                                        </div>
                                    </DialogDescription>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-slate-950 p-0">
                        <Table>
                            <TableHeader className="bg-gray-50/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                                <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-white/5">
                                    <TableHead className="w-16 pl-6 py-4 font-bold text-xs uppercase text-muted-foreground tracking-wider">#</TableHead>
                                    <TableHead className="py-4 font-bold text-xs uppercase text-muted-foreground tracking-wider">Command</TableHead>
                                    <TableHead className="py-4 font-bold text-xs uppercase text-muted-foreground tracking-wider">Target</TableHead>
                                    <TableHead className="py-4 font-bold text-xs uppercase text-muted-foreground tracking-wider">Value</TableHead>
                                    {executionModalOpen && <TableHead className="w-32 text-right pr-6 py-4 font-bold text-xs uppercase text-muted-foreground tracking-wider">Status</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {viewScript?.steps.map((step, index) => {
                                    const isCurrent = executionModalOpen && currentStepIndex === index;
                                    const status = executionModalOpen ? stepStatuses[index] : null;

                                    return (
                                        <TableRow
                                            key={index}
                                            className={`
                                                border-b border-gray-50 dark:border-white/5 bg-white dark:bg-slate-950
                                                ${isCurrent ? 'bg-blue-50/80 dark:bg-blue-900/20 shadow-inner' : 'hover:bg-gray-50/50 dark:hover:bg-white/5'}
                                                transition-colors duration-200
                                            `}
                                        >
                                            <TableCell className={`pl-6 font-mono text-xs font-medium ${isCurrent ? 'text-blue-600' : 'text-muted-foreground'}`}>
                                                {String(index + 1).padStart(2, '0')}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <Badge
                                                    variant="outline"
                                                    className={`
                                                        font-mono text-[10px] uppercase tracking-wider border-0
                                                        ${(step.action || step.command) === 'click' || (step.action || step.command) === 'CLICK' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                                                            (step.action || step.command) === 'type' || (step.action || step.command) === 'TYPE' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                                                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}
                                                    `}
                                                >
                                                    {step.action || step.command}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[250px]">
                                                <div className="flex items-center gap-1">
                                                    {(step.selector || step.target) && (
                                                        <code className="text-[11px] bg-muted/40 px-1.5 py-0.5 rounded text-muted-foreground truncate block font-normal border border-transparent hover:border-border transition-colors cursor-help max-w-[200px]" title={step.selector || step.target}>
                                                            {step.selector || step.target}
                                                        </code>
                                                    )}
                                                    {step.url && (
                                                        <code className="text-[11px] bg-purple-50 dark:bg-purple-900/20 px-1.5 py-0.5 rounded text-purple-700 dark:text-purple-300 truncate block font-normal border border-purple-100 dark:border-purple-800 max-w-[200px]" title={step.url}>
                                                            {step.url}
                                                        </code>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[150px]">
                                                {step.value ? (
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-700 truncate block">
                                                        {step.value}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs opacity-30 select-none">—</span>
                                                )}
                                            </TableCell>
                                            {executionModalOpen && (
                                                <TableCell className="text-right pr-6">
                                                    {status === 'running' && (
                                                        <div className="flex items-center justify-end gap-2 text-blue-600 font-medium text-xs animate-pulse">
                                                            Running... <Clock className="h-3.5 w-3.5 animate-spin" />
                                                        </div>
                                                    )}
                                                    {status === 'success' && (
                                                        <div className="flex items-center justify-end gap-2 text-green-600 font-medium text-xs">
                                                            Passed <CheckCircle2 className="h-3.5 w-3.5" />
                                                        </div>
                                                    )}
                                                    {status === 'error' && (
                                                        <div className="flex items-center justify-end gap-2 text-red-600 font-medium text-xs">
                                                            Failed <XCircle className="h-3.5 w-3.5" />
                                                        </div>
                                                    )}
                                                    {!status && <span className="text-muted-foreground text-xs opacity-30">Pending</span>}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="p-4 border-t bg-gray-50/50 dark:bg-white/5 flex justify-end">
                        <Button variant="outline" onClick={() => { setViewScript(null); setExecutionModalOpen(false); }}>
                            Close
                        </Button>
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
