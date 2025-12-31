import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ImportDialogProps {
  type: 'testcases' | 'bugs';
  onImport: (data: any[]) => void;
}

export function ImportDialog({ type, onImport }: ImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Invalid file type",
        description: "Please select an Excel file (.xlsx or .xls)",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

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
        return;
      }

      // Validate and transform data based on type
      const transformedData = transformImportData(jsonData, type);

      if (transformedData.length === 0) {
        toast({
          title: "Invalid data format",
          description: `The Excel file doesn't contain valid ${type} data`,
          variant: "destructive"
        });
        return;
      }

      onImport(transformedData);
      setIsOpen(false);

      toast({
        title: "Import successful",
        description: `Imported ${transformedData.length} ${type} successfully`
      });

    } catch (error) {
      console.error('Error importing file:', error);
      toast({
        title: "Import failed",
        description: "Failed to process the Excel file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const transformImportData = (data: any[], type: 'testcases' | 'bugs') => {
    if (type === 'testcases') {
      return data.map((row, index) => {
        // Map Excel columns to test case fields
        return {
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
        };
      }).filter(item => {
        // Filter out rows that are effectively empty (only have generated/default values)
        // We check if any of the user-provided fields have content
        return item.module || item.testScenario || item.testCaseDescription ||
          item.preConditions || item.testSteps || item.testData ||
          item.expectedResult || item.actualResult || item.comments;
      });
    } else {
      return data.map((row, index) => {
        // Map Excel columns to bug fields
        return {
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
        };
      }).filter(item => {
        // Filter out rows that are effectively empty
        return item.title || item.description || item.module ||
          item.stepsToReproduce || item.expectedBehavior || item.actualBehavior;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import from Excel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import {type === 'testcases' ? 'Test Cases' : 'Bugs'} from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file to import {type === 'testcases' ? 'test cases' : 'bugs'}.
            The file should contain columns matching the export format.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-sm font-medium">Choose Excel file</div>
                <div className="text-xs text-muted-foreground">
                  Supports .xlsx and .xls files
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Select File'}
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Expected columns for {type === 'testcases' ? 'Test Cases' : 'Bugs'}:</strong></p>
            {type === 'testcases' ? (
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>Module, Test Case ID, Test Scenario, Test Case Description</li>
                <li>Pre-conditions, Test Steps, Test Data, Expected Result</li>
                <li>Actual Result, Status, Comments</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>Bug ID, Title, Description, Module, Severity, Priority</li>
                <li>Status, Steps to Reproduce, Expected Behavior, Actual Behavior</li>
                <li>Reporter, Assignee, Environment, Attachments</li>
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}