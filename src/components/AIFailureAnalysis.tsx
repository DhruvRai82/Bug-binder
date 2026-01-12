import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Lightbulb, Brain, CheckCircle2 } from 'lucide-react';

interface AIAnalysis {
    failureReason: string;
    technicalRootCause: string;
    suggestedFix: string;
    confidenceScore: number;
}

interface AIFailureAnalysisProps {
    analysis: AIAnalysis;
}

export function AIFailureAnalysis({ analysis }: AIFailureAnalysisProps) {
    if (!analysis) return null;

    const getConfidenceColor = (score: number) => {
        if (score > 0.8) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
        if (score > 0.5) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    };

    return (
        <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <CardHeader className="pb-3 border-b bg-primary/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/20 rounded-lg">
                            <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">AI Failure Analysis</CardTitle>
                            <CardDescription className="text-xs">Autonomous diagnostic report</CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className={getConfidenceColor(analysis.confidenceScore)}>
                        {Math.round(analysis.confidenceScore * 100)}% Confidence
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="flex gap-3">
                    <div className="mt-1">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-1">Failure Reason</h4>
                        <p className="text-sm text-foreground/80">{analysis.failureReason}</p>
                    </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg border border-muted">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                        Technical Root Cause
                    </h4>
                    <p className="text-sm font-mono bg-background/50 p-2 rounded border break-all">
                        {analysis.technicalRootCause}
                    </p>
                </div>

                <div className="flex gap-3 items-start p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                    <div className="mt-1 p-1 bg-green-500/20 rounded-full">
                        <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-1 text-green-700 dark:text-green-300">Suggested Fix</h4>
                        <p className="text-sm text-green-600/90 dark:text-green-400/90">{analysis.suggestedFix}</p>
                        <div className="mt-3 flex gap-2">
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 cursor-pointer">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Apply Suggestion
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
