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
    { name: 'Not Executed', value: allTestCases.filter(tc => tc.status === 'Not Executed').length }
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
    <div className="p-4 w-full space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Overview of test cases and bugs for {selectedProject?.name}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-100 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
              <TestTube2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Test Cases</p>
              <h3 className="text-xl font-bold text-foreground">{totalTestCases}</h3>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">{passRate}% pass rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-100 dark:border-green-900/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Passed</p>
              <h3 className="text-xl font-bold text-foreground">{passedTestCases}</h3>
              <p className="text-[10px] text-green-600 dark:text-green-400 font-medium mt-0.5">Tests Passing</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background border-red-100 dark:border-red-900/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Failed Tests</p>
              <h3 className="text-xl font-bold text-foreground">{failedTestCases.length}</h3>
              <p className="text-[10px] text-red-600 dark:text-red-400 font-medium mt-0.5">Strict Failures</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/20 dark:to-background border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Not Executed</p>
              <h3 className="text-xl font-bold text-foreground">{notExecutedTestCases.length}</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">Pending Run</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background border-orange-100 dark:border-orange-900/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-full">
              <Bug className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Open Bugs</p>
              <h3 className="text-xl font-bold text-foreground">{openBugs}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{allBugs.length} Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card/50 p-4 rounded-lg border shadow-sm backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search test cases and bugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pass">Pass</SelectItem>
              <SelectItem value="Fail">Fail</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
              <SelectItem value="Not Executed">Not Executed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Filter by severity" />
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

      {/* Module Breakdown Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Option A: Chart */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Test Cases by Module (Top 10)</CardTitle>
            <CardDescription>Volume of test cases per functional area</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              type="bar"
              data={moduleChartData}
              title=""
              dataKey="value"
              nameKey="name"
            />
          </CardContent>
        </Card>

        {/* Option B: Table */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm max-h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle>Module Performance Matrix</CardTitle>
            <CardDescription>Detailed breakdown of status by module</CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1 p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Module</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center">Total</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center text-green-600">Pass</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center text-red-600">Fail</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center text-gray-500">Pending</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {moduleStats.map((stat) => (
                    <tr key={stat.name} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{stat.name || 'Unassigned'}</td>
                      <td className="p-4 align-middle text-center">{stat.total}</td>
                      <td className="p-4 align-middle text-center">{stat.pass}</td>
                      <td className="p-4 align-middle text-center">
                        {stat.fail > 0 ? (
                          <Badge variant="destructive" className="h-5 px-1.5 min-w-[1.5rem] justify-center">{stat.fail}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 align-middle text-center text-muted-foreground">{stat.notExecuted}</td>
                    </tr>
                  ))}
                  {moduleStats.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">No module data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Test Status</CardTitle>
            <CardDescription>Distribution of test execution results (Click to filter)</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              type="pie"
              data={testStatusData}
              title=""
              dataKey="value"
              nameKey="name"
              onClick={handleStatusChartClick}
            />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Bug Severity</CardTitle>
            <CardDescription>Breakdown of bugs by severity level (Click to filter)</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              type="pie"
              data={bugSeverityData}
              title=""
              dataKey="value"
              nameKey="name"
              colors={['#FF6B6B', '#FFA726', '#FFEE58', '#42A5F5']}
              onClick={handleSeverityChartClick}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Bug Status</CardTitle>
            <CardDescription>Current state of reported issues</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              type="bar"
              data={bugStatusData}
              title=""
              dataKey="value"
              nameKey="name"
            />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Pass Rate Trend</CardTitle>
            <CardDescription>Pass rate percentage over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              type="line"
              data={trendData}
              title=""
              dataKey="value"
              nameKey="name"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failed Test Cases */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-md">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              Failed Test Cases
              <Badge variant="secondary" className="ml-auto">{filteredFailedTestCases.length}</Badge>
            </CardTitle>
            <CardDescription>Tests that require immediate attention (Strict Failures)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {filteredFailedTestCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-2 opacity-50" />
                  <p>No failed tests! Great job.</p>
                </div>
              ) : (
                filteredFailedTestCases.slice(0, 10).map((testCase) => (
                  <div key={testCase.id} className="group flex items-center justify-between p-4 border rounded-xl bg-background hover:shadow-md transition-all">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold truncate">{testCase.testCaseId}</span>
                        <Badge variant="outline" className="text-xs font-normal">{testCase.module}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground truncate" title={testCase.testScenario}>
                        {testCase.testScenario}
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(testCase.status)} className="shrink-0">
                      {testCase.status}
                    </Badge>
                  </div>
                ))
              )}
              {filteredFailedTestCases.length > 10 && (
                <Button variant="ghost" className="w-full text-muted-foreground">
                  View {filteredFailedTestCases.length - 10} more...
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bugs */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-md">
                <Bug className="h-5 w-5 text-orange-600" />
              </div>
              Recent Bugs
              <Badge variant="secondary" className="ml-auto">{filteredBugs.length}</Badge>
            </CardTitle>
            <CardDescription>Latest reported issues across modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {filteredBugs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-2 opacity-50" />
                  <p>No bugs found. Clean sheet!</p>
                </div>
              ) : (
                filteredBugs.slice(0, 10).map((bug) => (
                  <div key={bug.id} className="group flex items-center justify-between p-4 border rounded-xl bg-background hover:shadow-md transition-all">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold truncate">{bug.bugId}</span>
                        <Badge variant={getSeverityBadgeVariant(bug.severity)} className="text-xs">
                          {bug.severity}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground truncate" title={bug.title}>
                        {bug.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Reporter: {bug.reporter}
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {bug.status}
                    </Badge>
                  </div>
                ))
              )}
              {filteredBugs.length > 10 && (
                <Button variant="ghost" className="w-full text-muted-foreground">
                  View {filteredBugs.length - 10} more...
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
