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
      <div className="flex items-center justify-between p-4 bg-background border-b">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{selectedProject.name}</h2>
        </div>
        <Button variant="outline" onClick={() => onProjectSelect(null)}>
          Switch Project
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Test Management Platform</h1>
          <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Enter a project name and optional description.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Enter project description"
                  />
                </div>
                <Button onClick={createProject} className="w-full">
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onProjectSelect(project)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{project.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}