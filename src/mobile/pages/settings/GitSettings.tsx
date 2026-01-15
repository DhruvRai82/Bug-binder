
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, GitBranch, GitPullRequest, Activity, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function MobileGitSettings() {
    const [gitStatus, setGitStatus] = useState<string>('UNKNOWN');
    const [isWrapperLoading, setIsWrapperLoading] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    const checkStatus = async () => {
        setIsWrapperLoading(true);
        try {
            const data = await api.get('/api/git/status');
            setGitStatus(data.status);
        } catch (error) {
            setGitStatus('ERROR');
        } finally {
            setIsWrapperLoading(false);
        }
    };

    const handlePull = async () => {
        setIsWrapperLoading(true);
        try {
            const data = await api.post('/api/git/pull', {});
            if (data.success) {
                toast.success('Synced successfully');
                setGitStatus('CLEAN');
                setLastSync(new Date().toLocaleTimeString());
            } else {
                toast.error('Sync failed');
            }
        } catch (error) {
            toast.error('Sync error');
        } finally {
            setIsWrapperLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b sticky top-0 bg-background/95 backdrop-blur z-20">
                <Link to="/settings">
                    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-lg font-semibold">Version Control</h1>
            </div>

            <div className="p-4 space-y-6">

                {/* Status Card */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase ml-1">Repository Status</h3>
                    <Card className="bg-card">
                        <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                            <div className={`p-4 rounded-full ${gitStatus === 'CLEAN' ? 'bg-green-100 text-green-600' :
                                    gitStatus === 'MODIFIED' ? 'bg-orange-100 text-orange-600' :
                                        'bg-muted text-muted-foreground'
                                }`}>
                                <GitBranch className="h-8 w-8" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl font-bold tracking-tight">
                                    {gitStatus === 'CLEAN' ? 'Up to Date' :
                                        gitStatus === 'MODIFIED' ? 'Changes Detected' :
                                            gitStatus}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {gitStatus === 'CLEAN' ? 'Local repo matches origin.' : 'You have uncommitted changes.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full h-12 text-base justify-start px-4"
                        onClick={checkStatus}
                        disabled={isWrapperLoading}
                    >
                        <RefreshCw className={`h-5 w-5 mr-3 ${isWrapperLoading ? 'animate-spin' : ''}`} />
                        Check Status
                    </Button>

                    <Button
                        size="lg"
                        className="w-full h-12 text-base justify-start px-4"
                        onClick={handlePull}
                        disabled={isWrapperLoading}
                    >
                        <GitPullRequest className="h-5 w-5 mr-3" />
                        Pull Latest Changes
                    </Button>
                </div>

                {lastSync && (
                    <p className="text-center text-xs text-muted-foreground">
                        Last synced at {lastSync}
                    </p>
                )}

                <div className="p-4 rounded-lg bg-orange-500/10 text-orange-600 text-xs border border-orange-200">
                    <p className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Committing changes is currently disabled on mobile. Please use the desktop version to push updates.
                    </p>
                </div>

            </div>
        </div>
    );
}
