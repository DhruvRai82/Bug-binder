import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowLeft, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface ImportDialogProps {
  type: 'testcases' | 'bugs';
  onImport: (data: any[]) => void;
}

interface ImportSummary {
  total: number;
  imported: number;
  skipped: number;
  statusBreakdown: Record<string, number>;
  preview: any[];
}

type DialogStep = 'select' | 'preview' | 'summary';

export function ImportDialog({ type, onImport }: ImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<DialogStep>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<{
    data: any[];
    summary: ImportSummary;
  } | null>(null);
  const [showAllPreview, setShowAllPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const calculateStatusBreakdown = (data: any[]) => {
    const breakdown: Record<string, number> = {};
    data.forEach(item => {
      const status = item.status || 'Not Executed';
      breakdown[status] = (breakdown[status] || 0) + 1;
    });
    return breakdown;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setSelectedFile(file);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast({
          title: "Empty file",
          description: "The Excel file appears to be empty",
          variant: "destructive"
        });
        setStep('select');
        return;
      }

      const transformedData = transformImportData(jsonData, type);

      if (transformedData.length === 0) {
        toast({
          title: "Invalid data format",
          description: `The Excel file doesn't contain valid ${type} data`,
          variant: "destructive"
        });
        setStep('select');
        return;
      }

      const summary: ImportSummary = {
        total: jsonData.length,
        imported: transformedData.length,
        skipped: jsonData.length - transformedData.length,
        statusBreakdown: type === 'testcases' ? calculateStatusBreakdown(transformedData) : {},
        preview: transformedData
      };

      setPreviewData({ data: transformedData, summary });
      setStep('preview');

    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Processing failed",
        description: "Failed to process the Excel file",
        variant: "destructive"
      });
      setStep('select');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Invalid file type",
        description: "Please select an Excel file (.xlsx or .xls)",
        variant: "destructive"
      });
      return;
    }
    processFile(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleConfirmImport = () => {
    if (previewData) {
      onImport(previewData.data);
      setStep('summary');
    }
  };

  const handleCancel = () => {
    setStep('select');
    setPreviewData(null);
    setSelectedFile(null);
    setShowAllPreview(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep('select');
      setPreviewData(null);
      setSelectedFile(null);
      setShowAllPreview(false);
    }, 300);
  };

  const handleImportAnother = () => {
    setStep('select');
    setPreviewData(null);
    setSelectedFile(null);
    setShowAllPreview(false);
  };

  const transformImportData = (data: any[], type: 'testcases' | 'bugs') => {
    if (type === 'testcases') {
      return data.map((row, index) => ({
        module: row['Module'] || row['module'] || '',
        testCaseId: row['Test Case ID'] || row['testCaseId'] || row['Test ID'] || `TC-${Date.now()}-${index}`,
        testScenario: row['Test Scenario'] || row['testScenario'] || row['Scenario'] || '',
        testCaseDescription: row['Test Case Description'] || row['testCaseDescription'] || row['Description'] || '',
        preConditions: row['Pre-conditions'] || row['preConditions'] || row['Prerequisites'] || '',
        testSteps: row['Test Steps'] || row['testSteps'] || row['Steps'] || '',
        testData: row['Test Data'] || row['testData'] || row['Data'] || '',
        expectedResult: row['Expected Result'] || row['expectedResult'] || row['Expected'] || '',
        actualResult: row['Actual Result'] || row['actualResult'] || row['Actual'] || '',
        status: row['Status'] || row['status'] || 'Not Executed',
        comments: row['Comments'] || row['comments'] || row['Notes'] || ''
      })).filter(item =>
        item.module || item.testScenario || item.testCaseDescription ||
        item.preConditions || item.testSteps || item.testData ||
        item.expectedResult || item.actualResult || item.comments
      );
    } else {
      return data.map((row, index) => ({
        bugId: row['Bug ID'] || row['bugId'] || row['ID'] || `BUG-${Date.now()}-${index}`,
        title: row['Title'] || row['title'] || row['Summary'] || '',
        description: row['Description'] || row['description'] || row['Details'] || '',
        module: row['Module'] || row['module'] || row['Component'] || '',
        severity: row['Severity'] || row['severity'] || 'Medium',
        priority: row['Priority'] || row['priority'] || 'Medium',
        status: row['Status'] || row['status'] || 'Open',
        stepsToReproduce: row['Steps to Reproduce'] || row['stepsToReproduce'] || row['Steps'] || '',
        expectedBehavior: row['Expected Behavior'] || row['expectedBehavior'] || row['Expected'] || '',
        actualBehavior: row['Actual Behavior'] || row['actualBehavior'] || row['Actual'] || '',
        attachments: row['Attachments'] || row['attachments'] || '',
        reporter: row['Reporter'] || row['reporter'] || 'Unknown',
        assignee: row['Assignee'] || row['assignee'] || 'Unassigned',
        environment: row['Environment'] || row['environment'] || 'Production'
      })).filter(item =>
        item.title || item.description || item.module ||
        item.stepsToReproduce || item.expectedBehavior || item.actualBehavior
      );
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pass': 'bg-green-500',
      'Fail': 'bg-red-500',
      'Blocked': 'bg-yellow-500',
      'Not Executed': 'bg-gray-500',
      'Pending': 'bg-blue-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const previewItems = showAllPreview
    ? (previewData?.summary.preview || [])
    : (previewData?.summary.preview?.slice(0, 5) || []);

  const successRate = previewData
    ? ((previewData.summary.imported / previewData.summary.total) * 100).toFixed(0)
    : '0';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import from Excel
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import {type === 'testcases' ? 'Test Cases' : 'Bugs'} from Excel
              </DialogTitle>
              <DialogDescription>
                Upload an Excel file to import {type === 'testcases' ? 'test cases' : 'bugs'}. You'll be able to preview before importing.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Drag and Drop Zone */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={cn(
                  "h-16 w-16 mx-auto mb-4 transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )} />
                <p className="text-lg font-medium mb-2">
                  {isDragging ? "Drop your file here" : "Drag & drop your Excel file here"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">or</p>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  {isProcessing ? 'Processing...' : 'Browse Files'}
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Supports .xlsx and .xls files
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>

              {/* Quick Tips */}
              <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  💡 Quick Tips
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Ensure your Excel has the required columns</li>
                  <li>• Empty rows will be automatically skipped</li>
                  <li>• You can preview and cancel before importing</li>
                </ul>
              </Card>

              {/* Required Columns */}
              <div>
                <h4 className="text-sm font-semibold mb-3">📋 Expected Columns</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {type === 'testcases' ? (
                    <>
                      <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> Module</div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> Test Case ID</div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> Test Scenario</div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> Description</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><div className="h-3 w-3 rounded-full border-2" /> Pre-conditions (optional)</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><div className="h-3 w-3 rounded-full border-2" /> Test Steps (optional)</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><div className="h-3 w-3 rounded-full border-2" /> Test Data (optional)</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><div className="h-3 w-3 rounded-full border-2" /> Expected Result (optional)</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><div className="h-3 w-3 rounded-full border-2" /> Status (optional)</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><div className="h-3 w-3 rounded-full border-2" /> Comments (optional)</div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> Bug ID</div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> Title</div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> Description</div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-600" /> Module</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><div className="h-3 w-3 rounded-full border-2" /> Severity (optional)</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><div className="h-3 w-3 rounded-full border-2" /> Priority (optional)</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 'preview' && previewData && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                👀 Preview Import Data
              </DialogTitle>
              <DialogDescription>
                Review the data before importing. You can cancel if something doesn't look right.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center gap-2 text-sm">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedFile?.name}</span>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-sm font-semibold mb-3">📊 Import Statistics</h3>
                <div className="grid grid-cols-4 gap-3">
                  <Card className="p-3 text-center">
                    <div className="text-xl font-bold">{previewData.summary.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </Card>
                  <Card className="p-3 text-center bg-green-50 dark:bg-green-950">
                    <div className="text-xl font-bold text-green-600">{previewData.summary.imported}</div>
                    <div className="text-xs text-muted-foreground">Valid</div>
                  </Card>
                  <Card className="p-3 text-center bg-orange-50 dark:bg-orange-950">
                    <div className="text-xl font-bold text-orange-600">{previewData.summary.skipped}</div>
                    <div className="text-xs text-muted-foreground">Skipped</div>
                  </Card>
                  <Card className="p-3 text-center bg-blue-50 dark:bg-blue-950">
                    <div className="text-xl font-bold text-blue-600">{successRate}%</div>
                    <div className="text-xs text-muted-foreground">Success</div>
                  </Card>
                </div>
              </div>

              {/* Status Distribution */}
              {type === 'testcases' && Object.keys(previewData.summary.statusBreakdown).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">📈 Status Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(previewData.summary.statusBreakdown).map(([status, count]) => {
                      const percentage = (count / previewData.summary.imported) * 100;
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", getStatusColor(status))} />
                              <span>{status}: {count}</span>
                            </div>
                            <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn("h-full transition-all", getStatusColor(status))}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Preview Table */}
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  📋 Data Preview (Showing {previewItems.length} of {previewData.summary.imported} items)
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">{type === 'testcases' ? 'Test ID' : 'Bug ID'}</TableHead>
                        <TableHead className="w-[120px]">Module</TableHead>
                        <TableHead>{type === 'testcases' ? 'Scenario' : 'Title'}</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">
                            {type === 'testcases' ? item.testCaseId : item.bugId}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{item.module}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate text-sm">
                            {type === 'testcases' ? item.testScenario : item.title}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", getStatusColor(item.status))} />
                              <span className="text-xs">{item.status}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {!showAllPreview && previewData.summary.imported > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setShowAllPreview(true)}
                  >
                    View All {previewData.summary.imported} Items ↓
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
                      This will add {previewData.summary.imported} {type === 'testcases' ? 'test cases' : 'bugs'} to your current page.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleCancel}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmImport}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirm Import
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 'summary' && previewData && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Import Successful!
              </DialogTitle>
              <DialogDescription>
                🎉 Successfully imported {previewData.summary.imported} {type === 'testcases' ? 'test cases' : 'bugs'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Final Statistics */}
              <div>
                <h3 className="text-sm font-semibold mb-3">📊 Final Statistics</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold">{previewData.summary.total}</div>
                    <div className="text-xs text-muted-foreground">Total Rows</div>
                  </Card>
                  <Card className="p-4 text-center bg-green-50 dark:bg-green-950">
                    <div className="text-2xl font-bold text-green-600">{previewData.summary.imported}</div>
                    <div className="text-xs text-muted-foreground">Imported</div>
                  </Card>
                  <Card className="p-4 text-center bg-orange-50 dark:bg-orange-950">
                    <div className="text-2xl font-bold text-orange-600">{previewData.summary.skipped}</div>
                    <div className="text-xs text-muted-foreground">Skipped</div>
                  </Card>
                </div>
              </div>

              {/* Status Breakdown with Progress Bars */}
              {type === 'testcases' && Object.keys(previewData.summary.statusBreakdown).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">📈 Status Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(previewData.summary.statusBreakdown).map(([status, count]) => {
                      const percentage = (count / previewData.summary.imported) * 100;
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", getStatusColor(status))} />
                              <span>{status}: {count}</span>
                            </div>
                            <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn("h-full transition-all", getStatusColor(status))}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold mb-2">💡 Next Steps</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• View imported {type === 'testcases' ? 'test cases' : 'bugs'} in the table below</li>
                  <li>• Use the Status filter to find specific items</li>
                  <li>• Import more files if needed</li>
                </ul>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={handleImportAnother}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Another File
                </Button>
                <Button onClick={handleClose}>
                  Close & View Table
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}