import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GitBranch, GitPullRequest, Upload, AlertCircle, CheckCircle2, Clock, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function GitSettings() {
    // Git State
    const [gitStatus, setGitStatus] = useState<string>('UNKNOWN');
    const [gitMessage, setGitMessage] = useState<string>('Checking status...');
    const [gitDetails, setGitDetails] = useState<string>('');
    const [commitMessage, setCommitMessage] = useState<string>('');
    const [gitLogs, setGitLogs] = useState<Array<{ time: string; message: string; type: 'success' | 'error' | 'info' }>>([]);
    const [isGitLoading, setIsGitLoading] = useState(false);
    const [canCommit, setCanCommit] = useState(false);

    const addGitLog = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setGitLogs(prev => [...prev, { time: timestamp, message, type }]);
    }, []);

    const checkGitStatus = useCallback(async () => {
        try {
            const data = await api.get('/api/git/status');

            setGitStatus(data.status);
            setGitMessage(data.message);
            setGitDetails(data.details || '');

            setCanCommit(data.status === 'MODIFIED');

            addGitLog(`Status: ${data.message}`, 'info');
        } catch (error) {
            console.error('Error checking Git status:', error);
            setGitStatus('ERROR');
            setGitMessage('Failed to check Git status');
            addGitLog('Failed to check Git status', 'error');
        }
    }, [addGitLog]);

    useEffect(() => {
        checkGitStatus();
    }, [checkGitStatus]);

    const handlePullSync = async () => {
        setIsGitLoading(true);
        addGitLog('Starting pull from remote...', 'info');

        try {
            const data = await api.post('/api/git/pull', {});

            if (data.success) {
                addGitLog(data.message, 'success');
                toast.success(data.message);
                await checkGitStatus();
            } else {
                addGitLog(data.message || 'Pull failed', 'error');
                toast.error(data.message || 'Pull failed');
            }
        } catch (error) {
            console.error('Error pulling changes:', error);
            addGitLog('Failed to pull changes', 'error');
            toast.error('Failed to pull changes');
        } finally {
            setIsGitLoading(false);
        }
    };

    const handleCommitPush = async () => {
        if (!commitMessage.trim()) {
            toast.error('Commit message is required');
            return;
        }

        setIsGitLoading(true);
        addGitLog(`Committing: "${commitMessage.trim()}"`, 'info');

        try {
            const data = await api.post('/api/git/commit_push', { commitMessage: commitMessage.trim() });

            if (data.success) {
                addGitLog(data.message, 'success');
                toast.success(data.message);
                setCommitMessage('');
                await checkGitStatus();
            } else {
                addGitLog(data.message || 'Commit/Push failed', 'error');
                if (data.details) {
                    addGitLog(data.details, 'error');
                }
                toast.error(data.message || 'Commit/Push failed');
            }
        } catch (error) {
            console.error('Error committing/pushing:', error);
            addGitLog('Failed to commit and push', 'error');
            toast.error('Failed to commit and push');
        } finally {
            setIsGitLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
            <div>
                <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Version Control
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                    Synchronize your test data and scripts with your remote Git repository to ensure version history and collaboration.
                </p>
            </div>

            <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-md overflow-hidden ring-1 ring-white/10 dark:ring-white/5 relative">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-70" />

                <CardHeader className="bg-background/20 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <GitBranch className="h-5 w-5" />
                        Repository Status
                    </CardTitle>
                    <CardDescription>
                        Check local changes and push updates to your upstream origin.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-8">
                    {/* Status Display */}
                    <div className="relative group">
                        <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${gitStatus === 'CLEAN' ? 'border-green-500/20 bg-green-500/5' :
                                gitStatus === 'MODIFIED' ? 'border-yellow-500/20 bg-yellow-500/5' :
                                    gitStatus === 'ERROR' ? 'border-destructive/20 bg-destructive/5' :
                                        'border-border bg-background/50'
                            }`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full shadow-sm ${gitStatus === 'CLEAN' ? 'bg-green-100 text-green-600' :
                                            gitStatus === 'MODIFIED' ? 'bg-yellow-100 text-yellow-600' :
                                                gitStatus === 'ERROR' ? 'bg-red-100 text-red-600' :
                                                    'bg-muted text-muted-foreground'
                                        }`}>
                                        {gitStatus === 'CLEAN' && <CheckCircle2 className="h-6 w-6" />}
                                        {gitStatus === 'MODIFIED' && <AlertCircle className="h-6 w-6" />}
                                        {gitStatus === 'BEHIND' && <Clock className="h-6 w-6" />}
                                        {gitStatus === 'ERROR' && <AlertCircle className="h-6 w-6" />}
                                        {gitStatus === 'UNKNOWN' && <Activity className="h-6 w-6 animate-pulse" />}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold tracking-tight">{gitMessage}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {gitDetails || "No additional status details available."}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={checkGitStatus}
                                    disabled={isGitLoading}
                                    className="hover:border-blue-500 hover:text-blue-600 transition-colors"
                                >
                                    <Activity className={`h-3.5 w-3.5 mr-2 ${isGitLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Action Zone */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Commit Section */}
                        <div className="space-y-4 group/commit">
                            <div className="space-y-2">
                                <Label htmlFor="commit-message" className="text-xs font-semibold uppercase text-muted-foreground group-focus-within/commit:text-blue-500 transition-colors">
                                    Commit Changes
                                </Label>
                                <Textarea
                                    id="commit-message"
                                    value={commitMessage}
                                    onChange={(e) => setCommitMessage(e.target.value)}
                                    placeholder="Describe your changes (e.g., 'Updated login test scenario')"
                                    disabled={isGitLoading}
                                    className="resize-none bg-background/50 border-muted-foreground/20 focus:border-blue-500 transition-all min-h-[120px] shadow-inner"
                                />
                            </div>
                            <Button
                                onClick={handleCommitPush}
                                disabled={!canCommit || !commitMessage.trim() || isGitLoading}
                                className={`w-full h-11 text-base shadow-md transition-all duration-300 ${canCommit
                                        ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25 hover:-translate-y-0.5'
                                        : 'opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {isGitLoading ? 'Syncing...' : 'Commit & Push'}
                            </Button>
                        </div>

                        {/* Pull Section */}
                        <div className="flex flex-col space-y-4">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">
                                Remote Synchronization
                            </Label>
                            <div className="flex-1 rounded-xl bg-muted/20 border border-dashed flex flex-col items-center justify-center p-6 text-center space-y-3 hover:bg-muted/30 transition-colors">
                                <div className="bg-background p-3 rounded-full shadow-sm">
                                    <GitPullRequest className="h-6 w-6 text-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <h5 className="font-medium text-foreground">Pull Latest Changes</h5>
                                    <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                                        Fetch and merge updates from the remote repository to keep your list compliant.
                                    </p>
                                </div>
                                <Button
                                    onClick={handlePullSync}
                                    disabled={isGitLoading}
                                    variant="outline"
                                    className="w-full mt-2 border-blue-200 hover:border-blue-400 hover:text-blue-600 dark:border-blue-900 dark:hover:border-blue-700"
                                >
                                    <Clock className="h-4 w-4 mr-2" />
                                    {isGitLoading ? 'Processing...' : 'Pull from Origin'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Run Status Log */}
                    <div className="space-y-3 pt-4 border-t">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground">Operation Log</Label>
                        <ScrollArea className="h-48 w-full border rounded-xl bg-black/5 dark:bg-black/40 shadow-inner p-4 font-mono text-sm settings-log-area">
                            {gitLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-40">
                                    <Activity className="h-8 w-8 mb-2" />
                                    <p className="text-xs">No Git operations recorded in this session.</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {gitLogs.map((log, index) => (
                                        <div key={index} className="flex gap-3 items-start animate-in slide-in-from-left-2 fade-in duration-300">
                                            <span className="text-muted-foreground/60 text-[10px] mt-0.5 w-14 shrink-0">{log.time}</span>
                                            <span className={`flex-1 break-all ${log.type === 'success' ? 'text-green-600 dark:text-green-400' :
                                                    log.type === 'error' ? 'text-red-500 dark:text-red-400' :
                                                        'text-foreground'
                                                }`}>
                                                <span className="mr-2 opacity-50 select-none">
                                                    {log.type === 'success' ? '✓' : log.type === 'error' ? '✗' : 'ℹ'}
                                                </span>
                                                {log.message}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
