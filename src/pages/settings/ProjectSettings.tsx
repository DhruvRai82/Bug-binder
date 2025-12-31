import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { FolderOpen, Plus, Edit, Trash2, Power, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Project } from '@/types';
import { useProject } from '@/context/ProjectContext';
import { useNavigate } from 'react-router-dom';

export default function ProjectSettings() {
    // Project State
    const [projects, setProjects] = useState<Project[]>([]);
    const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    const { selectedProject, setSelectedProject } = useProject();
    const navigate = useNavigate();

    const loadProjects = useCallback(async () => {
        try {
            const data = await api.get('/api/projects');
            setProjects(data);
        } catch (error) {
            console.error('Error loading projects:', error);
            toast.error('Failed to load projects');
        }
    }, []);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const createProject = async () => {
        if (!newProject.name.trim()) {
            toast.error('Project name is required');
            return;
        }

        try {
            const project = await api.post('/api/projects', newProject);
            setProjects([...projects, project]);
            setNewProject({ name: '', description: '' });
            setShowNewProjectDialog(false);
            toast.success('Project created successfully');
        } catch (error) {
            console.error('Error creating project:', error);
            toast.error('Failed to create project');
        }
    };

    const updateProject = async () => {
        if (!editingProject || !editingProject.name.trim()) {
            toast.error('Project name is required');
            return;
        }

        try {
            const updatedProject = await api.put(`/api/projects/${editingProject.id}`, {
                name: editingProject.name,
                description: editingProject.description
            });

            setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
            if (selectedProject?.id === updatedProject.id) {
                setSelectedProject(updatedProject);
            }
            setEditingProject(null);
            setShowEditDialog(false);
            toast.success('Project updated successfully');
        } catch (error) {
            console.error('Error updating project:', error);
            toast.error('Failed to update project');
        }
    };

    const deleteProject = async (projectId: string) => {
        try {
            await api.delete(`/api/projects/${projectId}`);
            setProjects(projects.filter(p => p.id !== projectId));
            if (selectedProject?.id === projectId) {
                setSelectedProject(null);
            }
            setProjectToDelete(null);
            toast.success('Project deleted successfully');
        } catch (error) {
            console.error('Error deleting project:', error);
            toast.error('Failed to delete project');
        }
    };

    const switchProject = (project: Project) => {
        setSelectedProject(project);
        toast.success(`Switched to project: ${project.name}`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Projects & Integrations</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your test projects, switch contexts, and configure webhooks.
                </p>
            </div>
            <div className="border-t pt-6" />

            <div className="flex items-end justify-between">
                <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
                    <DialogTrigger asChild>
                        <Button className="shadow-sm hover:shadow-md transition-all">
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
                                <Label htmlFor="description">Description (Optional)</Label>
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

            {/* Current Project */}
            {selectedProject && (
                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <FolderOpen className="h-5 w-5" />
                            Current Project
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between p-6 bg-background border rounded-xl shadow-sm hover:shadow-md transition-all">
                            <div>
                                <h3 className="text-xl font-semibold text-foreground">{selectedProject.name}</h3>
                                <p className="text-muted-foreground mt-1">{selectedProject.description}</p>
                                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>Created: {new Date(selectedProject.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setEditingProject(selectedProject);
                                        setShowEditDialog(true);
                                    }}
                                    className="hover:border-primary/50 hover:bg-primary/5"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Integrations & CI/CD */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500/5 to-transparent border-b">
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                        <Power className="h-5 w-5" />
                        Integrations & CI/CD
                    </CardTitle>
                    <CardDescription>
                        Trigger test scripts remotely from GitHub Actions, Jenkins, or any other tool.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {selectedProject ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-background border rounded-xl">
                                <div>
                                    <h3 className="font-semibold text-foreground">Webhook Secret</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Secure token required to authenticate remote run requests.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(selectedProject as any).webhookSecret ? (
                                        <div className="flex items-center gap-2">
                                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                                                ••••••••••••••••
                                            </code>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    navigator.clipboard.writeText((selectedProject as any).webhookSecret);
                                                    toast.success("Secret copied to clipboard");
                                                }}
                                            >
                                                Copy
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={async () => {
                                                    if (!confirm("Regenerating the secret will break existing pipelines. Continue?")) return;
                                                    const newSecret = "sk_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                                                    try {
                                                        const updated = await api.put(`/api/projects/${selectedProject.id}`, { webhookSecret: newSecret });
                                                        setSelectedProject(updated);
                                                        toast.success("New Secret Generated");
                                                    } catch (e) { toast.error("Failed to update secret"); }
                                                }}
                                            >
                                                Regenerate
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={async () => {
                                                const newSecret = "sk_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                                                try {
                                                    const updated = await api.put(`/api/projects/${selectedProject.id}`, { webhookSecret: newSecret });
                                                    setSelectedProject(updated);
                                                    toast.success("Secret Generated");
                                                } catch (e) { toast.error("Failed to generate secret"); }
                                            }}
                                        >
                                            Generate Secret
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            Please select a project to configure CI/CD Integrations.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* All Projects */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>All Projects ({projects.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className={`group relative border rounded-xl p-5 transition-all hover:shadow-lg bg-background ${selectedProject?.id === project.id ? 'ring-2 ring-primary ring-offset-2' : 'hover:border-primary/50'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${selectedProject?.id === project.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors'}`}>
                                            <FolderOpen className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-semibold text-lg">{project.name}</h3>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => {
                                                setEditingProject(project);
                                                setShowEditDialog(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => setProjectToDelete(project)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">{project.description || "No description provided."}</p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(project.createdAt).toLocaleDateString()}
                                    </p>
                                    {selectedProject?.id !== project.id ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-primary hover:text-primary hover:bg-primary/10 -mr-2"
                                            onClick={() => switchProject(project)}
                                        >
                                            Select
                                        </Button>
                                    ) : (
                                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                            Active
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>Update project name and description.</DialogDescription>
                    </DialogHeader>
                    {editingProject && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Project Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editingProject.name}
                                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editingProject.description}
                                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                                />
                            </div>
                            <Button onClick={updateProject} className="w-full">
                                Update Project
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{projectToDelete?.name}</strong>?
                            <br />
                            This action cannot be undone and will delete all associated data.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setProjectToDelete(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => projectToDelete && deleteProject(projectToDelete.id)}
                        >
                            Delete Project
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
