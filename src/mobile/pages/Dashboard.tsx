
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
    const failedTestCases = allTestCases.filter(tc => tc.status === 'Fail');
    const blockedTestCases = allTestCases.filter(tc => tc.status === 'Blocked').length;
    const pendingTestCases = allTestCases.filter(tc => tc.status === 'Not Executed').length;
    const openBugs = allBugs.filter(bug => ['Open', 'In Progress'].includes(bug.status));

    // Module stats for mobile (Top 5 by failure count)
    const uniqueModules = Array.from(new Set(allTestCases.map(tc => tc.module)));
    const moduleStats = uniqueModules.map(module => ({
        name: module,
        fail: allTestCases.filter(tc => tc.module === module && tc.status === 'Fail').length,
        total: allTestCases.filter(tc => tc.module === module).length
    }))
        .sort((a, b) => b.fail - a.fail)
        .slice(0, 5);

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
        <div className="space-y-6 p-4 pb-24 bg-background min-h-screen">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-xs text-muted-foreground">Mobile Overview</p>
                </div>
                <Badge variant={openBugs.length > 0 ? "destructive" : "outline"} className="h-7 text-xs">
                    {openBugs.length} Active Bugs
                </Badge>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="bg-primary/5 border-primary/20 shadow-none">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center h-24">
                        <Activity className="h-4 w-4 text-primary mb-1 opacity-80" />
                        <span className="text-2xl font-bold tracking-tight">{totalTestCases}</span>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground">Total Tests</span>
                    </CardContent>
                </Card>

                <Card className="bg-green-500/5 border-green-500/20 shadow-none">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center h-24">
                        <CheckCircle className="h-4 w-4 text-green-600 mb-1 opacity-80" />
                        <span className="text-2xl font-bold tracking-tight text-green-700 dark:text-green-500">{passedTestCases}</span>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground">Passed</span>
                    </CardContent>
                </Card>

                <Card className="bg-red-500/5 border-red-500/20 shadow-none">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center h-24">
                        <AlertTriangle className="h-4 w-4 text-red-600 mb-1 opacity-80" />
                        <span className="text-2xl font-bold tracking-tight text-red-700 dark:text-red-500">{failedTestCases.length}</span>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground">Failed</span>
                    </CardContent>
                </Card>

                <Card className="bg-orange-500/5 border-orange-500/20 shadow-none">
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center h-24">
                        <Bug className="h-4 w-4 text-orange-600 mb-1 opacity-80" />
                        <span className="text-2xl font-bold tracking-tight text-orange-700 dark:text-orange-500">{allBugs.length}</span>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground">Total Bugs</span>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Failures Feed */}
            {failedTestCases.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Recent Failures
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {failedTestCases.slice(0, 3).map(tc => (
                            <Card key={tc.id} className="border-l-4 border-l-red-500 shadow-sm">
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold text-sm">{tc.testCaseId}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{tc.testScenario}</p>
                                        </div>
                                        <Badge variant="destructive" className="text-[10px] px-1.5 h-5">Fail</Badge>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/50 p-1.5 rounded-md">
                                        <span className="font-medium bg-background px-1 rounded border shadow-sm">Module</span>
                                        {tc.module}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Bugs Feed */}
            {openBugs.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2">
                            <Bug className="h-4 w-4 text-orange-500" />
                            Active Issues
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {openBugs.slice(0, 3).map(bug => (
                            <Card key={bug.id} className="shadow-sm">
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 mr-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-sm">{bug.bugId}</span>
                                                <Badge variant="outline" className={`text-[10px] h-4 px-1 ${bug.severity === 'Critical' ? 'text-red-600 bg-red-50 border-red-200' :
                                                        'text-orange-600 bg-orange-50 border-orange-200'
                                                    }`}>
                                                    {bug.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{bug.title}</p>
                                        </div>
                                        <Badge variant="secondary" className="text-[10px] h-5 whitespace-nowrap">{bug.status}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Problem Areas (Modules with most fails) */}
            {moduleStats.length > 0 && moduleStats[0].fail > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground px-1">Problem Areas</h3>
                    <Card>
                        <CardContent className="p-0 divide-y">
                            {moduleStats.map(stat => (
                                <div key={stat.name} className="flex items-center justify-between p-3">
                                    <span className="text-sm font-medium">{stat.name}</span>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="text-muted-foreground">{stat.total} tests</span>
                                        {stat.fail > 0 && (
                                            <Badge variant="destructive" className="h-5 px-1.5">
                                                {stat.fail} Fail
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

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
