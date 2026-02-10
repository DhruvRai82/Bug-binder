/**
 * Module: useTestExecution
 * Purpose: Manages test execution state, polling, and run configuration
 * Why: Separates execution logic from UI for cleaner architecture
 * Performance: Auto-cleanup of polling intervals, prevents memory leaks
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface RunConfig {
    environment: 'local' | 'staging' | 'prod';
    browser: 'chrome' | 'firefox' | 'edge';
    headless: boolean;
    parallel: number;
}

export interface RunData {
    id: string;
    logs: string[];
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    results?: any[];
    ai_analysis?: any; // Changed from string to any to match ExecutionConsole
    duration?: number;
}

export function useTestExecution(projectId?: string) {
    const [activeRunId, setActiveRunId] = useState<string | null>(null);
    const [currentRunData, setCurrentRunData] = useState<RunData | null>(null);
    const [runConfig, setRunConfig] = useState<RunConfig>({
        environment: 'local',
        browser: 'chrome',
        headless: false,
        parallel: 1
    });

    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * What: Starts a batch test execution
     * Why: Users trigger test runs from the UI
     * How: POSTs to backend with file IDs and config, starts polling
     */
    const startBatchRun = useCallback(async (fileIds: string[], selectedCount: number) => {
        if (!projectId || fileIds.length === 0) return;

        try {
            toast.info(`Starting batch run with ${selectedCount} tests...`);

            const response: any = await api.post('/api/runner/batch-execute', {
                projectId,
                fileIds,
                config: runConfig
            });

            toast.success(`Run started!`);
            setActiveRunId(response.runId);

            // Initialize run data - logs will come from backend polling
            setCurrentRunData({
                id: response.runId,
                logs: [], // Start empty, real logs will be populated by polling
                status: 'running'
            });

        } catch (error) {
            console.error('Batch run failed:', error);
            toast.error('Failed to start batch run');
        }
    }, [projectId, runConfig]);

    /**
     * What: Cancels the active test run
     * Why: Users need emergency stop capability
     */
    const cancelRun = useCallback(async () => {
        if (!activeRunId || !projectId) return;

        try {
            await api.post(`/api/runner/cancel/${activeRunId}`, { projectId });
            toast.info('Run cancelled');
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = null;
            setActiveRunId(null);
        } catch (error) {
            toast.error('Failed to cancel run');
        }
    }, [activeRunId, projectId]);

    /**
     * What: Polls the backend for run status updates
     * Why: Frontend needs real-time updates on execution progress
     * How: Fetches run data every 1 second, stops when status !== 'running'
     */
    useEffect(() => {
        if (activeRunId && projectId) {
            const poll = async () => {
                try {
                    const data: any = await api.get(`/api/runner/run/${activeRunId}?projectId=${projectId}`);
                    setCurrentRunData(data);

                    if (data.status !== 'running') {
                        // Stop polling
                        if (pollingRef.current) clearInterval(pollingRef.current);
                        pollingRef.current = null;
                        setActiveRunId(null);

                        // Show result toast
                        if (data.status === 'passed') {
                            toast.success('All tests passed! 🎉');
                        } else if (data.status === 'failed') {
                            toast.error('Some tests failed');
                        }
                    }
                } catch (e) {
                    console.error('Polling error:', e);
                }
            };

            // Start polling interval
            pollingRef.current = setInterval(poll, 1000);
            poll(); // Initial call

            // Cleanup on unmount or activeRunId change
            return () => {
                if (pollingRef.current) clearInterval(pollingRef.current);
            };
        }
    }, [activeRunId, projectId]);

    // Cleanup polling on component unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    /**
     * What: Calculates execution progress percentage
     * Why: For progress bars and visual feedback
     */
    const getProgress = useCallback((totalTests: number): number => {
        if (!currentRunData || !currentRunData.results) return 0;
        return (currentRunData.results.length / (totalTests || 1)) * 100;
    }, [currentRunData]);

    return {
        activeRunId,
        currentRunData,
        runConfig,
        setRunConfig,
        startBatchRun,
        cancelRun,
        isRunning: activeRunId !== null,
        getProgress
    };
}
