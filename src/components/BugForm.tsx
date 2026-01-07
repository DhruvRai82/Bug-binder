import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Bug as BugIcon, X } from 'lucide-react';
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
      <DialogContent
        className="max-w-6xl max-h-[95vh] h-[800px] flex flex-col border-0 bg-card/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 border-b bg-muted/20 backdrop-blur-md flex flex-row items-center justify-between sticky top-0 z-10 space-y-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl shadow-inner ${bug ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
              {bug ? <BugIcon className="h-6 w-6 text-blue-600" /> : <BugIcon className="h-6 w-6 text-red-600" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {bug ? 'Edit Bug Report' : 'Report New Bug'}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                {bug ? 'Update the details of the existing bug report.' : 'Provides detailed information to help track and fix issues.'}
              </DialogDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex overflow-hidden">
          {/* Main Content Area - Left Column */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            {/* Title Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-1">
                  <Label htmlFor="bugId" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 block">Bug ID</Label>
                  <Input
                    id="bugId"
                    value={formData.bugId}
                    onChange={(e) => handleChange('bugId', e.target.value)}
                    placeholder="BUG-001"
                    className="font-mono bg-muted/30 focus:bg-background transition-all border-muted-foreground/20"
                    required
                  />
                </div>
                <div className="col-span-5">
                  <Label htmlFor="title" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 block">Summary / Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Brief description of the issue..."
                    className="text-lg font-medium bg-muted/30 focus:bg-background transition-all border-muted-foreground/20"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description & Steps */}
            <div className="space-y-6">
              <div className="space-y-2 group">
                <Label htmlFor="description" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider group-focus-within:text-foreground transition-colors">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Detailed explanation of the bug..."
                  className="min-h-[120px] resize-y bg-muted/30 focus:bg-background transition-all border-muted-foreground/20 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="stepsToReproduce" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider group-focus-within:text-foreground transition-colors">Steps to Reproduce</Label>
                <Textarea
                  id="stepsToReproduce"
                  value={formData.stepsToReproduce}
                  onChange={(e) => handleChange('stepsToReproduce', e.target.value)}
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe that..."
                  className="min-h-[150px] font-mono text-sm bg-muted/30 focus:bg-background transition-all border-muted-foreground/20 focus:border-primary/50"
                />
              </div>
            </div>

            {/* Results Comparison */}
            <div className="grid grid-cols-2 gap-6 p-6 rounded-xl border border-muted-foreground/10 bg-muted/5">
              <div className="space-y-2 group">
                <Label htmlFor="expectedResult" className="text-xs font-semibold uppercase text-green-600/80 tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Expected Result
                </Label>
                <Textarea
                  id="expectedResult"
                  value={formData.expectedResult}
                  onChange={(e) => handleChange('expectedResult', e.target.value)}
                  className="min-h-[100px] border-green-200/50 focus:border-green-500/50 bg-green-50/5 dark:bg-green-900/10"
                  required
                />
              </div>
              <div className="space-y-2 group">
                <Label htmlFor="actualResult" className="text-xs font-semibold uppercase text-red-600/80 tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Actual Result
                </Label>
                <Textarea
                  id="actualResult"
                  value={formData.actualResult}
                  onChange={(e) => handleChange('actualResult', e.target.value)}
                  className="min-h-[100px] border-red-200/50 focus:border-red-500/50 bg-red-50/5 dark:bg-red-900/10"
                  required
                />
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Additional Comments</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => handleChange('comments', e.target.value)}
                className="h-20 bg-muted/30 border-muted-foreground/20"
              />
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="w-[320px] bg-muted/10 border-l border-muted-foreground/10 p-6 space-y-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            {/* Status Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-primary rounded-full" />
                Status & Core Info
              </h4>

              <div className="space-y-4 rounded-lg border bg-card/50 p-4 shadow-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-[10px] uppercase font-bold text-muted-foreground">Status</Label>
                  <Select value={formData.status} onValueChange={(value: Bug['status']) => handleChange('status', value)}>
                    <SelectTrigger className="w-full bg-background border-muted-foreground/20 h-9">
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="severity" className="text-[10px] uppercase font-bold text-muted-foreground">Severity</Label>
                    <Select value={formData.severity} onValueChange={(value: Bug['severity']) => handleChange('severity', value)}>
                      <SelectTrigger className="w-full bg-background border-muted-foreground/20 h-9">
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
                  <div className="space-y-1.5">
                    <Label htmlFor="priority" className="text-[10px] uppercase font-bold text-muted-foreground">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: Bug['priority']) => handleChange('priority', value)}>
                      <SelectTrigger className="w-full bg-background border-muted-foreground/20 h-9">
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
                </div>
              </div>
            </div>

            {/* Classification */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-orange-500 rounded-full" />
                Context
              </h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="module" className="text-[10px] uppercase font-bold text-muted-foreground">Module</Label>
                  <Input
                    id="module"
                    value={formData.module}
                    onChange={(e) => handleChange('module', e.target.value)}
                    className="h-9 bg-background border-muted-foreground/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="environment" className="text-[10px] uppercase font-bold text-muted-foreground">Environment</Label>
                  <Input
                    id="environment"
                    value={formData.environment}
                    onChange={(e) => handleChange('environment', e.target.value)}
                    className="h-9 bg-background border-muted-foreground/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="linkedTestCase" className="text-[10px] uppercase font-bold text-muted-foreground">Linked Test Case</Label>
                  <Select
                    value={formData.linkedTestCaseId || "none"}
                    onValueChange={(value) => handleChange('linkedTestCaseId', value === "none" ? "" : value)}
                  >
                    <SelectTrigger className="h-9 bg-background border-muted-foreground/20">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {testCases.map((tc) => (
                        <SelectItem key={tc.id} value={tc.id}>
                          {tc.testCaseId}: {tc.testScenario.substring(0, 20)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* People */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <div className="h-1 w-4 bg-purple-500 rounded-full" />
                People
              </h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="assignee" className="text-[10px] uppercase font-bold text-muted-foreground">Assignee</Label>
                  <Input
                    id="assignee"
                    value={formData.assignee}
                    onChange={(e) => handleChange('assignee', e.target.value)}
                    className="h-9 bg-background border-muted-foreground/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reporter" className="text-[10px] uppercase font-bold text-muted-foreground">Reporter</Label>
                  <Input
                    id="reporter"
                    value={formData.reporter}
                    onChange={(e) => handleChange('reporter', e.target.value)}
                    className="h-9 bg-background border-muted-foreground/20"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 mt-auto">
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" onClick={onCancel} className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all">
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg shadow-red-500/20 text-white font-semibold">
                  {bug ? 'Update' : 'Submit'}
                </Button>
              </div>
            </div>

          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}