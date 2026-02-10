import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface TestMethod {
    name: string;
    className: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    startTime: string;
}

export interface TestNGResults {
    available: boolean;
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    totalTime: number;
    methods: TestMethod[];
    reportPath: string;
}

interface TestNGResultsProps {
    results: TestNGResults;
    onViewReport?: () => void;
}

export function TestNGResultsDisplay({ results, onViewReport }: TestNGResultsProps) {
    if (!results.available) {
        return (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>No TestNG results available for this run</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Passed"
                    value={results.passed}
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    color="text-green-600 dark:text-green-400"
                    bgColor="bg-green-50 dark:bg-green-950/30"
                />
                <StatCard
                    label="Failed"
                    value={results.failed}
                    icon={<XCircle className="w-5 h-5" />}
                    color="text-red-600 dark:text-red-400"
                    bgColor="bg-red-50 dark:bg-red-950/30"
                />
                <StatCard
                    label="Skipped"
                    value={results.skipped}
                    icon={<AlertCircle className="w-5 h-5" />}
                    color="text-yellow-600 dark:text-yellow-400"
                    bgColor="bg-yellow-50 dark:bg-yellow-950/30"
                />
                <StatCard
                    label="Total Time"
                    value={`${results.totalTime}s`}
                    icon={<Clock className="w-5 h-5" />}
                    color="text-blue-600 dark:text-blue-400"
                    bgColor="bg-blue-50 dark:bg-blue-950/30"
                />
            </div>

            {/* Test Methods List */}
            {results.methods.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Test Methods</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {results.methods.map((method, index) => (
                            <TestMethodCard key={index} method={method} />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* View Full Report Button */}
            {results.reportPath && onViewReport && (
                <Button
                    onClick={onViewReport}
                    variant="outline"
                    className="w-full"
                >
                    📊 View Full TestNG Report
                </Button>
            )}
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

function StatCard({ label, value, icon, color, bgColor }: StatCardProps) {
    return (
        <Card className={bgColor}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                    <div className={color}>{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}

interface TestMethodCardProps {
    method: TestMethod;
}

function TestMethodCard({ method }: TestMethodCardProps) {
    const statusConfig = {
        passed: {
            icon: <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />,
            bgColor: 'bg-green-50 dark:bg-green-950/20',
            borderColor: 'border-l-green-500'
        },
        failed: {
            icon: <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />,
            bgColor: 'bg-red-50 dark:bg-red-950/20',
            borderColor: 'border-l-red-500'
        },
        skipped: {
            icon: <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />,
            bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
            borderColor: 'border-l-yellow-500'
        }
    };

    const config = statusConfig[method.status];

    return (
        <div className={`flex items-center justify-between p-3 rounded-md border-l-4 ${config.bgColor} ${config.borderColor}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {config.icon}
                <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{method.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{method.className}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{method.duration.toFixed(2)}s</span>
            </div>
        </div>
    );
}
