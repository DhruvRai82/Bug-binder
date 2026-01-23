import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Archive, ChevronRight, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TestCase } from '@/types';

interface MobileTestCaseCardProps {
    testCase: TestCase;
    onClick: () => void;
}

export function MobileTestCaseCard({ testCase, onClick }: MobileTestCaseCardProps) {
    const statusColor = (status: string) => {
        switch (status) {
            case 'Pass': return 'text-green-600 bg-green-500/10 border-green-200';
            case 'Fail': return 'text-red-600 bg-red-500/10 border-red-200';
            case 'Blocked': return 'text-orange-600 bg-orange-500/10 border-orange-200';
            default: return 'text-slate-500 bg-slate-100 border-slate-200';
        }
    };

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'Pass': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            case 'Fail': return <XCircle className="h-4 w-4 text-red-600" />;
            case 'Blocked': return <AlertCircle className="h-4 w-4 text-orange-600" />;
            default: return <HelpCircle className="h-4 w-4 text-slate-400" />;
        }
    };

    return (
        <Card
            className="group active:scale-[0.98] transition-all duration-200 border-border/60 shadow-sm hover:shadow-md bg-card/50 backdrop-blur-sm overflow-hidden relative"
            onClick={onClick}
        >
            {/* Status Strip */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1",
                testCase.status === 'Pass' ? 'bg-green-500' :
                    testCase.status === 'Fail' ? 'bg-red-500' :
                        testCase.status === 'Blocked' ? 'bg-orange-500' : 'bg-slate-300'
            )} />

            <CardContent className="p-4 pl-5">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground bg-background/50 border-border/50 shadow-sm">
                            {testCase.testCaseId}
                        </Badge>
                        {testCase.module && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/80">
                                <Archive className="h-3 w-3" /> {testCase.module}
                            </span>
                        )}
                    </div>
                    {testCase.status !== 'Not Executed' && (
                        <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border", statusColor(testCase.status))}>
                            <StatusIcon status={testCase.status} />
                            {testCase.status}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center gap-4">
                    <h3 className="font-semibold text-sm leading-snug text-foreground/90 line-clamp-2">
                        {testCase.testScenario}
                    </h3>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-active:translate-x-1 transition-transform" />
                </div>
            </CardContent>
        </Card>
    );
}
