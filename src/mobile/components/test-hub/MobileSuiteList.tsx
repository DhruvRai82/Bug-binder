
import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, MoreVertical, Play, Clock, Edit, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function MobileSuiteList() {
    const { selectedProject } = useProject();
    const [suites, setSuites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (selectedProject) fetchSuites();
    }, [selectedProject]);

    const fetchSuites = async () => {
        try {
            const data: any = await api.get(`/api/suites?projectId=${selectedProject?.id}`);
            setSuites(data);
        } catch (error) {
            console.error("Failed to load suites", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRun = (suiteId: string) => {
        toast.info("Starting suite execution...");
        // TODO: Integrate with MobileRunner or trigger simplified run
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading suites...</div>;

    if (suites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center">
                    <Layers className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg">No Suites Found</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Create Test Suites on the desktop app to organize your test cases.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 pb-20">
            {suites.map((suite) => (
                <Card key={suite.id} className="active:scale-[0.99] transition-transform">
                    <CardContent className="p-4 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 bg-blue-500/10 rounded-lg">
                                <Layers className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">{suite.name}</h3>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {suite.fileIds?.length || 0} Test Cases
                                </p>
                                {suite.description && (
                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                        {suite.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleRun(suite.id)}>
                                    <Play className="h-4 w-4 mr-2" /> Run Suite
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Clock className="h-4 w-4 mr-2" /> Schedule
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
