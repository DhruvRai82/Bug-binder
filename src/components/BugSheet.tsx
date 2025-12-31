import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Download, Play, CheckCircle, X, Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Bug, TestCase } from '@/types';
import { BugForm } from './BugForm';
import { ImportDialog } from './ImportDialog';
import { cn } from '@/lib/utils';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

interface BugSheetProps {
  bugs: Bug[];
  testCases: TestCase[];
  onBugAdd: (bug: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onBugUpdate: (id: string, bug: Partial<Bug>) => void;
  onBugDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkStatusUpdate: (ids: string[], status: string) => void;
  onExport: () => void;
  onImport: (bugs: Partial<Bug>[]) => void;
}

const statusColors = {
  'Open': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Closed': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  'Rejected': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
};

const severityColors = {
  'Critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Low': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
};

export function BugSheet({ bugs, testCases, onBugAdd, onBugUpdate, onBugDelete, onBulkDelete, onBulkStatusUpdate, onExport, onImport }: BugSheetProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingBug, setEditingBug] = useState<Bug | null>(null);
  const [selectedBugs, setSelectedBugs] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // AI Generation State
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [bugPrompt, setBugPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [initialFormData, setInitialFormData] = useState<Partial<Bug> | null>(null);
  const { toast } = useToast();

  const handleGenerateWithAI = async () => {
    if (!bugPrompt.trim()) return;

    setIsGenerating(true);
    setInitialFormData(null); // Clear previous data
    try {
      console.log("--> FRONTEND: User Input Prompt:", bugPrompt);
      console.log("--> FRONTEND: Sending Header:", { description: bugPrompt });

      // Use summarize-bug to generate title/summary from description
      // Cache buster included to prevent browser caching
      const response = await api.post(`/api/ai/summarize-bug?t=${Date.now()}`, { description: bugPrompt });

      console.log("--> FRONTEND: Received API Response:", response); // Keep this to verify payload return

      const generatedBug: Partial<Bug> = {
        title: response.title,
        description: bugPrompt, // Keep original user prompt as description
        stepsToReproduce: response.stepsToReproduce || bugPrompt,
        expectedResult: response.expectedResult,
        actualResult: response.actualResult,
        severity: response.severity,
        priority: response.priority,
        status: 'Open'
      };

      setShowAiDialog(false);
      setBugPrompt('');

      // Set as NEW draft
      setEditingBug(null);
      setInitialFormData(generatedBug);
      setShowForm(true);

      toast({
        title: "Bug Report Generated",
        description: "Review the filled bug report before saving.",
      });
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate bug report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (bug: Bug) => {
    setEditingBug(bug);
    setInitialFormData(null);
    setShowForm(true);
  };

  const handleFormSubmit = (data: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingBug) {
      onBugUpdate(editingBug.id, data);
    } else {
      onBugAdd(data);
    }
    setShowForm(false);
    setEditingBug(null);
    setInitialFormData(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingBug(null);
    setInitialFormData(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBugs(new Set(bugs.map(bug => bug.id)));
    } else {
      setSelectedBugs(new Set());
    }
  };

  const handleSelectBug = (bugId: string, checked: boolean) => {
    const newSelection = new Set(selectedBugs);
    if (checked) {
      newSelection.add(bugId);
    } else {
      newSelection.delete(bugId);
    }
    setSelectedBugs(newSelection);
  };

  const handleBulkDelete = () => {
    if (selectedBugs.size > 0) {
      setShowDeleteDialog(true);
    }
  };

  const confirmBulkDelete = () => {
    onBulkDelete(Array.from(selectedBugs));
    setSelectedBugs(new Set());
    setShowDeleteDialog(false);
  };

  const handleBulkStatusUpdate = () => {
    if (selectedBugs.size > 0 && bulkStatus) {
      onBulkStatusUpdate(Array.from(selectedBugs), bulkStatus);
      setSelectedBugs(new Set());
      setBulkStatus('');
    }
  };

  const handleQuickStatusUpdate = (bugId: string, status: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Rejected') => {
    onBugUpdate(bugId, { status });
  };

  const isAllSelected = bugs.length > 0 && selectedBugs.size === bugs.length;
  const isPartiallySelected = selectedBugs.size > 0 && selectedBugs.size < bugs.length;

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-4 p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Bug Tracking</h3>
          <div className="flex gap-2">
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <ImportDialog type="bugs" onImport={onImport} />
            <Button
              onClick={() => setShowAiDialog(true)}
              variant="secondary"
              className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
              size="sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
            <Button onClick={() => { setEditingBug(null); setInitialFormData(null); setShowForm(true); }} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Bug
            </Button>
          </div>
        </div>

        {selectedBugs.size > 0 && (
          <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg border">
            <span className="text-sm font-medium">
              {selectedBugs.size} selected
            </span>
            <div className="flex items-center gap-2">
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
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
        )}
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
                      (el as HTMLInputElement).indeterminate = isPartiallySelected;
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-32">Quick Actions</TableHead>
              <TableHead className="w-32">Bug ID</TableHead>
              <TableHead className="w-32">Linked TC</TableHead>
              <TableHead className="w-48">Title</TableHead>
              <TableHead className="w-32">Severity</TableHead>
              <TableHead className="w-24">Priority</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-32">Assignee</TableHead>
              <TableHead className="w-32">Reporter</TableHead>
              <TableHead className="w-32">Module</TableHead>
              <TableHead className="w-32">Environment</TableHead>
              <TableHead className="w-64">Description</TableHead>
              <TableHead className="w-64">Steps to Reproduce</TableHead>
              <TableHead className="w-48">Expected Result</TableHead>
              <TableHead className="w-48">Actual Result</TableHead>
              <TableHead className="w-64">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bugs.map((bug) => (
              <TableRow key={bug.id} className="hover:bg-muted/50 data-[state=selected]:bg-muted dark:hover:bg-muted/10 dark:data-[state=selected]:bg-muted/20">
                <TableCell>
                  <Checkbox
                    checked={selectedBugs.has(bug.id)}
                    onCheckedChange={(checked) => handleSelectBug(bug.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickStatusUpdate(bug.id, 'In Progress')}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                      title="Mark as In Progress"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickStatusUpdate(bug.id, 'Resolved')}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                      title="Mark as Resolved"
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickStatusUpdate(bug.id, 'Closed')}
                      className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                      title="Mark as Closed"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(bug)}
                      className="h-8 w-8 p-0"
                      title="Edit"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onBugDelete(bug.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{bug.bugId}</TableCell>
                <TableCell className="font-mono text-sm">
                  {bug.linkedTestCaseId ? (
                    <Badge variant="outline" className="font-normal">
                      {testCases.find(tc => tc.id === bug.linkedTestCaseId)?.testCaseId || 'Unknown'}
                    </Badge>
                  ) : '-'}
                </TableCell>
                <TableCell className="font-medium">{bug.title}</TableCell>
                <TableCell>
                  <Badge className={cn("text-xs", severityColors[bug.severity])}>
                    {bug.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {bug.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={cn("text-xs", statusColors[bug.status])}>
                    {bug.status}
                  </Badge>
                </TableCell>
                <TableCell>{bug.assignee}</TableCell>
                <TableCell>{bug.reporter}</TableCell>
                <TableCell>{bug.module}</TableCell>
                <TableCell>{bug.environment}</TableCell>
                <TableCell className="min-w-[300px] whitespace-pre-wrap align-top" title={bug.description}>
                  {bug.description}
                </TableCell>
                <TableCell className="min-w-[300px] whitespace-pre-wrap align-top" title={bug.stepsToReproduce}>
                  {bug.stepsToReproduce}
                </TableCell>
                <TableCell className="min-w-[200px] whitespace-pre-wrap align-top" title={bug.expectedResult}>
                  {bug.expectedResult}
                </TableCell>
                <TableCell className="min-w-[200px] whitespace-pre-wrap align-top" title={bug.actualResult}>
                  {bug.actualResult}
                </TableCell>
                <TableCell className="min-w-[200px] whitespace-pre-wrap align-top" title={bug.comments}>
                  {bug.comments}
                </TableCell>
              </TableRow>
            ))}
            {bugs.length === 0 && (
              <TableRow>
                <TableCell colSpan={17} className="text-center py-8 text-muted-foreground">
                  No bugs reported yet. Click "Add Bug" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showForm && (
        <BugForm
          bug={editingBug}
          initialData={initialFormData}
          testCases={testCases}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* AI Generation Dialog */}
      <Dialog open={showAiDialog} onOpenChange={(open) => {
        setShowAiDialog(open);
        if (!open) setBugPrompt(''); // Clear prompt on close
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Generate Bug Report with AI
            </DialogTitle>
            <DialogDescription>
              Paste the bug description, logs, or steps. The AI will format it into a structured bug report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Bug Description / Logs</Label>
              <Textarea
                placeholder="Paste error logs, steps, or description here..."
                value={bugPrompt}
                onChange={(e) => setBugPrompt(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAiDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateWithAI}
              disabled={!bugPrompt.trim() || isGenerating}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmBulkDelete}
        title="Delete Bugs"
        description={`Are you sure you want to delete ${selectedBugs.size} bug(s)? This action cannot be undone.`}
        confirmText="Delete Bugs"
      />
    </div>
  );
}