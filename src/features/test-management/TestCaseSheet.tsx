import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Download, CheckCircle, XCircle, AlertCircle, Sparkles, Loader2, ArrowLeft, X, CheckCircle2, AlertTriangle } from 'lucide-react';
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
  'Not Executed': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  'Pending': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
};

export function TestCaseSheet({ testCases, onTestCaseAdd, onBulkTestCaseAdd, onTestCaseUpdate, onTestCaseDelete, onBulkDelete, onBulkStatusUpdate, onExport, onImport }: TestCaseSheetProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [testCaseToDelete, setTestCaseToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // AI Generation State
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiDialogStep, setAiDialogStep] = useState<'input' | 'preview' | 'summary'>('input');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTestCases, setGeneratedTestCases] = useState<any[]>([]);
  const [showAllPreview, setShowAllPreview] = useState(false);
  const [initialFormData, setInitialFormData] = useState<Partial<TestCase> | null>(null);
  const { toast } = useToast();

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const payload = { prompt: aiPrompt };
      console.log("--> FRONTEND: Sending AI Bulk Request:", payload);

      const response = await api.post('/api/ai/generate-bulk-test-cases', payload);
      console.log("--> FRONTEND: Received AI Bulk Response:", response);

      const testCases = response as unknown as TestCase[];

      if (Array.isArray(testCases) && testCases.length > 0) {
        setGeneratedTestCases(testCases);
        setAiDialogStep('preview'); // Show preview, DON'T add yet!
      } else if (!Array.isArray(testCases)) {
        // Single test case
        setGeneratedTestCases([response as any]);
        setAiDialogStep('preview');
      } else {
        toast({
          title: "No test cases generated",
          description: "Please try a different prompt.",
          variant: "destructive"
        });
      }
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

  const handleConfirmAddTestCases = () => {
    if (generatedTestCases.length > 0) {
      onBulkTestCaseAdd(generatedTestCases);
      setAiDialogStep('summary');
    }
  };

  const handleCancelAI = () => {
    setAiDialogStep('input');
    setGeneratedTestCases([]);
    setShowAllPreview(false);
  };

  const handleCloseAI = () => {
    setShowAiDialog(false);
    setTimeout(() => {
      setAiDialogStep('input');
      setAiPrompt('');
      setGeneratedTestCases([]);
      setShowAllPreview(false);
    }, 300);
  };

  const handleGenerateAnother = () => {
    setAiDialogStep('input');
    setAiPrompt('');
    setGeneratedTestCases([]);
    setShowAllPreview(false);
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

  const handleQuickStatusUpdate = (testCaseId: string, status: 'Pass' | 'Fail' | 'Blocked' | 'Not Executed' | 'Pending') => {
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 bg-card/95 backdrop-blur-xl shadow-2xl" onInteractOutside={(e) => e.preventDefault()}>
            {aiDialogStep === 'input' && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                    <div className="p-2 bg-indigo-500/10 rounded-md">
                      <Sparkles className="h-6 w-6 text-indigo-600" />
                    </div>
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Generate Test Suite with AI
                    </span>
                  </DialogTitle>
                  <DialogDescription>
                    Describe the module or feature flow in detail. The AI will generate comprehensive test scenarios.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2 group">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground group-focus-within:text-indigo-600 transition-colors">Detailed Flow Description</Label>
                    <Textarea
                      placeholder="e.g. User navigates to checkout, enters shipping info. If address is invalid, show error. If card is declined, show alert. If successful, redirect to confirmation..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={8}
                      className="bg-background/50 border-input/50 focus:border-indigo-500 transition-all font-mono text-xs resize-none"
                    />
                    <p className="text-[10px] text-muted-foreground bg-muted/50 p-2 rounded border">
                      <strong>Tip:</strong> Provide as much detail as possible. The AI will try to generate 20+ scenarios including edge cases.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseAI}>Cancel</Button>
                  <Button onClick={handleGenerateWithAI} disabled={!aiPrompt.trim() || isGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Suite...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Test Suite
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}

            {aiDialogStep === 'preview' && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    👀 Preview Generated Test Cases
                  </DialogTitle>
                  <DialogDescription>
                    Review the AI-generated test cases before adding them to your suite.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Statistics */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">📊 Generation Statistics</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <Card className="p-4 text-center bg-green-50 dark:bg-green-950">
                        <div className="text-2xl font-bold text-green-600">{generatedTestCases.length}</div>
                        <div className="text-xs text-muted-foreground">Test Cases</div>
                      </Card>
                      <Card className="p-4 text-center bg-blue-50 dark:bg-blue-950">
                        <div className="text-2xl font-bold text-blue-600">
                          {generatedTestCases.filter(tc => tc.status === 'Pending').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                      </Card>
                      <Card className="p-4 text-center bg-purple-50 dark:bg-purple-950">
                        <div className="text-2xl font-bold text-purple-600">
                          {new Set(generatedTestCases.map(tc => tc.module)).size}
                        </div>
                        <div className="text-xs text-muted-foreground">Modules</div>
                      </Card>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">
                      📋 Test Cases Preview (Showing {showAllPreview ? generatedTestCases.length : Math.min(5, generatedTestCases.length)} of {generatedTestCases.length})
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Test ID</TableHead>
                            <TableHead className="w-[120px]">Module</TableHead>
                            <TableHead>Scenario</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(showAllPreview ? generatedTestCases : generatedTestCases.slice(0, 5)).map((testCase, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-xs">{testCase.testCaseId}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">{testCase.module}</Badge>
                              </TableCell>
                              <TableCell className="max-w-[400px]">
                                <div className="whitespace-normal break-words text-sm">
                                  {testCase.testScenario}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("text-xs", statusColors[testCase.status as keyof typeof statusColors] || statusColors['Not Executed'])}>
                                  {testCase.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {!showAllPreview && generatedTestCases.length > 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => setShowAllPreview(true)}
                      >
                        View All {generatedTestCases.length} Test Cases ↓
                      </Button>
                    )}
                  </div>

                  {/* Warning */}
                  <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold mb-1">Important</p>
                        <p className="text-muted-foreground">
                          This will add {generatedTestCases.length} test cases to your current page. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-between pt-4 border-t">
                    <Button variant="outline" onClick={handleCancelAI}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleCloseAI}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleConfirmAddTestCases} className="bg-indigo-600 hover:bg-indigo-700">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Add Test Cases
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {aiDialogStep === 'summary' && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Test Cases Added Successfully!
                  </DialogTitle>
                  <DialogDescription>
                    🎉 Successfully added {generatedTestCases.length} AI-generated test cases
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Final Statistics */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">📊 Summary</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="p-4 text-center bg-green-50 dark:bg-green-950">
                        <div className="text-2xl font-bold text-green-600">{generatedTestCases.length}</div>
                        <div className="text-xs text-muted-foreground">Test Cases Added</div>
                      </Card>
                      <Card className="p-4 text-center bg-purple-50 dark:bg-purple-950">
                        <div className="text-2xl font-bold text-purple-600">
                          {new Set(generatedTestCases.map(tc => tc.module)).size}
                        </div>
                        <div className="text-xs text-muted-foreground">Modules Covered</div>
                      </Card>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold mb-2">💡 Next Steps</h4>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• View test cases in the table below</li>
                      <li>• Edit test cases if needed</li>
                      <li>• Generate more test cases for other modules</li>
                    </ul>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button variant="outline" onClick={handleGenerateAnother}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate More
                    </Button>
                    <Button onClick={handleCloseAI}>
                      Close & View Table
                    </Button>
                  </div>
                </div>
              </>
            )}
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
                  <SelectItem value="Pending">Pending</SelectItem>
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
              <TableHead className="w-32">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 border-0 bg-transparent hover:bg-accent focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Pass">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Pass
                      </div>
                    </SelectItem>
                    <SelectItem value="Fail">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Fail
                      </div>
                    </SelectItem>
                    <SelectItem value="Blocked">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Blocked
                      </div>
                    </SelectItem>
                    <SelectItem value="Not Executed">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                        Not Executed
                      </div>
                    </SelectItem>
                    <SelectItem value="Pending">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        Pending
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className="w-64">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testCases
              .filter(testCase => {
                if (statusFilter === 'all') return true;
                return testCase.status === statusFilter;
              })
              .map((testCase) => (
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
                  <TableCell className="min-w-[300px] whitespace-pre-wrap align-top" title={testCase.testScenario}>{testCase.testScenario}</TableCell>
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
        verificationText="delete"
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