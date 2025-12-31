import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Bug, TestCase } from '@/types';


interface BugFormProps {
  bug?: Bug | null;
  initialData?: Partial<Bug> | null;
  testCases: TestCase[];
  onSubmit: (data: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function BugForm({ bug, initialData, testCases, onSubmit, onCancel }: BugFormProps) {
  const [formData, setFormData] = useState<Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>>({
    bugId: '',
    title: '',
    description: '',
    severity: 'Medium',
    priority: 'P3',
    status: 'Open',
    assignee: '',
    reporter: '',
    module: '',
    environment: '',
    stepsToReproduce: '',
    expectedResult: '',
    actualResult: '',
    comments: '',
    linkedTestCaseId: ''
  });

  useEffect(() => {
    if (bug) {
      setFormData({
        bugId: bug.bugId,
        title: bug.title,
        description: bug.description,
        severity: bug.severity,
        priority: bug.priority,
        status: bug.status,
        assignee: bug.assignee,
        reporter: bug.reporter,
        module: bug.module,
        environment: bug.environment,
        stepsToReproduce: bug.stepsToReproduce,
        expectedResult: bug.expectedResult,
        actualResult: bug.actualResult,
        comments: bug.comments,
        linkedTestCaseId: bug.linkedTestCaseId || ''
      });
    } else if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Ensure defaults are preserved if not in initialData
        bugId: `BUG-${Date.now().toString().slice(-6)}`
      }));
    } else {
      // Generate a temporary ID for new bugs
      setFormData(prev => ({
        ...prev,
        bugId: `BUG-${Date.now().toString().slice(-6)}`
      }));
    }
  }, [bug, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bug ? 'Edit Bug' : 'Report New Bug'}</DialogTitle>
          <DialogDescription className="pb-4">
            {bug ? 'Update the details of the existing bug report.' : 'Fill in the details below to report a new bug.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bugId">Bug ID</Label>
              <Input
                id="bugId"
                value={formData.bugId}
                onChange={(e) => handleChange('bugId', e.target.value)}
                placeholder="e.g., BUG-001"
                required
              />
            </div>
            <div>
              <Label htmlFor="module">Module</Label>
              <Input
                id="module"
                value={formData.module}
                onChange={(e) => handleChange('module', e.target.value)}
                placeholder="e.g., Auth, Dashboard"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Brief description of the bug"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed description of the bug"
              className="min-h-[150px]"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={formData.severity} onValueChange={(value: Bug['severity']) => handleChange('severity', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: Bug['priority']) => handleChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P1">P1</SelectItem>
                  <SelectItem value="P2">P2</SelectItem>
                  <SelectItem value="P3">P3</SelectItem>
                  <SelectItem value="P4">P4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Bug['status']) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="environment">Environment</Label>
              <Input
                id="environment"
                value={formData.environment}
                onChange={(e) => handleChange('environment', e.target.value)}
                placeholder="e.g., Production, Staging"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) => handleChange('assignee', e.target.value)}
                placeholder="Person assigned to fix the bug"
              />
            </div>
            <div>
              <Label htmlFor="reporter">Reporter</Label>
              <Input
                id="reporter"
                value={formData.reporter}
                onChange={(e) => handleChange('reporter', e.target.value)}
                placeholder="Person who reported the bug"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="linkedTestCase">Linked Test Case</Label>
            <Select
              value={formData.linkedTestCaseId || "none"}
              onValueChange={(value) => handleChange('linkedTestCaseId', value === "none" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a test case (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {testCases.map((tc) => (
                  <SelectItem key={tc.id} value={tc.id}>
                    {tc.testCaseId}: {tc.testScenario}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
            <Textarea
              id="stepsToReproduce"
              value={formData.stepsToReproduce}
              onChange={(e) => handleChange('stepsToReproduce', e.target.value)}
              placeholder="Step-by-step instructions to reproduce the bug"
              className="min-h-[200px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expectedResult">Expected Result</Label>
              <Textarea
                id="expectedResult"
                value={formData.expectedResult}
                onChange={(e) => handleChange('expectedResult', e.target.value)}
                placeholder="What should have happened"
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
                placeholder="What actually happened"
                rows={3}
                required
              />
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
              {bug ? 'Update' : 'Report'} Bug
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}