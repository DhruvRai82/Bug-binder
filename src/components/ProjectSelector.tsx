import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FolderOpen } from 'lucide-react';
import { Project } from '@/types';
import { api } from '@/lib/api';

interface ProjectSelectorProps {
  selectedProject: Project | null;
  onProjectSelect: (project: Project | null) => void;
}

export function ProjectSelector({ selectedProject, onProjectSelect }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.get('/api/projects');
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        console.error('Projects data is not an array:', data);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const createProject = async () => {
    if (!newProject.name.trim()) return;

    try {
      const project = await api.post('/api/projects', newProject);
      setProjects([...projects, project]);
      setNewProject({ name: '', description: '' });
      setShowNewProjectDialog(false);
      onProjectSelect(project);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  if (selectedProject) {
    return (
      <div className="flex items-center justify-between p-4 bg-background/60 backdrop-blur-md border-b sticky top-0 z-10 animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Project</h2>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent leading-none">{selectedProject.name}</h1>
          </div>
        </div>
        <Button variant="outline" onClick={() => onProjectSelect(null)} className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors">
          Switch Project
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              My Projects
            </h1>
            <p className="text-muted-foreground text-lg">Select a workspace to begin testing.</p>
          </div>

          <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                <Plus className="h-5 w-5 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-0 bg-card/95 backdrop-blur-xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <FolderOpen className="h-6 w-6 text-primary" />
                  Create Workspace
                </DialogTitle>
                <DialogDescription className="text-base">
                  Initialize a new testing environment for your application.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2 group">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase text-muted-foreground group-focus-within:text-primary transition-colors">Project Name</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="e.g. E-Commerce Platform V2"
                    className="h-12 bg-background/50 border-input/50 focus:border-primary transition-all text-lg"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="description" className="text-xs font-semibold uppercase text-muted-foreground group-focus-within:text-primary transition-colors">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Briefly describe the scope of this project..."
                    className="resize-none bg-background/50 border-input/50 focus:border-primary transition-all min-h-[100px]"
                  />
                </div>
                <Button onClick={createProject} className="w-full size-lg text-base font-semibold shadow-md active:scale-95 transition-transform" disabled={!newProject.name}>
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <Card
              key={project.id}
              className="group cursor-pointer hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm border-muted/50 overflow-hidden relative"
              onClick={() => onProjectSelect(project)}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-xl group-hover:text-primary transition-colors">
                  <div className="p-2 bg-background rounded-md shadow-sm group-hover:bg-primary/10 transition-colors">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
                  {project.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground/70 pt-4 border-t border-dashed">
                  <span>ID: {project.id.slice(0, 8)}</span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-muted/20">
              <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No projects found</h3>
              <p className="text-muted-foreground/80 mt-2">Create your first project to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}