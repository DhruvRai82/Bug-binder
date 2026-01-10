import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Route } from '@/routes/_authenticated/dashboard';
import { ProjectSelector } from '@/components/ProjectSelector';
import { DashboardCard } from '@/components/DashboardCard';
import { Project, TestCase, Bug, DailyData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useProject } from '@/context/ProjectContext';
import { TestTube2, Bug as BugIcon, Code2, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

const Index = () => {
  const { selectedProject, setSelectedProject } = useProject();
  // const { toast } = useToast(); // Unused now?
  const navigate = useNavigate();
  const dailyData = Route.useLoaderData();

  // Remove manual fetching logic
  /* 
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  ... useEffect ... loadDailyData ...
  */

  // Calculate dashboard stats
  const allTestCases = dailyData.flatMap(day => day.testCases || []);
  const allBugs = dailyData.flatMap(day => day.bugs || []);
  const failedTestCases = allTestCases.filter(tc => tc.status !== 'Pass');
  const openBugs = allBugs.filter(bug => bug.status === 'Open');
  const criticalBugs = allBugs.filter(bug => bug.severity === 'Critical');

  const totalTestCases = allTestCases.length;
  const passedTestCases = allTestCases.filter(tc => tc.status === 'Pass').length;
  const passRate = totalTestCases > 0 ? ((passedTestCases / totalTestCases) * 100).toFixed(1) : '0';


  if (!selectedProject) {
    return (
      <div className="h-full overflow-auto">
        <ProjectSelector selectedProject={selectedProject} onProjectSelect={setSelectedProject} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6">
        <ProjectSelector selectedProject={selectedProject} onProjectSelect={setSelectedProject} />

        <div className="mt-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to TestFlow</h1>
          <p className="text-muted-foreground mb-8">
            Choose a module to start managing your {selectedProject.name} project
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard
              title="Dashboard"
              description="Get an overview of all your test cases and bugs across all dates"
              icon={<BarChart3 className="h-6 w-6" />}
              stats={[
                { label: "Total Tests", value: totalTestCases.toString() },
                { label: "Pass Rate", value: `${passRate}%` },
                { label: "Open Bugs", value: openBugs.length.toString() }
              ]}
              actions={[
                { label: "View Dashboard", variant: "default" }
              ]}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate({ to: '/dashboard' })}
            />

            <DashboardCard
              title="Test Cases"
              description="Manage test cases with custom pages and dates"
              icon={<TestTube2 className="h-6 w-6" />}
              stats={[
                { label: "Total Cases", value: totalTestCases.toString() },
                { label: "Failed", value: failedTestCases.length.toString() },
                { label: "Passed", value: passedTestCases.toString() }
              ]}
              actions={[
                { label: "Manage Test Cases", variant: "default" }
              ]}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate({ to: '/test-cases' })}
            />

            <DashboardCard
              title="Bug Tracking"
              description="Track and manage bugs with JIRA-like functionality"
              icon={<BugIcon className="h-6 w-6" />}
              stats={[
                { label: "Total Bugs", value: allBugs.length.toString() },
                { label: "Open", value: openBugs.length.toString() },
                { label: "Critical", value: criticalBugs.length.toString() }
              ]}
              actions={[
                { label: "Manage Bugs", variant: "default" }
              ]}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate({ to: '/bugs' })}
            />

            <DashboardCard
              title="Automation Scripts"
              description="Store and manage your test automation scripts"
              icon={<Code2 className="h-6 w-6" />}
              stats={[
                { label: "Scripts", value: "0" },
                { label: "Languages", value: "0" },
                { label: "Categories", value: "0" }
              ]}
              actions={[
                { label: "Manage Scripts", variant: "default" }
              ]}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate({ to: '/recorder' })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;