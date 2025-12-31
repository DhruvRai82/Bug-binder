import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, Edit2, X, Search, AlertTriangle } from 'lucide-react';
import { BugSheet } from '@/components/BugSheet';
import { Bug, DailyData, Project } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface BugsProps {
  selectedProject: Project;
}

interface CustomPage {
  id: string;
  name: string;
  date: string;
}

export default function Bugs({ selectedProject }: BugsProps) {
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [activePage, setActivePage] = useState<string>('');
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState('');
  const [newPageDate, setNewPageDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDeletePageId, setPendingDeletePageId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadCustomPages = useCallback(async () => {
    try {
      const pages = await api.get(`/api/projects/${selectedProject.id}/pages`);
      setCustomPages(pages);
      if (pages.length > 0 && !activePage) {
        setActivePage(pages[0].id);
      }
    } catch (error) {
      console.error('Error loading custom pages:', error);
    }
  }, [selectedProject, activePage]);

  const loadDailyData = useCallback(async (date?: string) => {
    try {
      const url = date
        ? `/api/projects/${selectedProject.id}/daily-data?date=${date}`
        : `/api/projects/${selectedProject.id}/daily-data`;

      const data = await api.get(url);
      setDailyData(data);
    } catch (error) {
      console.error('Error loading daily data:', error);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      loadCustomPages();
    }
  }, [selectedProject, loadCustomPages]);

  useEffect(() => {
    if (selectedProject && activePage) {
      const page = customPages.find(p => p.id === activePage);
      if (page) {
        loadDailyData(page.date);
      }
    }
  }, [selectedProject, activePage, customPages, loadDailyData]);

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

  const handleBugAdd = (bug: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>) => {
    const currentData = getCurrentPageData();
    const newBug: Bug = {
      ...bug,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    updateDayData({
      bugs: [...currentData.bugs, newBug]
    });

    toast({
      title: "Success",
      description: "Bug reported successfully"
    });
  };

  const handleBugUpdate = (id: string, updates: Partial<Bug>) => {
    const currentData = getCurrentPageData();
    const updatedBugs = currentData.bugs.map(bug =>
      bug.id === id ? { ...bug, ...updates, updatedAt: new Date().toISOString() } : bug
    );

    updateDayData({ bugs: updatedBugs });

    toast({
      title: "Success",
      description: "Bug updated successfully"
    });
  };

  const handleBugDelete = (id: string) => {
    const currentData = getCurrentPageData();
    const filteredBugs = currentData.bugs.filter(bug => bug.id !== id);

    updateDayData({ bugs: filteredBugs });

    toast({
      title: "Success",
      description: "Bug deleted successfully"
    });
  };

  const handleBulkDelete = (ids: string[]) => {
    const currentData = getCurrentPageData();
    const filteredBugs = currentData.bugs.filter(bug => !ids.includes(bug.id));

    updateDayData({ bugs: filteredBugs });

    toast({
      title: "Success",
      description: `${ids.length} bugs deleted successfully`
    });
  };

  const handleBulkStatusUpdate = (ids: string[], status: string) => {
    const currentData = getCurrentPageData();
    const updatedBugs = currentData.bugs.map(bug =>
      ids.includes(bug.id) ? { ...bug, status: status as 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Rejected', updatedAt: new Date().toISOString() } : bug
    );

    updateDayData({ bugs: updatedBugs });

    toast({
      title: "Success",
      description: `${ids.length} bugs updated to ${status}`
    });
  };

  const handleExportBugs = async () => {
    if (!selectedProject || !activePage) return;

    const activePage_data = customPages.find(p => p.id === activePage);
    if (!activePage_data) return;

    try {
      const blob = await api.download(`/api/projects/${selectedProject.id}/export/bugs/${activePage_data.date}`);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bugs-${selectedProject.name}-${activePage_data.name}-${activePage_data.date}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Bugs exported successfully"
      });
    } catch (error) {
      console.error('Error exporting bugs:', error);
      toast({
        title: "Error",
        description: "Failed to export bugs",
        variant: "destructive"
      });
    }
  };

  const handleImportBugs = (importedBugs: Partial<Bug>[]) => {
    const currentData = getCurrentPageData();
    const newBugs = importedBugs.map(bug => ({
      ...bug,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Bug));

    updateDayData({
      bugs: [...currentData.bugs, ...newBugs]
    });

    toast({
      title: "Success",
      description: `Imported ${newBugs.length} bugs successfully`
    });
  };

  // Filter bugs based on search query
  const filteredBugs = getCurrentPageData().bugs.filter(bug => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      bug.bugId.toLowerCase().includes(query) ||
      bug.title.toLowerCase().includes(query) ||
      bug.description.toLowerCase().includes(query) ||
      bug.module.toLowerCase().includes(query) ||
      bug.reporter.toLowerCase().includes(query) ||
      bug.assignee.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bugs</h1>
          <p className="text-sm text-muted-foreground">Manage and track reported bugs</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative max-w-md w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bugs..."
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Bug Page</DialogTitle>
                <DialogDescription>Enter a page name and date to create a new bug page.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pageName">Page Name</Label>
                  <Input
                    id="pageName"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    placeholder="e.g., Sprint 1 Bugs, Production Issues"
                  />
                </div>
                <div>
                  <Label htmlFor="pageDate">Date</Label>
                  <Input
                    id="pageDate"
                    type="date"
                    value={newPageDate}
                    onChange={(e) => setNewPageDate(e.target.value)}
                  />
                </div>
                <Button onClick={createCustomPage} className="w-full">
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
                <div className="flex items-center ml-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPageId(page.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingDeletePageId(page.id)}
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

      {/* Bugs Content */}
      <div className="flex-1 overflow-hidden">
        {activePage ? (
          <BugSheet
            bugs={filteredBugs}
            testCases={getCurrentPageData().testCases}
            onBugAdd={handleBugAdd}
            onBugUpdate={handleBugUpdate}
            onBugDelete={handleBugDelete}
            onBulkDelete={handleBulkDelete}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            onExport={handleExportBugs}
            onImport={handleImportBugs}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No bug pages created</h3>
              <p className="text-muted-foreground mb-4">
                Create your first bug page to start tracking issues
              </p>
              <Button onClick={() => setShowNewPageDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Bug Page
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
              This will permanently delete this page and all <strong>{customPages.find(p => p.id === pendingDeletePageId)?.name}</strong> bugs.
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