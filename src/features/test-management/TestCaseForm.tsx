import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestCase } from '@/types';


interface TestCaseFormProps {
  testCase?: TestCase | null;
  initialData?: Partial<TestCase> | null;
  onSubmit: (data: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function TestCaseForm({ testCase, initialData, onSubmit, onCancel }: TestCaseFormProps) {
  const [formData, setFormData] = useState({
    module: '',
    testCaseId: '',
    testScenario: '',
    testCaseDescription: '',
    preConditions: '',
    testSteps: '',
    testData: '',
    expectedResult: '',
    actualResult: '',
    status: 'Not Executed' as TestCase['status'],
    comments: ''
  });

  useEffect(() => {
    if (testCase) {
      setFormData({
        module: testCase.module,
        testCaseId: testCase.testCaseId,
        testScenario: testCase.testScenario,
        testCaseDescription: testCase.testCaseDescription,
        preConditions: testCase.preConditions,
        testSteps: testCase.testSteps,
        testData: testCase.testData,
        expectedResult: testCase.expectedResult,
        actualResult: testCase.actualResult,
        status: testCase.status,
        comments: testCase.comments
      });
    } else if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        status: (initialData.status as TestCase['status']) || 'Not Executed'
      }));
    }
  }, [testCase, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent
        className="max-w-6xl max-h-[95vh] h-[800px] flex flex-col border-0 bg-card/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 border-b bg-muted/20 backdrop-blur-md flex flex-row items-center justify-between sticky top-0 z-10 space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl shadow-inner">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {testCase ? 'Edit Test Case' : 'Add New Test Case'}
              </DialogTitle>
              <div className="text-sm text-muted-foreground mt-0.5">
                {testCase ? 'Update the details of the existing test case.' : 'Define the parameters and steps for the new test case.'}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex overflow-hidden">
          {/* Main Content - Left */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            {/* Header / ID */}
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-1">
                <Label htmlFor="testCaseId" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 block">TC ID</Label>
                <Input
                  id="testCaseId"
                  value={formData.testCaseId}
                  onChange={(e) => handleChange('testCaseId', e.target.value)}
                  placeholder="TC001"
                  className="font-mono bg-muted/30 focus:bg-background transition-all border-muted-foreground/20"
                  required
                />
              </div>
              <div className="col-span-5">
                <Label htmlFor="testScenario" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 block">Test Scenario</Label>
                <Input
                  id="testScenario"
                  value={formData.testScenario}
                  onChange={(e) => handleChange('testScenario', e.target.value)}
                  placeholder="Brief scenario description"
                  className="text-lg font-medium bg-muted/30 focus:bg-background transition-all border-muted-foreground/20"
                  required
                />
              </div>
            </div>

            {/* Steps & Descriptions */}
            <div className="space-y-6">
              <div className="space-y-2 group">
                <Label htmlFor="testCaseDescription" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider group-focus-within:text-foreground transition-colors">Description / Objective</Label>
                <Textarea
                  id="testCaseDescription"
                  value={formData.testCaseDescription}
                  onChange={(e) => handleChange('testCaseDescription', e.target.value)}
                  placeholder="Detailed description..."
                  className="resize-y bg-muted/30 focus:bg-background transition-all border-muted-foreground/20 focus:border-indigo-500/50"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <Label htmlFor="preConditions" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider group-focus-within:text-foreground transition-colors">Pre-Conditions</Label>
                  <Textarea
                    id="preConditions"
                    value={formData.preConditions}
                    onChange={(e) => handleChange('preConditions', e.target.value)}
                    placeholder="1. Logged in..."
                    className="min-h-[120px] bg-muted/30 focus:bg-background transition-all border-muted-foreground/20 focus:border-indigo-500/50"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="testData" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider group-focus-within:text-foreground transition-colors">Test Data</Label>
                  <Textarea
                    id="testData"
                    value={formData.testData}
                    onChange={(e) => handleChange('testData', e.target.value)}
                    placeholder="User: admin, Pass: 1234..."
                    className="min-h-[120px] font-mono text-sm bg-muted/30 focus:bg-background transition-all border-muted-foreground/20 focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="testSteps" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider group-focus-within:text-foreground transition-colors">Test Steps</Label>
                <Textarea
                  id="testSteps"
                  value={formData.testSteps}
                  onChange={(e) => handleChange('testSteps', e.target.value)}
                  placeholder="1. Click Login..."
                  className="min-h-[180px] bg-muted/30 focus:bg-background transition-all border-muted-foreground/20 focus:border-indigo-500/50"
                />
              </div>
            </div>

            {/* Expected vs Actual */}
            <div className="grid grid-cols-2 gap-6 p-6 rounded-xl border border-muted-foreground/10 bg-muted/5">
              <div className="space-y-2 group">
                <Label htmlFor="expectedResult" className="text-xs font-semibold uppercase text-indigo-600/80 tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Expected Result
                </Label>
                <Textarea
                  id="expectedResult"
                  value={formData.expectedResult}
                  onChange={(e) => handleChange('expectedResult', e.target.value)}
                  className="min-h-[100px] border-indigo-200/50 focus:border-indigo-500/50 bg-indigo-50/5 dark:bg-indigo-900/10"
                  required
                />
              </div>
              <div className="space-y-2 group">
                <Label htmlFor="actualResult" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Actual Result (If Executed)</Label>
                <Textarea
                  id="actualResult"
                  value={formData.actualResult}
                  onChange={(e) => handleChange('actualResult', e.target.value)}
                  className="min-h-[100px] bg-muted/30 border-muted-foreground/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Comments</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => handleChange('comments', e.target.value)}
                className="h-20 bg-muted/30 border-muted-foreground/20"
              />
            </div>
          </div>

          {/* Sidebar - Right */}
          <div className="w-[300px] bg-muted/10 border-l border-muted-foreground/10 p-6 space-y-8 flex flex-col">

            {/* Status */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-primary rounded-full" />
                Status
              </h4>
              <div className="rounded-lg border bg-card/50 p-4 shadow-sm space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-[10px] uppercase font-bold text-muted-foreground">Execution Status</Label>
                  <Select value={formData.status} onValueChange={(value: TestCase['status']) => handleChange('status', value)}>
                    <SelectTrigger className="w-full bg-background border-muted-foreground/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Executed">Not Executed</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Pass">Pass</SelectItem>
                      <SelectItem value="Fail">Fail</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Module */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-orange-500 rounded-full" />
                Classification
              </h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="module" className="text-[10px] uppercase font-bold text-muted-foreground">Module</Label>
                  <Input
                    id="module"
                    value={formData.module}
                    onChange={(e) => handleChange('module', e.target.value)}
                    className="bg-background border-muted-foreground/20"
                  />
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 space-y-3">
              <Button type="button" variant="outline" onClick={onCancel} className="w-full hover:bg-destructive/10 hover:text-destructive">
                Cancel
              </Button>
              <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20">
                {testCase ? 'Update' : 'Save'} Test Case
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}