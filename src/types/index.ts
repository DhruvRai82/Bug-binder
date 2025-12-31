export interface TestCase {
  id: string;
  module: string;
  testCaseId: string;
  testScenario: string;
  testCaseDescription: string;
  preConditions: string;
  testSteps: string;
  testData: string;
  expectedResult: string;
  actualResult: string;
  status: 'Pass' | 'Fail' | 'Blocked' | 'Not Executed';
  comments: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bug {
  id: string;
  bugId: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Rejected';
  assignee: string;
  reporter: string;
  module: string;
  environment: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  comments: string;
  linkedTestCaseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyData {
  date: string;
  testCases: TestCase[];
  bugs: Bug[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  webhookSecret?: string;
  createdAt: string;
  updatedAt: string;
}