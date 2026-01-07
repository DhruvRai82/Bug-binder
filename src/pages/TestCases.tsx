import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, Edit2, X, Search, Eye, Table, Save, AlertTriangle } from 'lucide-react';
import { TestCaseSheet } from '@/components/TestCaseSheet';
import { SpreadsheetGrid, textEditor } from '@/components/DataGrid';
import { Column } from 'react-data-grid';
import { TestCase, DailyData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface TestCasesProps {
  selectedProject: any;
}

interface CustomPage {
  id: string;
  name: string;
  date: string;
}

export default function TestCases({ selectedProject }: TestCasesProps) {
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [activePage, setActivePage] = useState<string>('');
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState('');
  const [newPageDate, setNewPageDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSpreadsheetMode, setIsSpreadsheetMode] = useState(false); // New state for view toggle
  const [spreadsheetRows, setSpreadsheetRows] = useState<TestCase[]>([]);
  const [pendingDeletePageId, setPendingDeletePageId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedProject) {
      loadCustomPages();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && activePage) {
      const page = customPages.find(p => p.id === activePage);
      if (page) {
        loadDailyData(page.date);
      }
    }
  }, [selectedProject, activePage, customPages]);

  const loadCustomPages = async () => {
    try {
      const pages = await api.get(`/api/projects/${selectedProject.id}/pages`);
      setCustomPages(pages);
      if (pages.length > 0 && !activePage) {
        setActivePage(pages[0].id);
      }
    } catch (error) {
      console.error('Error loading custom pages:', error);
    }
  };

  const loadDailyData = async (date?: string) => {
    try {
      const url = date
        ? `/api/projects/${selectedProject.id}/daily-data?date=${date}`
        : `/api/projects/${selectedProject.id}/daily-data`;

      const data = await api.get(url);
      setDailyData(data);
    } catch (error) {
      console.error('Error loading daily data:', error);
    }
  };

  const createCustomPage = async () => {
    if (!selectedProject) {
      toast({ title: "Select a project", description: "Please select a project first.", variant: "destructive" });
      return;
    }
    if (!newPageName.trim() || !newPageDate) return;

    const newPage: CustomPage = {
      id: Date.now().toString(),
      name: newPageName.trim(),
      date: newPageDate
    };

    try {
      const savedPage = await api.post(`/api/projects/${selectedProject.id}/pages`, newPage);

      setCustomPages([...customPages, savedPage]);
      setActivePage(savedPage.id);
      setNewPageName('');
      setNewPageDate('');
      setShowNewPageDialog(false);

      // Create corresponding daily data entry
      const newDayData: DailyData = {
        date: savedPage.date,
        testCases: [],
        bugs: []
      };

      await api.post(`/api/projects/${selectedProject.id}/daily-data`, newDayData);

      loadDailyData(savedPage.date);

      toast({
        title: "Success",
        description: "Custom page created successfully"
      });
    } catch (error) {
      console.error('Error creating custom page:', error);
      toast({
        title: "Error",
        description: "Failed to create custom page",
        variant: "destructive"
      });
    }
  };

  const updatePageName = async (pageId: string, newName: string) => {
    if (!newName.trim()) return;

    try {
      await api.put(`/api/projects/${selectedProject.id}/pages/${pageId}`, { name: newName.trim() });

      setCustomPages(customPages.map(page =>
        page.id === pageId ? { ...page, name: newName.trim() } : page
      ));
      setEditingPageId(null);
      toast({
        title: "Success",
        description: "Page name updated successfully"
      });
    } catch (error) {
      console.error('Error updating page name:', error);
      toast({
        title: "Error",
        description: "Failed to update page name",
        variant: "destructive"
      });
    }
  };

  const deletePage = async (pageId: string) => {
    try {
      await api.delete(`/api/projects/${selectedProject.id}/pages/${pageId}`);

      const updatedPages = customPages.filter(page => page.id !== pageId);
      setCustomPages(updatedPages);

      if (activePage === pageId) {
        setActivePage(updatedPages.length > 0 ? updatedPages[0].id : '');
      }

      toast({
        title: "Success",
        description: "Page deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive"
      });
    }
  };

  const getCurrentPageData = () => {
    const activePage_data = customPages.find(p => p.id === activePage);
    if (!activePage_data) return { date: '', testCases: [], bugs: [] };

    return dailyData.find(d => d.date === activePage_data.date) ||
      { date: activePage_data.date, testCases: [], bugs: [] };
  };

  const updateDayData = async (updatedData: Partial<DailyData>) => {
    if (!selectedProject) return;

    const activePage_data = customPages.find(p => p.id === activePage);
    if (!activePage_data) return;

    try {
      const updated = await api.put(`/api/projects/${selectedProject.id}/daily-data/${activePage_data.date}`, updatedData);
      setDailyData(prev => prev.map(d => d.date === activePage_data.date ? updated : d));
    } catch (error) {
      console.error('Error updating day data:', error);
      toast({
        title: "Error",
        description: "Failed to update data",
        variant: "destructive"
      });
    }
  };

  const handleTestCaseAdd = (testCase: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>) => {
    const currentData = getCurrentPageData();
    const newTestCase: TestCase = {
      ...testCase,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    updateDayData({
      testCases: [...currentData.testCases, newTestCase]
    });

    toast({
      title: "Success",
      description: "Test case added successfully"
    });
  };

  const handleBulkTestCaseAdd = (newTestCases: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const currentData = getCurrentPageData();

    // Prepare all test cases with IDs and timestamps
    const preparedTestCases: TestCase[] = newTestCases.map(tc => ({
      ...tc,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Single Update with all new cases appended
    updateDayData({
      testCases: [...currentData.testCases, ...preparedTestCases]
    });

    toast({
      title: "Success",
      description: `${newTestCases.length} test cases added successfully`
    });
  };

  const handleTestCaseUpdate = (id: string, updates: Partial<TestCase>) => {
    const currentData = getCurrentPageData();
    const updatedTestCases = currentData.testCases.map(tc =>
      tc.id === id ? { ...tc, ...updates, updatedAt: new Date().toISOString() } : tc
    );

    updateDayData({ testCases: updatedTestCases });

    toast({
      title: "Success",
      description: "Test case updated successfully"
    });
  };

  const handleTestCaseDelete = (id: string) => {
    const currentData = getCurrentPageData();
    const filteredTestCases = currentData.testCases.filter(tc => tc.id !== id);

    updateDayData({ testCases: filteredTestCases });

    toast({
      title: "Success",
      description: "Test case deleted successfully"
    });
  };

  const handleBulkDelete = (ids: string[]) => {
    const currentData = getCurrentPageData();
    const filteredTestCases = currentData.testCases.filter(tc => !ids.includes(tc.id));

    updateDayData({ testCases: filteredTestCases });

    toast({
      title: "Success",
      description: `${ids.length} test cases deleted successfully`
    });
  };

  const handleBulkStatusUpdate = (ids: string[], status: string) => {
    const currentData = getCurrentPageData();
    const updatedTestCases = currentData.testCases.map(tc =>
      ids.includes(tc.id) ? { ...tc, status: status as 'Pass' | 'Fail' | 'Blocked' | 'Not Executed', updatedAt: new Date().toISOString() } : tc
    );

    updateDayData({ testCases: updatedTestCases });

    toast({
      title: "Success",
      description: `${ids.length} test cases updated to ${status}`
    });
  };

  const handleExportTestCases = async () => {
    if (!selectedProject || !activePage) return;

    const activePage_data = customPages.find(p => p.id === activePage);
    if (!activePage_data) return;

    try {
      const blob = await api.download(`/api/projects/${selectedProject.id}/export/testcases/${activePage_data.date}`);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `testcases-${selectedProject.name}-${activePage_data.name}-${activePage_data.date}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Test cases exported successfully"
      });
    } catch (error) {
      console.error('Error exporting test cases:', error);
      toast({
        title: "Error",
        description: "Failed to export test cases",
        variant: "destructive"
      });
    }
  };

  const handleImportTestCases = (importedTestCases: any[]) => {
    const currentData = getCurrentPageData();
    const newTestCases = importedTestCases.map(tc => ({
      ...tc,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    updateDayData({
      testCases: [...currentData.testCases, ...newTestCases]
    });

    toast({
      title: "Success",
      description: `Imported ${newTestCases.length} test cases successfully`
    });
  };

  // Filter test cases based on search query
  const filteredTestCases = getCurrentPageData().testCases.filter(testCase => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      testCase.testCaseId.toLowerCase().includes(query) ||
      testCase.testScenario.toLowerCase().includes(query) ||
      testCase.module.toLowerCase().includes(query) ||
      testCase.testCaseDescription.toLowerCase().includes(query)
    );
  });


  // Sync spreadsheet rows with data when mode activates or page changes
  useEffect(() => {
    if (isSpreadsheetMode) {
      setSpreadsheetRows(getCurrentPageData().testCases);
    }
  }, [isSpreadsheetMode, activePage, dailyData]); // Update when underlying data refreshes

  // Spreadsheet Logic
  const spreadsheetColumns = useMemo((): Column<TestCase>[] => [
    { key: 'module', name: 'Module', width: 140, renderEditCell: textEditor },
    { key: 'testCaseId', name: 'Test Case ID', width: 120, frozen: true, renderEditCell: textEditor },
    { key: 'testScenario', name: 'Test Scenario', width: 250, renderEditCell: textEditor },
    { key: 'testCaseDescription', name: 'Description', width: 350, renderEditCell: textEditor },
    { key: 'preConditions', name: 'Pre-Conditions', width: 250, renderEditCell: textEditor },
    { key: 'testSteps', name: 'Test Steps', width: 400, renderEditCell: textEditor },
    { key: 'testData', name: 'Test Data', width: 180, renderEditCell: textEditor },
    { key: 'expectedResult', name: 'Expected Result', width: 250, renderEditCell: textEditor },
    { key: 'actualResult', name: 'Actual Result', width: 250, renderEditCell: textEditor },
    { key: 'status', name: 'Status', width: 120, renderEditCell: textEditor },
    { key: 'comments', name: 'Comments', width: 250, renderEditCell: textEditor },
  ], []);

  const handleSpreadsheetRowsChange = (newRows: TestCase[]) => {
    // Local Update Only - No API call to prevent lag
    setSpreadsheetRows(newRows);
  };

  const handleSaveSpreadsheet = async () => {
    updateDayData({ testCases: spreadsheetRows });
    toast({ title: "Saved", description: "Spreadsheet changes saved successfully." });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Test Cases</h1>
          <p className="text-sm text-muted-foreground">Manage and track test cases</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative max-w-md w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search test cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={showNewPageDialog} onOpenChange={setShowNewPageDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Page
              </Button>
            </DialogTrigger>
            <DialogContent className="border-0 bg-card/95 backdrop-blur-xl shadow-2xl sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  Create New Test Page
                </DialogTitle>
                <DialogDescription>
                  Organize your test cases by sprint, date, or feature.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="space-y-2 group">
                  <Label htmlFor="pageName" className="text-xs font-semibold uppercase text-muted-foreground group-focus-within:text-primary transition-colors">Page Name</Label>
                  <Input
                    id="pageName"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    placeholder="e.g., Sprint 42 Release"
                    className="bg-background/50 border-input/50 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="pageDate" className="text-xs font-semibold uppercase text-muted-foreground group-focus-within:text-primary transition-colors">Target Date</Label>
                  <Input
                    id="pageDate"
                    type="date"
                    value={newPageDate}
                    onChange={(e) => setNewPageDate(e.target.value)}
                    className="bg-background/50 border-input/50 focus:border-primary transition-all"
                  />
                </div>
                <Button onClick={createCustomPage} className="w-full shadow-md" disabled={!newPageName || !newPageDate}>
                  Create Page
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Custom Pages Tabs */}
      <div className="bg-background border-b border-border">
        <div className="flex items-center overflow-x-auto scrollbar-hide px-6">
          {customPages.map((page) => (
            <div key={page.id} className="flex items-center">
              <button
                onClick={() => setActivePage(page.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activePage === page.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
              >
                <Calendar className="h-4 w-4" />
                {editingPageId === page.id ? (
                  <Input
                    value={page.name}
                    onChange={(e) => {
                      const updatedPages = customPages.map(p =>
                        p.id === page.id ? { ...p, name: e.target.value } : p
                      );
                      setCustomPages(updatedPages);
                    }}
                    onBlur={() => updatePageName(page.id, page.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updatePageName(page.id, page.name);
                      }
                      if (e.key === 'Escape') {
                        setEditingPageId(null);
                        loadCustomPages();
                      }
                    }}
                    className="h-6 text-sm"
                    autoFocus
                  />
                ) : (
                  <span onDoubleClick={() => setEditingPageId(page.id)}>
                    {page.name}
                  </span>
                )}
              </button>

              {activePage === page.id && (
                <div className="flex items-center ml-1 space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSpreadsheetMode(!isSpreadsheetMode);
                    }}
                    title="Toggle Spreadsheet View"
                    className={isSpreadsheetMode ? "h-6 w-6 text-primary bg-primary/10" : "h-6 w-6 text-muted-foreground hover:text-foreground"}
                  >
                    {isSpreadsheetMode ? <Table className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setEditingPageId(page.id); }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setPendingDeletePageId(page.id); }}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Test Cases Content */}
      <div className="flex-1 overflow-hidden">
        {activePage ? (
          isSpreadsheetMode ? (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center px-4 py-2 border-b bg-muted/40">
                <span className="text-sm text-muted-foreground">Spreadsheet View - Changes are local until saved.</span>
                <Button onClick={handleSaveSpreadsheet} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
              <div className="flex-1 p-4 overflow-hidden">
                <SpreadsheetGrid
                  columns={spreadsheetColumns}
                  rows={spreadsheetRows}
                  onRowsChange={handleSpreadsheetRowsChange}
                />
              </div>
            </div>
          ) : (
            <TestCaseSheet
              testCases={filteredTestCases}
              onTestCaseAdd={handleTestCaseAdd}
              onBulkTestCaseAdd={handleBulkTestCaseAdd}
              onTestCaseUpdate={handleTestCaseUpdate}
              onTestCaseDelete={handleTestCaseDelete}
              onBulkDelete={handleBulkDelete}
              onBulkStatusUpdate={handleBulkStatusUpdate}
              onExport={handleExportTestCases}
              onImport={handleImportTestCases}
            />
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No test pages created</h3>
              <p className="text-muted-foreground mb-4">
                Create your first test page to start managing test cases
              </p>
              <Button onClick={() => setShowNewPageDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Test Page
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!pendingDeletePageId} onOpenChange={(open) => !open && setPendingDeletePageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Page?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this page and all <strong>{customPages.find(p => p.id === pendingDeletePageId)?.name}</strong> test cases.
              <br />This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDeletePageId) deletePage(pendingDeletePageId);
                setPendingDeletePageId(null);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}