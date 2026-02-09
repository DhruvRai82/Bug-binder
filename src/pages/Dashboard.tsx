import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bug, TestTube2, AlertTriangle, TrendingUp, Search, Filter, BarChart3, PieChart, Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { TestCase, Bug as BugType, DailyData } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalyticsChart } from '@/features/reports/AnalyticsChart';
import { Route } from '@/routes/_authenticated/dashboard';
import { useProject } from '@/context/ProjectContext';
import { Separator } from '@/components/ui/separator';

export default function Dashboard() {
  const { selectedProject } = useProject();
  const dailyData = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Removed internal fetching logic as it is now handled by the loader


  // Aggregate all data from all dates AND Deduplicate by ID
  const allTestCases = Array.from(new Map(
    dailyData.flatMap(day => day.testCases || []).map(tc => [tc.id, tc])
  ).values());

  const allBugs = Array.from(new Map(
    dailyData.flatMap(day => day.bugs || []).map(bug => [bug.id, bug])
  ).values());

  // Failed test cases (status === 'Fail')
  const failedTestCases = allTestCases.filter(tc => tc.status === 'Fail');
  const notExecutedTestCases = allTestCases.filter(tc => tc.status === 'Not Executed');

  const filterTestCases = (testCases: TestCase[]) => {
    return testCases.filter(tc => {
      const matchesSearch = !searchQuery ||
        tc.testCaseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tc.testScenario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tc.module.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || tc.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const filterBugs = (bugs: BugType[]) => {
    return bugs.filter(bug => {
      const matchesSearch = !searchQuery ||
        bug.bugId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.module.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = severityFilter === 'all' || bug.severity === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  };

  const filteredFailedTestCases = filterTestCases(failedTestCases);
  const filteredBugs = filterBugs(allBugs);

  // Stats calculations
  const totalTestCases = allTestCases.length;
  const passedTestCases = allTestCases.filter(tc => tc.status === 'Pass').length;
  // Pass rate should exclude "Not Executed" from the denominator if we want "Execution Pass Rate", 
  // but usually "Coverage Pass Rate" is Pass / Total. Let's stick to Pass / Total for now as it's standard.
  const passRate = totalTestCases > 0 ? ((passedTestCases / totalTestCases) * 100).toFixed(1) : '0';

  const openBugs = allBugs.filter(bug => bug.status === 'Open').length;
  const criticalBugs = allBugs.filter(bug => bug.severity === 'Critical').length;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pass': return 'default'; // Will be styled with custom class
      case 'Fail': return 'destructive';
      case 'Blocked': return 'secondary';
      case 'Not Executed': return 'outline';
      case 'Pending': return 'secondary'; // Blue badge
      default: return 'outline';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  // Analytics data preparation
  const testStatusData = [
    { name: 'Pass', value: allTestCases.filter(tc => tc.status === 'Pass').length },
    { name: 'Fail', value: allTestCases.filter(tc => tc.status === 'Fail').length },
    { name: 'Blocked', value: allTestCases.filter(tc => tc.status === 'Blocked').length },
    { name: 'Not Executed', value: allTestCases.filter(tc => tc.status === 'Not Executed').length },
    { name: 'Pending', value: allTestCases.filter(tc => tc.status === 'Pending').length }
  ].filter(item => item.value > 0);

  const bugSeverityData = [
    { name: 'Critical', value: allBugs.filter(bug => bug.severity === 'Critical').length },
    { name: 'High', value: allBugs.filter(bug => bug.severity === 'High').length },
    { name: 'Medium', value: allBugs.filter(bug => bug.severity === 'Medium').length },
    { name: 'Low', value: allBugs.filter(bug => bug.severity === 'Low').length }
  ].filter(item => item.value > 0);

  const bugStatusData = [
    { name: 'Open', value: allBugs.filter(bug => bug.status === 'Open').length },
    { name: 'In Progress', value: allBugs.filter(bug => bug.status === 'In Progress').length },
    { name: 'Resolved', value: allBugs.filter(bug => bug.status === 'Resolved').length },
    { name: 'Closed', value: allBugs.filter(bug => bug.status === 'Closed').length },
    { name: 'Rejected', value: allBugs.filter(bug => bug.status === 'Rejected').length }
  ].filter(item => item.value > 0);

  // Module-wise analysis (Corrected to use strict Fail)
  const uniqueModules = Array.from(new Set([
    ...allTestCases.map(tc => tc.module),
    ...allBugs.map(bug => bug.module)
  ])).filter(Boolean).sort();

  const moduleStats = uniqueModules.map(module => ({
    name: module,
    total: allTestCases.filter(tc => tc.module === module).length,
    pass: allTestCases.filter(tc => tc.module === module && tc.status === 'Pass').length,
    fail: allTestCases.filter(tc => tc.module === module && tc.status === 'Fail').length,
    blocked: allTestCases.filter(tc => tc.module === module && tc.status === 'Blocked').length,
    notExecuted: allTestCases.filter(tc => tc.module === module && tc.status === 'Not Executed').length,
    bugCount: allBugs.filter(bug => bug.module === module).length,
  }));

  // Chart data for Module Breakdown (Option A)
  const moduleChartData = moduleStats.map(stat => ({
    name: stat.name,
    value: stat.total
  })).sort((a, b) => b.value - a.value).slice(0, 10); // Top 10 modules by volume

  // Trend Analysis (Pass Rate over time)
  const trendData = dailyData
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7) // Last 7 days
    .map(day => {
      const total = (day.testCases || []).length;
      const passed = (day.testCases || []).filter(tc => tc.status === 'Pass').length;
      return {
        name: new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: total > 0 ? Math.round((passed / total) * 100) : 0
      };
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStatusChartClick = (data: any) => {
    if (data && data.name) {
      setStatusFilter(data.name);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSeverityChartClick = (data: any) => {
    if (data && data.name) {
      setSeverityFilter(data.name);
    }
  };

  return (
    <div className="p-8 pt-6 space-y-8 animate-in fade-in duration-500 min-h-full">
      {/* Premium Header */}
      <div className="flex flex-col space-y-1 mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent drop-shadow-sm">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg font-medium">
          Real-time insights for <span className="text-foreground font-semibold">{selectedProject?.name || 'Project'}</span>
        </p>
      </div>

      {/* Stats Cards - Floating Glass Effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="relative border-0 shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <TestTube2 className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-sm">Total</Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-bold">{totalTestCases}</h3>
              <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Test Cases</p>
            </div>
            <div className="mt-4 text-xs font-medium text-blue-100 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> {passRate}% Pass Rate
            </div>
          </CardContent>
        </Card>

        <Card className="relative border-0 shadow-lg bg-card/80 dark:bg-slate-950/90 backdrop-blur-xl rounded-2xl group hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Passed</span>
            </div>
            <h3 className="text-3xl font-bold text-foreground">{passedTestCases}</h3>
            <div className="w-full bg-muted h-1.5 mt-4 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full rounded-full" style={{ width: `${passRate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="relative border-0 shadow-lg bg-card/80 dark:bg-slate-950/90 backdrop-blur-xl rounded-2xl group hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                <XCircle className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Failed</span>
            </div>
            <h3 className="text-3xl font-bold text-foreground">{failedTestCases.length}</h3>
            <div className="w-full bg-muted h-1.5 mt-4 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full rounded-full" style={{ width: `${(failedTestCases.length / totalTestCases) * 100}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="relative border-0 shadow-lg bg-card/80 dark:bg-slate-950/90 backdrop-blur-xl rounded-2xl group hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Pending</span>
            </div>
            <h3 className="text-3xl font-bold text-foreground">{notExecutedTestCases.length}</h3>
            <div className="w-full bg-muted h-1.5 mt-4 rounded-full overflow-hidden">
              <div className="bg-gray-400 h-full rounded-full" style={{ width: `${(notExecutedTestCases.length / totalTestCases) * 100}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="relative border-0 shadow-lg bg-card/80 dark:bg-slate-950/90 backdrop-blur-xl rounded-2xl group hover:shadow-xl transition-all border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                <Bug className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Bugs</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{openBugs}</h3>
            <p className="text-xs text-muted-foreground mt-3 font-medium">{criticalBugs} Critical Issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Modern Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white/40 dark:bg-slate-900/40 p-2 rounded-2xl border border-white/20 shadow-sm backdrop-blur-md items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search metrics, tests, or bug tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-transparent border-0 focus-visible:ring-0 placeholder:text-muted-foreground/70 h-12 text-base"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto px-2">
          <Separator orientation="vertical" className="h-8 hidden sm:block bg-gray-200 dark:bg-gray-700" />
          <div className="flex gap-2 w-full">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-white/50 dark:bg-slate-800/50 border-0 h-10 rounded-xl shadow-sm hover:bg-white/80">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pass">Pass</SelectItem>
                <SelectItem value="Fail">Fail</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
                <SelectItem value="Not Executed">Not Executed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-white/50 dark:bg-slate-800/50 border-0 h-10 rounded-xl shadow-sm hover:bg-white/80">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Module Chart */}
        <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl">
          <CardHeader>
            <CardTitle>Test Volume by Module</CardTitle>
            <CardDescription>Top 10 most active testing areas</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <AnalyticsChart
              type="bar"
              data={moduleChartData}
              title=""
              dataKey="value"
              nameKey="name"
            />
          </CardContent>
        </Card>

        {/* Module Matrix Table */}
        <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl flex flex-col max-h-[400px]">
          <CardHeader className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800 pb-4">
            <CardTitle className="text-lg">Performance Matrix</CardTitle>
            <CardDescription>Detailed execution status per module</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 dark:bg-slate-900/80 sticky top-0 backdrop-blur-sm z-10">
                <tr>
                  <th className="py-4 px-6 font-semibold text-muted-foreground">Module</th>
                  <th className="py-4 px-6 font-semibold text-center text-muted-foreground">Total</th>
                  <th className="py-4 px-6 font-bold text-center text-green-600">Pass</th>
                  <th className="py-4 px-6 font-bold text-center text-red-600">Fail</th>
                  <th className="py-4 px-6 font-semibold text-center text-gray-400">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {moduleStats.map((stat, i) => (
                  <tr key={stat.name} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="py-3 px-6 font-medium">{stat.name || 'Unassigned'}</td>
                    <td className="py-3 px-6 text-center text-muted-foreground">{stat.total}</td>
                    <td className="py-3 px-6 text-center font-medium bg-green-50/30 dark:bg-green-900/10 text-green-700 dark:text-green-400">{stat.pass}</td>
                    <td className="py-3 px-6 text-center">
                      {stat.fail > 0 ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold">{stat.fail}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-center text-gray-400">{stat.notExecuted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-0 shadow-lg bg-card/40 backdrop-blur-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Results Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] -ml-4">
            <AnalyticsChart type="pie" data={testStatusData} title="" dataKey="value" nameKey="name" onClick={handleStatusChartClick} />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-card/40 backdrop-blur-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Bug Severity</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] -ml-4">
            <AnalyticsChart type="pie" data={bugSeverityData} title="" dataKey="value" nameKey="name" colors={['#EF4444', '#F97316', '#EAB308', '#3B82F6']} onClick={handleSeverityChartClick} />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-card/40 backdrop-blur-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">7-Day Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <AnalyticsChart type="line" data={trendData} title="" dataKey="value" nameKey="name" />
          </CardContent>
        </Card>
      </div>

      {/* Failures & Bugs Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
        {/* Failed Tests */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50/50 to-white dark:from-red-950/20 dark:to-slate-900 backdrop-blur-xl rounded-3xl h-full flex flex-col">
          <CardHeader className="border-b border-red-100 dark:border-red-900/30 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-red-900 dark:text-red-100">Failed Tests</CardTitle>
                  <CardDescription className="text-red-700/60 dark:text-red-300/60">Requires immediate attention</CardDescription>
                </div>
              </div>
              <Badge variant="destructive" className="px-3 py-1 rounded-full">{filteredFailedTestCases.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 custom-scrollbar">
            {filteredFailedTestCases.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground opacity-60">
                <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                <p>All tests passed!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFailedTestCases.map(tc => (
                  <div key={tc.id} className="p-4 bg-white dark:bg-slate-900/60 rounded-xl shadow-sm border border-red-100 dark:border-red-900/20 flex justify-between items-center group hover:shadow-md transition-all">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm truncate" title={tc.testCaseId}>{tc.testCaseId}</h4>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{tc.testScenario}</p>
                    </div>
                    <Badge variant="destructive" className="text-[10px] uppercase tracking-wider">Fail</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bugs */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/20 dark:to-slate-900 backdrop-blur-xl rounded-3xl h-full flex flex-col">
          <CardHeader className="border-b border-orange-100 dark:border-orange-900/30 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg text-orange-600">
                  <Bug className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-orange-900 dark:text-orange-100">Recent Issues</CardTitle>
                  <CardDescription className="text-orange-700/60 dark:text-orange-300/60">Live bug tracker feed</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="px-3 py-1 rounded-full border-orange-200 text-orange-700 bg-orange-50">{filteredBugs.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 custom-scrollbar">
            {filteredBugs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground opacity-60">
                <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                <p>No active bugs.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBugs.map(bug => (
                  <div key={bug.id} className="p-4 bg-white dark:bg-slate-900/60 rounded-xl shadow-sm border border-orange-100 dark:border-orange-900/20 flex justify-between items-center group hover:shadow-md transition-all">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm truncate">{bug.bugId}</span>
                        <Badge variant="outline" className={`text-[10px] h-5 ${bug.severity === 'Critical' ? 'border-red-200 text-red-600 bg-red-50' :
                          bug.severity === 'High' ? 'border-orange-200 text-orange-600 bg-orange-50' : ''
                          }`}>{bug.severity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{bug.title}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">{bug.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
