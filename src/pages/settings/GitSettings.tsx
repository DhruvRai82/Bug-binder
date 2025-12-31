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
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Version Control (Git)</h3>
                <p className="text-sm text-muted-foreground">
                    Manage data synchronization with your remote repository.
                </p>
            </div>
            <div className="border-t pt-6" />

            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent border-b">
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                        <GitBranch className="h-5 w-5" />
                        Git Status
                    </CardTitle>
                    <CardDescription>
                        Check local changes and sync with remote.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Status Display */}
                    <div className="p-6 bg-background border rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            {gitStatus === 'CLEAN' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                            {gitStatus === 'MODIFIED' && <AlertCircle className="h-6 w-6 text-yellow-500" />}
                            {gitStatus === 'BEHIND' && <Clock className="h-6 w-6 text-blue-500" />}
                            {gitStatus === 'ERROR' && <AlertCircle className="h-6 w-6 text-destructive" />}
                            {gitStatus === 'UNKNOWN' && <Clock className="h-6 w-6 text-muted-foreground" />}
                            <span className="text-lg font-semibold">Status: {gitMessage}</span>
                        </div>
                        {gitDetails && (
                            <p className="text-sm text-muted-foreground ml-9 mb-4">{gitDetails}</p>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={checkGitStatus}
                            disabled={isGitLoading}
                            className="ml-9 text-primary hover:text-primary/80 hover:bg-primary/10"
                        >
                            Refresh Status
                        </Button>
                    </div>

                    {/* Commit Message Input */}
                    <div className="space-y-3">
                        <Label htmlFor="commit-message" className="text-base font-medium">Commit Message</Label>
                        <Textarea
                            id="commit-message"
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            placeholder="Enter commit message (e.g., 'Updated test data')"
                            disabled={isGitLoading}
                            rows={2}
                            className="resize-none bg-background"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            onClick={handleCommitPush}
                            disabled={!canCommit || !commitMessage.trim() || isGitLoading}
                            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {isGitLoading ? 'Processing...' : 'Commit & Push'}
                        </Button>
                        <Button
                            onClick={handlePullSync}
                            disabled={isGitLoading}
                            variant="outline"
                            className="flex-1 h-11 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 shadow-sm hover:shadow-md transition-all"
                        >
                            <GitPullRequest className="h-4 w-4 mr-2" />
                            {isGitLoading ? 'Processing...' : 'Pull & Sync'}
                        </Button>
                    </div>

                    {/* Run Status Log */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Activity Log</Label>
                        <ScrollArea className="h-40 w-full border rounded-xl p-4 bg-muted/30 shadow-inner">
                            {gitLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                                    <Activity className="h-8 w-8 mb-2" />
                                    <p className="text-sm">No activity yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {gitLogs.map((log, index) => (
                                        <div key={index} className="text-sm flex gap-3 items-start">
                                            <span className="text-muted-foreground font-mono text-xs mt-0.5 shrink-0">{log.time}</span>
                                            <span className={`flex-1 break-words ${log.type === 'success' ? 'text-green-600 font-medium' :
                                                log.type === 'error' ? 'text-destructive font-medium' :
                                                    'text-foreground'
                                                }`}>
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
