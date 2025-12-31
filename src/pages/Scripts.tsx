import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Code2, Edit2, Trash2, Search, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScriptsProps {
  selectedProject: any;
}

interface Script {
  id: string;
  name: string;
  description: string;
  language: string;
  code: string;
  category: 'automation' | 'performance' | 'api' | 'ui' | 'database' | 'utility';
  createdAt: string;
  updatedAt: string;
}

export default function Scripts({ selectedProject }: ScriptsProps) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [newScript, setNewScript] = useState({
    name: '',
    description: '',
    language: '',
    code: '',
    category: 'automation' as const
  });
  const { toast } = useToast();

  useEffect(() => {
    if (selectedProject) {
      loadScripts();
    }
  }, [selectedProject]);

  const loadScripts = async () => {
    try {
      const response = await fetch(`/api/projects/${selectedProject.id}/scripts`);
      if (response.ok) {
        const data = await response.json();
        setScripts(data);
      }
    } catch (error) {
      console.error('Error loading scripts:', error);
    }
  };

  const createScript = async () => {
    if (!selectedProject) {
      toast({ title: "Select a project", description: "Please select a project first.", variant: "destructive" });
      return;
    }
    if (!newScript.name.trim() || !newScript.language.trim()) return;

    const script: Script = {
      ...newScript,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}/scripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(script)
      });

      if (response.ok) {
        const savedScript = await response.json();
        setScripts([...scripts, savedScript]);
        setNewScript({
          name: '',
          description: '',
          language: '',
          code: '',
          category: 'automation'
        });
        setShowAddDialog(false);
        toast({
          title: "Success",
          description: "Script created successfully"
        });
      }
    } catch (error) {
      console.error('Error creating script:', error);
      toast({
        title: "Error",
        description: "Failed to create script",
        variant: "destructive"
      });
    }
  };

  const updateScript = async () => {
    if (!editingScript || !editingScript.name.trim()) return;

    const updatedScript = {
      ...editingScript,
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}/scripts/${editingScript.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedScript)
      });

      if (response.ok) {
        const saved = await response.json();
        setScripts(scripts.map(s => s.id === editingScript.id ? saved : s));
        setEditingScript(null);
        toast({
          title: "Success",
          description: "Script updated successfully"
        });
      }
    } catch (error) {
      console.error('Error updating script:', error);
      toast({
        title: "Error",
        description: "Failed to update script",
        variant: "destructive"
      });
    }
  };

  const deleteScript = async (scriptId: string) => {
    try {
      const response = await fetch(`/api/projects/${selectedProject.id}/scripts/${scriptId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setScripts(scripts.filter(s => s.id !== scriptId));
        toast({
          title: "Success",
          description: "Script deleted successfully"
        });
      }
    } catch (error) {
      console.error('Error deleting script:', error);
      toast({
        title: "Error",
        description: "Failed to delete script",
        variant: "destructive"
      });
    }
  };

  const exportScript = (script: Script) => {
    const extension = getFileExtension(script.language);
    const blob = new Blob([script.code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.name.replace(/\s+/g, '_')}.${extension}`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Script exported successfully"
    });
  };

  const getFileExtension = (language: string) => {
    const extensions: { [key: string]: string } = {
      'JavaScript': 'js',
      'Python': 'py',
      'Java': 'java',
      'C#': 'cs',
      'TypeScript': 'ts',
      'SQL': 'sql',
      'Shell': 'sh',
      'PowerShell': 'ps1',
      'Ruby': 'rb',
      'Go': 'go',
      'PHP': 'php'
    };
    return extensions[language] || 'txt';
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'automation': return 'default';
      case 'performance': return 'secondary';
      case 'api': return 'outline';
      case 'ui': return 'secondary';
      case 'database': return 'outline';
      case 'utility': return 'secondary';
      default: return 'outline';
    }
  };

  // Filter scripts
  const filteredScripts = scripts.filter(script => {
    const matchesSearch = !searchQuery || 
      script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.language.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || script.category === categoryFilter;
    const matchesLanguage = languageFilter === 'all' || script.language === languageFilter;
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  // Get unique languages for filter
  const uniqueLanguages = [...new Set(scripts.map(s => s.language))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation Scripts</h1>
          <p className="text-muted-foreground">
            Manage test automation scripts for {selectedProject?.name}
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Script
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Script</DialogTitle>
              <DialogDescription>Provide script details including language and code.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scriptName">Script Name</Label>
                  <Input
                    id="scriptName"
                    value={newScript.name}
                    onChange={(e) => setNewScript({ ...newScript, name: e.target.value })}
                    placeholder="e.g., Login Test Script"
                  />
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={newScript.language} onValueChange={(value) => setNewScript({ ...newScript, language: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="Java">Java</SelectItem>
                      <SelectItem value="C#">C#</SelectItem>
                      <SelectItem value="TypeScript">TypeScript</SelectItem>
                      <SelectItem value="SQL">SQL</SelectItem>
                      <SelectItem value="Shell">Shell</SelectItem>
                      <SelectItem value="PowerShell">PowerShell</SelectItem>
                      <SelectItem value="Ruby">Ruby</SelectItem>
                      <SelectItem value="Go">Go</SelectItem>
                      <SelectItem value="PHP">PHP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newScript.category} onValueChange={(value: any) => setNewScript({ ...newScript, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automation">UI Automation</SelectItem>
                    <SelectItem value="api">API Testing</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newScript.description}
                  onChange={(e) => setNewScript({ ...newScript, description: e.target.value })}
                  placeholder="Describe what this script does"
                />
              </div>
              
              <div>
                <Label htmlFor="code">Code</Label>
                <Textarea
                  id="code"
                  value={newScript.code}
                  onChange={(e) => setNewScript({ ...newScript, code: e.target.value })}
                  placeholder="Paste your script code here"
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              
              <Button onClick={createScript} className="w-full">
                Create Script
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="automation">UI Automation</SelectItem>
              <SelectItem value="api">API Testing</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="utility">Utility</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {uniqueLanguages.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scripts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScripts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No scripts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoryFilter !== 'all' || languageFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first automation script'}
            </p>
            {(!searchQuery && categoryFilter === 'all' && languageFilter === 'all') && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Script
              </Button>
            )}
          </div>
        ) : (
          filteredScripts.map((script) => (
            <Card key={script.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code2 className="h-5 w-5" />
                      {script.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={getCategoryBadgeVariant(script.category)}>
                        {script.category}
                      </Badge>
                      <Badge variant="outline">
                        {script.language}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingScript(script)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportScript(script)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteScript(script.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {script.description || 'No description provided'}
                </p>
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(script.createdAt).toLocaleDateString()}
                </div>
                {script.code && (
                  <div className="mt-3 p-2 bg-muted rounded text-xs font-mono max-h-20 overflow-hidden">
                    {script.code.substring(0, 100)}
                    {script.code.length > 100 && '...'}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Script Dialog */}
      <Dialog open={!!editingScript} onOpenChange={() => setEditingScript(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Script</DialogTitle>
            <DialogDescription>Update script fields and save changes.</DialogDescription>
          </DialogHeader>
          {editingScript && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editName">Script Name</Label>
                  <Input
                    id="editName"
                    value={editingScript.name}
                    onChange={(e) => setEditingScript({ ...editingScript, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editLanguage">Language</Label>
                  <Select 
                    value={editingScript.language} 
                    onValueChange={(value) => setEditingScript({ ...editingScript, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="Java">Java</SelectItem>
                      <SelectItem value="C#">C#</SelectItem>
                      <SelectItem value="TypeScript">TypeScript</SelectItem>
                      <SelectItem value="SQL">SQL</SelectItem>
                      <SelectItem value="Shell">Shell</SelectItem>
                      <SelectItem value="PowerShell">PowerShell</SelectItem>
                      <SelectItem value="Ruby">Ruby</SelectItem>
                      <SelectItem value="Go">Go</SelectItem>
                      <SelectItem value="PHP">PHP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="editCategory">Category</Label>
                <Select 
                  value={editingScript.category} 
                  onValueChange={(value: any) => setEditingScript({ ...editingScript, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automation">UI Automation</SelectItem>
                    <SelectItem value="api">API Testing</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editingScript.description}
                  onChange={(e) => setEditingScript({ ...editingScript, description: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="editCode">Code</Label>
                <Textarea
                  id="editCode"
                  value={editingScript.code}
                  onChange={(e) => setEditingScript({ ...editingScript, code: e.target.value })}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={updateScript} className="flex-1">
                  Update Script
                </Button>
                <Button variant="outline" onClick={() => setEditingScript(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}