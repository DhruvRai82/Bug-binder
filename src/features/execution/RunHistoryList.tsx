
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, FileCode, ChevronRight, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RunHistoryListProps {
    runs: any[];
    onSelectRun: (runId: string) => void;
    onDeleteRun: (runId: string, e: React.MouseEvent) => void;
}

export const RunHistoryList: React.FC<RunHistoryListProps> = ({ runs, onSelectRun, onDeleteRun }) => {
    const [filter, setFilter] = React.useState('');

    const filteredRuns = runs.filter(run =>
        run.id.includes(filter) ||
        (run.triggeredBy || '').includes(filter) ||
        run.status.includes(filter)
    );

    return (
        <Card>
            <CardHeader className="pb-3 space-y-2">
                <CardTitle className="text-lg flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        Recent Runs
                    </div>
                </CardTitle>
                <input
                    type="text"
                    placeholder="Filter runs..."
                    className="w-full text-xs bg-background border rounded px-2 py-1"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {filteredRuns.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">No runs match filter.</div>
                    ) : (
                        filteredRuns.map((run) => (
                            <div
                                key={run.id}
                                className="p-3 hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between group"
                                onClick={() => onSelectRun(run.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${run.status === 'completed' ? 'bg-emerald-500' :
                                        run.status === 'failed' ? 'bg-red-500' :
                                            'bg-amber-500 animate-pulse'
                                        }`} />

                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">
                                                Batch Run #{run.id.slice(0, 6)}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                                                {run.files?.length || 0} Files
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {/* Safe Date Handling */}
                                                {!isNaN(new Date(run.startTime).getTime())
                                                    ? formatDistanceToNow(new Date(run.startTime), { addSuffix: true })
                                                    : 'Unknown Date'}
                                            </span>
                                            {run.endTime && !isNaN(new Date(run.endTime).getTime()) && !isNaN(new Date(run.startTime).getTime()) && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {Math.max(0, ((new Date(run.endTime).getTime() - new Date(run.startTime).getTime()) / 1000)).toFixed(1)}s
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>


                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors opacity-0 group-hover:opacity-100"
                                        onClick={(e) => onDeleteRun(run.id, e)}
                                        title="Delete Run"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card >
    );
};
