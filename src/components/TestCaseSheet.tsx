import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Download, CheckCircle, XCircle, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { TestCase } from '@/types';
import { TestCaseForm } from './TestCaseForm';
import { ImportDialog } from './ImportDialog';
import { cn } from '@/lib/utils';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

interface TestCaseSheetProps {
  testCases: TestCase[];
  onTestCaseAdd: (testCase: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onBulkTestCaseAdd: (testCases: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  onTestCaseUpdate: (id: string, testCase: Partial<TestCase>) => void;
  onTestCaseDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkStatusUpdate: (ids: string[], status: string) => void;
  onExport: () => void;
  onImport: (testCases: any[]) => void;
}

const statusColors = {
  'Pass': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Fail': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Blocked': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Not Executed': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

export function TestCaseSheet({ testCases, onTestCaseAdd, onBulkTestCaseAdd, onTestCaseUpdate, onTestCaseDelete, onBulkDelete, onBulkStatusUpdate, onExport, onImport }: TestCaseSheetProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [testCaseToDelete, setTestCaseToDelete] = useState<string | null>(null);

  // AI Generation State
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [initialFormData, setInitialFormData] = useState<Partial<TestCase> | null>(null);
  const { toast } = useToast();

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      // Use the new bulk endpoint
      const payload = { prompt: aiPrompt };
      console.log("--> FRONTEND: Sending AI Bulk Request:", payload);

      const response = await api.post('/api/ai/generate-bulk-test-cases', payload);
      console.log("--> FRONTEND: Received AI Bulk Response:", response);


      const generatedTestCases = response as unknown as TestCase[]; // Expecting array

      if (Array.isArray(generatedTestCases)) {
        // Bulk Add via single prop call to prevent race conditions
        onBulkTestCaseAdd(generatedTestCases);

        toast({
          title: "Test Suite Generated",
          description: `Successfully added ${generatedTestCases.length} test cases.`,
        });
      } else {
        // Fallback if single object returned (backward compatibility)
        onTestCaseAdd(response as any);
        toast({
          title: "Test Case Generated",
          description: "Added 1 test case.",
        });
      }

      setShowAiDialog(false);
      setAiPrompt('');
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate test suite. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setShowForm(true);
  };

  const handleFormSubmit = (data: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTestCase) {
      onTestCaseUpdate(editingTestCase.id, data);
    } else {
      onTestCaseAdd(data);
    }
    setShowForm(false);
    setEditingTestCase(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTestCase(null);
    setInitialFormData(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTestCases(new Set(testCases.map(tc => tc.id)));
    } else {
      setSelectedTestCases(new Set());
    }
  };

  const handleSelectTestCase = (testCaseId: string, checked: boolean) => {
    const newSelection = new Set(selectedTestCases);
    if (checked) {
      newSelection.add(testCaseId);
    } else {
      newSelection.delete(testCaseId);
    }
    setSelectedTestCases(newSelection);
  };

  const handleBulkDelete = () => {
    if (selectedTestCases.size > 0) {
      setShowDeleteDialog(true);
    }
  };

  const confirmBulkDelete = () => {
    onBulkDelete(Array.from(selectedTestCases));
    setSelectedTestCases(new Set());
    setShowDeleteDialog(false);
  };

  const handleBulkStatusUpdate = () => {
    if (selectedTestCases.size > 0 && bulkStatus) {
      onBulkStatusUpdate(Array.from(selectedTestCases), bulkStatus);
      setSelectedTestCases(new Set());
      setBulkStatus('');
    }
  };

  const handleQuickStatusUpdate = (testCaseId: string, status: 'Pass' | 'Fail' | 'Blocked' | 'Not Executed') => {
    onTestCaseUpdate(testCaseId, { status });
  };

  const isAllSelected = testCases.length > 0 && selectedTestCases.size === testCases.length;
  const isPartiallySelected = selectedTestCases.size > 0 && selectedTestCases.size < testCases.length;

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-4 p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Test Cases</h3>
          <div className="flex gap-2">
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <ImportDialog type="testcases" onImport={onImport} />
            <Button
              onClick={() => setShowAiDialog(true)}
              variant="secondary"
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800"
              size="sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
            <Button onClick={() => { setEditingTestCase(null); setShowForm(true); }} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Test Case
            </Button>
          </div>
        </div>

        {/* AI Generation Dialog */}
        <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Generate Test Suite with AI
              </DialogTitle>
              <DialogDescription>
                Describe the module or feature flow in detail (e.g., "Registration flow with email validation, password rules, and error states").
                The AI will generate a comprehensive list of test cases (Positive, Negative, Edge).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Detailed Flow Description</Label>
                <Textarea
                  placeholder="e.g. User navigates to checkout, enters shipping info. If address is invalid, show error. If card is declined, show alert. If successful, redirect to confirmation..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">
                  Provide as much detail as possible. The AI will try to generate 20+ scenarios including edge cases.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAiDialog(false)}>Cancel</Button>
              <Button onClick={handleGenerateWithAI} disabled={!aiPrompt.trim() || isGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Suite (this may take a minute)...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Comprehensive Suite
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Bulk Actions */}
        {selectedTestCases.size > 0 && (
          <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg border">
            <span className="text-sm font-medium">
              {selectedTestCases.size} selected
            </span>
            <div className="flex items-center gap-2">
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pass">Pass</SelectItem>
                  <SelectItem value="Fail">Fail</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Not Executed">Not Executed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkStatusUpdate} disabled={!bulkStatus} size="sm">
                Update Status
              </Button>
              <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        )
        }
      </div>

      <div className="flex-1 overflow-auto bg-background dark:bg-background rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-secondary/90 dark:bg-secondary/90 backdrop-blur supports-[backdrop-filter]:bg-secondary/50 z-10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el && 'indeterminate' in el) {
                      (el as any).indeterminate = isPartiallySelected;
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-32">Quick Actions</TableHead>
              <TableHead className="w-32">Module</TableHead>
              <TableHead className="w-32">Test Case ID</TableHead>
              <TableHead className="w-48">Test Scenario</TableHead>
              <TableHead className="w-64">Description</TableHead>
              <TableHead className="w-48">Pre-Conditions</TableHead>
              <TableHead className="w-64">Test Steps</TableHead>
              <TableHead className="w-48">Test Data</TableHead>
              <TableHead className="w-48">Expected Result</TableHead>
              <TableHead className="w-48">Actual Result</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-64">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testCases.map((testCase) => (
              <TableRow key={testCase.id} className="hover:bg-muted/50 data-[state=selected]:bg-muted dark:hover:bg-muted/10 dark:data-[state=selected]:bg-muted/20">
                <TableCell>
                  <Checkbox
                    checked={selectedTestCases.has(testCase.id)}
                    onCheckedChange={(checked) => handleSelectTestCase(testCase.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickStatusUpdate(testCase.id, 'Pass')}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                      title="Mark as Pass"
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickStatusUpdate(testCase.id, 'Fail')}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      title="Mark as Fail"
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickStatusUpdate(testCase.id, 'Blocked')}
                      className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700"
                      title="Mark as Blocked"
                    >
                      <AlertCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(testCase)}
                      className="h-8 w-8 p-0"
                      title="Edit"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTestCaseToDelete(testCase.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{testCase.module}</TableCell>
                <TableCell className="font-mono text-sm">{testCase.testCaseId}</TableCell>
                <TableCell>{testCase.testScenario}</TableCell>
                <TableCell className="min-w-[300px] whitespace-pre-wrap align-top" title={testCase.testCaseDescription}>
                  {testCase.testCaseDescription}
                </TableCell>
                <TableCell className="min-w-[200px] whitespace-pre-wrap align-top" title={testCase.preConditions}>
                  {testCase.preConditions}
                </TableCell>
                <TableCell className="min-w-[300px] whitespace-pre-wrap align-top" title={testCase.testSteps}>
                  {testCase.testSteps}
                </TableCell>
                <TableCell className="min-w-[200px] whitespace-pre-wrap align-top" title={testCase.testData}>
                  {testCase.testData}
                </TableCell>
                <TableCell className="min-w-[200px] whitespace-pre-wrap align-top" title={testCase.expectedResult}>
                  {testCase.expectedResult}
                </TableCell>
                <TableCell className="min-w-[200px] whitespace-pre-wrap align-top" title={testCase.actualResult}>
                  {testCase.actualResult}
                </TableCell>
                <TableCell>
                  <Badge className={cn("text-xs", statusColors[testCase.status])}>
                    {testCase.status}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-[200px] whitespace-pre-wrap align-top" title={testCase.comments}>
                  {testCase.comments}
                </TableCell>
              </TableRow>
            ))}
            {testCases.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                  No test cases added yet. Click "Add Test Case" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {
        showForm && (
          <TestCaseForm
            testCase={editingTestCase}
            initialData={initialFormData}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )
      }

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmBulkDelete}
        title="Delete Test Cases"
        description={`Are you sure you want to delete ${selectedTestCases.size} test case(s)? This action cannot be undone.`}
        confirmText="Delete Test Cases"
      />

      <AlertDialog open={!!testCaseToDelete} onOpenChange={(open) => !open && setTestCaseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the test case from your project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (testCaseToDelete) {
                  onTestCaseDelete(testCaseToDelete);
                  setTestCaseToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}