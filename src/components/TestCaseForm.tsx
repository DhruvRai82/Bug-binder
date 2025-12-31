import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{testCase ? 'Edit Test Case' : 'Add New Test Case'}</DialogTitle>
          <div className="text-sm text-muted-foreground pb-4">
            {testCase ? 'Update the details of the existing test case.' : 'Define the parameters and steps for the new test case.'}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="module">Module</Label>
              <Input
                id="module"
                value={formData.module}
                onChange={(e) => handleChange('module', e.target.value)}
                placeholder="e.g., Login, Dashboard, etc."
                required
              />
            </div>
            <div>
              <Label htmlFor="testCaseId">Test Case ID</Label>
              <Input
                id="testCaseId"
                value={formData.testCaseId}
                onChange={(e) => handleChange('testCaseId', e.target.value)}
                placeholder="e.g., TC001, TC002, etc."
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="testScenario">Test Scenario</Label>
            <Input
              id="testScenario"
              value={formData.testScenario}
              onChange={(e) => handleChange('testScenario', e.target.value)}
              placeholder="Brief scenario description"
              required
            />
          </div>

          <div>
            <Label htmlFor="testCaseDescription">Test Case Description</Label>
            <Textarea
              id="testCaseDescription"
              value={formData.testCaseDescription}
              onChange={(e) => handleChange('testCaseDescription', e.target.value)}
              placeholder="Detailed description of what this test case covers"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="preConditions">Pre-Conditions</Label>
            <Textarea
              id="preConditions"
              value={formData.preConditions}
              onChange={(e) => handleChange('preConditions', e.target.value)}
              placeholder="List conditions here (e.g. 1. User is logged in)"
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="testSteps">Test Steps</Label>
            <Textarea
              id="testSteps"
              value={formData.testSteps}
              onChange={(e) => handleChange('testSteps', e.target.value)}
              placeholder="List steps here (e.g. 1. Click Login)"
              className="min-h-[200px]"
            />
          </div>

          <div>
            <Label htmlFor="testData">Test Data</Label>
            <Textarea
              id="testData"
              value={formData.testData}
              onChange={(e) => handleChange('testData', e.target.value)}
              placeholder="Data required for testing (usernames, inputs, etc.)"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="expectedResult">Expected Result</Label>
            <Textarea
              id="expectedResult"
              value={formData.expectedResult}
              onChange={(e) => handleChange('expectedResult', e.target.value)}
              placeholder="What should happen when the test is executed"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="actualResult">Actual Result</Label>
            <Textarea
              id="actualResult"
              value={formData.actualResult}
              onChange={(e) => handleChange('actualResult', e.target.value)}
              placeholder="What actually happened during test execution"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: TestCase['status']) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Executed">Not Executed</SelectItem>
                  <SelectItem value="Pass">Pass</SelectItem>
                  <SelectItem value="Fail">Fail</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="comments">Comments/Remarks</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => handleChange('comments', e.target.value)}
              placeholder="Additional notes or remarks"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {testCase ? 'Update' : 'Add'} Test Case
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}