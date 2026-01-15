
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, CheckCircle, AlertTriangle, Bug, TrendingUp } from "lucide-react";
import { Route } from '@/routes/_authenticated/dashboard';
import { AnalyticsChart } from '@/features/reports/AnalyticsChart';
import { Badge } from '@/components/ui/badge';

export function MobileDashboard() {
    const dailyData = Route.useLoaderData();

    // --- Data Aggregation Logic (Same as Desktop) ---
    const allTestCases = Array.from(new Map(
        dailyData.flatMap(day => day.testCases || []).map(tc => [tc.id, tc])
    ).values());

    const allBugs = Array.from(new Map(
        dailyData.flatMap(day => day.bugs || []).map(bug => [bug.id, bug])
    ).values());

    // Stats
    const totalTestCases = allTestCases.length;
    const passedTestCases = allTestCases.filter(tc => tc.status === 'Pass').length;
    const failedTestCases = allTestCases.filter(tc => tc.status === 'Fail').length;
    const openBugs = allBugs.filter(bug => bug.status === 'Open').length;

    // Trend Data (Last 7 Days)
    const trendData = dailyData
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7)
        .map(day => {
            const total = (day.testCases || []).length;
            const passed = (day.testCases || []).filter(tc => tc.status === 'Pass').length;
            return {
                name: new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                value: total > 0 ? Math.round((passed / total) * 100) : 0
            };
        });

    return (
        <div className="space-y-4 p-2 pb-20">
            <div className="flex items-center justify-between mb-2 px-1">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-xs text-muted-foreground">Mobile Overview</p>
                </div>
                <Badge variant={openBugs > 0 ? "destructive" : "outline"} className="h-7 text-xs">
                    {openBugs} Active Bugs
                </Badge>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Total Tests */}
                <Card className="bg-primary/5 border-primary/20 shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Activity className="h-5 w-5 text-primary mb-2 opacity-80" />
                        <span className="text-3xl font-bold tracking-tight">{totalTestCases}</span>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground mt-1">Total Tests</span>
                    </CardContent>
                </Card>

                {/* Passed Tests */}
                <Card className="bg-green-500/5 border-green-500/20 shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mb-2 opacity-80" />
                        <span className="text-3xl font-bold tracking-tight text-green-700 dark:text-green-500">{passedTestCases}</span>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground mt-1">Passed By</span>
                    </CardContent>
                </Card>

                {/* Failed Tests */}
                <Card className="bg-red-500/5 border-red-500/20 shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 mb-2 opacity-80" />
                        <span className="text-3xl font-bold tracking-tight text-red-700 dark:text-red-500">{failedTestCases}</span>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground mt-1">Failed</span>
                    </CardContent>
                </Card>

                {/* Bug Count */}
                <Card className="bg-orange-500/5 border-orange-500/20 shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Bug className="h-5 w-5 text-orange-600 mb-2 opacity-80" />
                        <span className="text-3xl font-bold tracking-tight text-orange-700 dark:text-orange-500">{allBugs.length}</span>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground mt-1">Total Bugs</span>
                    </CardContent>
                </Card>
            </div>

            {/* Trend Chart */}
            <Card className="shadow-sm">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Pass Rate Trend
                    </CardTitle>
                    <CardDescription className="text-xs">Last 7 Days Performance</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 h-[200px]">
                    {trendData.length > 0 ? (
                        <div className="-ml-4 mt-2">
                            <AnalyticsChart
                                type="line"
                                data={trendData}
                                title=""
                                dataKey="value"
                                nameKey="name"
                                height={180}
                            />
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                            No trend data available
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
