/**
 * Module: TestOrchestratorRunner (Premium Redesign)
 * Purpose: Main container with premium visual design
 * Why: Complete overhaul from basic UI to modern SaaS-quality interface
 * Performance: Uses custom hooks, memoized components, smooth animations
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { buildFileTree } from '../IDE/types';

// Custom Hooks
import { useTestSelection } from './hooks/useTestSelection';
import { useTestExecution } from './hooks/useTestExecution';

// Premium Components
import { TestTree } from './components/TestTree';
import { CommandCenter } from './components/CommandCenter';
import { ExecutionQueue } from './components/ExecutionQueue';
import { SavedSuites } from './components/SavedSuites';
import { LiveExecution } from './components/LiveExecution';

// Types
import { FileNode, TestSuite } from './types';

/**
 * What: Premium Test Orchestrator with modern design
 * Why: User wants stunning visual design, not basic UI
 * How: Glassmorphism, gradients, animations, rich feedback
 */
export default function TestOrchestratorRunner() {
    const { selectedProject } = useProject();

    // File System State
    const [fileSystem, setFileSystem] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState(false);

    // Suite Management
    const [suites, setSuites] = useState<TestSuite[]>([]);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [suiteName, setSuiteName] = useState('');

    // Custom Hooks (Business Logic)
    const {
        selectedIds,
        toggleSelection,
        loadSuite,
        clearAll,
        getSelectedFileCount,
        getSelectedFiles
    } = useTestSelection();

    const {
        activeRunId,
        currentRunData,
        runConfig,
        setRunConfig,
        startBatchRun,
        isRunning,
        getProgress
    } = useTestExecution(selectedProject?.id);

    const selectedCount = getSelectedFileCount(fileSystem);
    const selectedFilesList = getSelectedFiles(fileSystem);

    /**
     * What: Fetches project files from backend
     */
    const fetchFiles = async () => {
        if (!selectedProject) return;
        setLoading(true);
        try {
            const data = await api.get(`/api/fs?projectId=${selectedProject.id}`);
            const tree = buildFileTree(data as any);
            setFileSystem(tree);
        } catch (error) {
            console.error('Failed to load files:', error);
            toast.error('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    /**
     * What: Fetches saved test suites
     */
    const fetchSuites = async () => {
        if (!selectedProject) return;
        try {
            const data: any = await api.get(`/api/suites?projectId=${selectedProject.id}`);
            setSuites(data);
        } catch (error) {
            console.error('Failed to load suites:', error);
        }
    };

    /**
     * What: Scans disk for new test files
     */
    const handleRescan = async () => {
        if (!selectedProject) return;
        setLoading(true);
        toast.info('Scanning disk for test files...');
        try {
            const res = await api.post('/api/runner/scan', { projectId: selectedProject.id });
            toast.success(`Found ${res.count} files!`);
            fetchFiles();
        } catch (error) {
            console.error('Scan failed:', error);
            toast.error('Scan failed');
        } finally {
            setLoading(false);
        }
    };

    /**
     * What: Saves current selection as a reusable suite
     */
    const handleSaveSuite = async () => {
        if (!suiteName || selectedIds.size === 0) return;
        try {
            await api.post('/api/suites', {
                projectId: selectedProject?.id,
                name: suiteName,
                fileIds: Array.from(selectedIds)
            });
            toast.success('Suite saved! ✨');
            setIsSaveDialogOpen(false);
            setSuiteName('');
            fetchSuites();
        } catch (error) {
            toast.error('Failed to save suite');
        }
    };

    /**
     * What: Deletes a saved suite
     */
    const handleDeleteSuite = async (id: string) => {
        try {
            await api.delete(`/api/suites/${id}?projectId=${selectedProject?.id}`);
            toast.success('Suite deleted');
            fetchSuites();
        } catch (error) {
            toast.error('Failed to delete suite');
        }
    };

    /**
     * What: Loads a suite into the current selection
     */
    const handleLoadSuite = (suite: TestSuite) => {
        loadSuite(suite.fileIds);
        toast.info(`Loaded suite: ${suite.name}`);
    };

    /**
     * What: Starts test execution
     */
    const handleRun = () => {
        startBatchRun(Array.from(selectedIds), selectedCount);
    };

    // Initialize on mount
    useEffect(() => {
        if (selectedProject) {
            fetchFiles();
            fetchSuites();
        }
    }, [selectedProject?.id]);

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
            {/* Premium Header Bar */}
            <div className="border-b bg-card/50 backdrop-blur-xl px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold tracking-tight">Test Runner</h2>
                        <p className="text-xs text-muted-foreground">Configure and execute test suites</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRescan}
                        disabled={loading}
                        className="h-9 border-white/10 hover:border-white/20 hover:bg-white/5"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Rescan Disk
                    </Button>
                    <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={selectedCount === 0}
                                className="h-9 border-white/10 hover:border-white/20 hover:bg-white/5"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save as Suite
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/10">
                            <DialogHeader>
                                <DialogTitle>Save Test Suite</DialogTitle>
                                <DialogDescription>
                                    Save the current selection of {selectedCount} tests as a reusable suite.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <label className="text-sm font-medium mb-2 block">Suite Name</label>
                                <Input
                                    placeholder="e.g. Nightly Regression"
                                    value={suiteName}
                                    onChange={(e) => setSuiteName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveSuite()}
                                    className="bg-slate-800 border-white/10"
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSaveSuite} disabled={!suiteName}>
                                    Save Suite
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Explorer & Suites */}
                <aside className="w-80 border-r bg-card/30 backdrop-blur-sm flex flex-col">
                    <Tabs defaultValue="explorer" className="flex-1 flex flex-col min-h-0">
                        <TabsList className="flex-row justify-start w-full bg-transparent border-b h-12 px-4 gap-6 rounded-none">
                            <TabsTrigger
                                value="explorer"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none shadow-none px-0 text-sm font-semibold"
                            >
                                Explorer
                            </TabsTrigger>
                            <TabsTrigger
                                value="suites"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none shadow-none px-0 text-sm font-semibold"
                            >
                                Saved Suites
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="explorer" className="flex-1 flex flex-col min-h-0 mt-0">
                            <TestTree
                                fileSystem={fileSystem}
                                selectedIds={selectedIds}
                                onToggle={(id, checked) => toggleSelection(id, checked, fileSystem)}
                            />
                        </TabsContent>

                        <TabsContent value="suites" className="flex-1 min-h-0 mt-0">
                            <SavedSuites
                                suites={suites}
                                onLoadSuite={handleLoadSuite}
                                onDeleteSuite={handleDeleteSuite}
                            />
                        </TabsContent>
                    </Tabs>
                </aside>

                {/* Right Panel: Command Center & Queue / Live Execution */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {isRunning && currentRunData ? (
                        /* Live Execution View */
                        <LiveExecution
                            runData={currentRunData}
                            totalTests={selectedCount}
                            progress={getProgress(selectedCount)}
                        />
                    ) : (
                        /* Configuration & Queue View */
                        <ScrollArea className="flex-1">
                            <div className="flex flex-col p-6 gap-6">
                                {/* Command Center */}
                                <CommandCenter
                                    config={runConfig}
                                    onConfigChange={setRunConfig}
                                    onRun={handleRun}
                                    selectedCount={selectedCount}
                                    isRunning={isRunning}
                                />

                                {/* Execution Queue - Make it bigger */}
                                <div className="min-h-[500px]">
                                    <ExecutionQueue
                                        selectedFiles={selectedFilesList}
                                        onRemove={(id) => toggleSelection(id, false, fileSystem)}
                                        onClearAll={clearAll}
                                    />
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </main>
            </div>
        </div>
    );
}
