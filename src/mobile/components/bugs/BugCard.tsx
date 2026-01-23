import React from 'react';
import { Bug } from '@/types';
import { cn } from '@/lib/utils';
import { Bug as BugIcon, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface BugCardProps {
    bug: Bug;
    onClick: () => void;
}

export function BugCard({ bug, onClick }: BugCardProps) {
    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return 'text-red-600 bg-red-50 ring-red-500/20';
            case 'high': return 'text-orange-600 bg-orange-50 ring-orange-500/20';
            case 'medium': return 'text-yellow-600 bg-yellow-50 ring-yellow-500/20';
            case 'low': return 'text-blue-600 bg-blue-50 ring-blue-500/20';
            default: return 'text-gray-600 bg-gray-50 ring-gray-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'fixed': return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
            case 'open': return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
            default: return <Clock className="h-3.5 w-3.5 text-blue-500" />;
        }
    };

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col gap-3 p-4 bg-card hover:bg-accent/50 active:scale-[0.99] transition-all duration-200 border-b last:border-0"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {bug.bugId}
                        </span>
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ring-1 ring-inset",
                            getSeverityColor(bug.severity)
                        )}>
                            {bug.severity}
                        </span>
                    </div>
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {bug.description}
                    </h3>
                </div>
                {getStatusIcon(bug.status)}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <BugIcon className="h-3 w-3" />
                    <span>{bug.stepsToReproduce?.slice(0, 30)}...</span>
                </div>
                <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    );
}
