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
import { useNavigate } from '@tanstack/react-router';

export default function ProjectSettings() {
    // Project State
    const [projects, setProjects] = useState<Project[]>([]);
    const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");

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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Projects & Integrations
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                        Manage your test projects, configure seamless CI/CD integrations, and switch contexts instantly.
                    </p>
                </div>

                <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
                    <DialogTrigger asChild>
                        <Button className="shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 bg-primary/90 backdrop-blur-sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] border-0 bg-card/95 backdrop-blur-xl shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
                        <DialogHeader>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 mx-auto sm:mx-0 text-primary">
                                <FolderOpen className="h-6 w-6" />
                            </div>
                            <DialogTitle className="text-xl">Create New Project</DialogTitle>
                            <DialogDescription>
                                Establish a new workspace for your tests.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-5 py-4">
                            <div className="space-y-2 group">
                                <Label htmlFor="name" className="text-xs uppercase font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">
                                    Project Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    placeholder="e.g. Acme Corp Web App"
                                    className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all hover:bg-muted/50"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <Label htmlFor="description" className="text-xs uppercase font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">
                                    Description <span className="text-muted-foreground/50 font-normal normal-case">(Optional)</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    placeholder="Briefly describe the purpose of this project..."
                                    className="resize-none bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all hover:bg-muted/50 min-h-[100px]"
                                />
                            </div>
                            <Button onClick={createProject} className="w-full h-11 text-base shadow-md hover:shadow-xl transition-all mt-2">
                                Create Project
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border-t border-dashed opacity-50" />

            {/* Current Project */}
            {selectedProject && (
                <Card className="border-0 shadow-xl bg-card/40 backdrop-blur-xl overflow-hidden ring-1 ring-white/10 dark:ring-white/5 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                    <CardHeader className="relative border-b border-border/50 bg-background/20">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <FolderOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Active Project Workspace</CardTitle>
                                <CardDescription>Currently editing and running tests for this project.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 relative">
                        <div className="flex flex-col lg:flex-row items-stretch gap-6">
                            {/* Project Info Panel */}
                            <div className="flex-1 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                        {selectedProject.name}
                                    </h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setEditingProject(selectedProject);
                                            setShowEditDialog(true);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-primary hover:text-primary-foreground border-primary/20"
                                    >
                                        <Edit className="h-3.5 w-3.5 mr-2" /> Editor
                                    </Button>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                    {selectedProject.description || "No description provided."}
                                </p>
                                <div className="flex items-center gap-2 mt-auto text-xs font-medium text-muted-foreground/70 bg-muted/30 w-fit px-3 py-1.5 rounded-full border border-border/50">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Created {new Date(selectedProject.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Integrations Section */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* CI/CD Card */}
                <Card className="lg:col-span-2 border-0 shadow-lg bg-card/40 backdrop-blur-xl ring-1 ring-white/10 dark:ring-white/5 overflow-hidden flex flex-col">
                    <CardHeader className="bg-gradient-to-r from-orange-500/5 to-transparent border-b border-border/50">
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Power className="h-5 w-5 text-orange-500" />
                            <span>CI/CD Pipelines</span>
                        </CardTitle>
                        <CardDescription>
                            Remote execution configuration.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col justify-center">
                        {selectedProject ? (
                            <div className="p-5 bg-background/50 border border-border/50 rounded-xl space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-semibold text-sm">Webhook Secret</h4>
                                        <p className="text-xs text-muted-foreground">Use this key to authenticate remote triggers.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {(selectedProject as any).webhookSecret ? (
                                            <>
                                                <div className="bg-muted/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-mono border shadow-inner">
                                                    ••••••••••••••••
                                                </div>
                                                <Button size="sm" variant="outline" className="h-8" onClick={() => {
                                                    navigator.clipboard.writeText((selectedProject as any).webhookSecret);
                                                    toast.success("Copied!");
                                                }}>Copy</Button>
                                                <Button size="sm" variant="ghost" className="h-8 text-destructive hover:bg-destructive/10" onClick={async () => {
                                                    if (!confirm("Regenerate secret?")) return;
                                                    const newSecret = "sk_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                                                    try {
                                                        const updated = await api.put(`/api/projects/${selectedProject.id}`, { webhookSecret: newSecret });
                                                        setSelectedProject(updated);
                                                        toast.success("Regenerated");
                                                    } catch (e) { toast.error("Failed"); }
                                                }}>Regen</Button>
                                            </>
                                        ) : (
                                            <Button size="sm" onClick={async () => {
                                                const newSecret = "sk_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                                                try {
                                                    const updated = await api.put(`/api/projects/${selectedProject.id}`, { webhookSecret: newSecret });
                                                    setSelectedProject(updated);
                                                    toast.success("Generated");
                                                } catch (e) { toast.error("Failed"); }
                                            }}>Generate Secret</Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground/50 italic">
                                Select a project to configure.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Project List Sidebar style */}
                <Card className="border-0 shadow-lg bg-card/40 backdrop-blur-xl ring-1 ring-white/10 dark:ring-white/5 flex flex-col max-h-[400px]">
                    <CardHeader className="pb-3 border-b border-border/50 sticky top-0 bg-card/80 backdrop-blur-xl z-10">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">All Projects</CardTitle>
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{projects.length}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {projects.map((project, i) => (
                            <div
                                key={project.id}
                                className={`group flex items-center justify-between p-3 rounded-lg text-sm transition-all duration-300 cursor-pointer border ${selectedProject?.id === project.id
                                    ? 'bg-primary/10 border-primary/20 shadow-sm'
                                    : 'bg-transparent border-transparent hover:bg-muted/50 hover:border-border'
                                    }`}
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="flex items-center gap-3 overflow-hidden" onClick={() => switchProject(project)}>
                                    <FolderOpen className={`h-4 w-4 shrink-0 transition-colors ${selectedProject?.id === project.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                    <span className={`truncate font-medium ${selectedProject?.id === project.id ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                        {project.name}
                                    </span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingProject(project); setShowEditDialog(true); }}>
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={() => setProjectToDelete(project)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Modals need to be outside the main flow to avoid z-index issues if not using Portal */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="border-0 bg-card/95 backdrop-blur-xl shadow-2xl">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>Modify project details.</DialogDescription>
                    </DialogHeader>
                    {editingProject && (
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label>Project Name</Label>
                                <Input
                                    value={editingProject.name}
                                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                                    className="bg-muted/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editingProject.description}
                                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                                    className="bg-muted/50 resize-none"
                                />
                            </div>
                            <Button onClick={updateProject} className="w-full shadow-md mt-2">
                                Save Changes
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!projectToDelete} onOpenChange={(open) => {
                if (!open) {
                    setProjectToDelete(null);
                    setDeleteConfirmationInput("");
                }
            }}>
                <DialogContent className="border-destructive/20 shadow-destructive/10">
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                            <Trash2 className="h-5 w-5" />
                            Delete Project
                        </DialogTitle>
                        <DialogDescription>
                            Are you absolutely sure you want to delete <strong className="text-foreground">{projectToDelete?.name}</strong>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-md border border-destructive/20">
                            WARNING: This action is permanent and will remove all test cases, scripts, and results associated with this project.
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase">
                                Type <span className="text-foreground font-bold select-all">"{projectToDelete?.name}"</span> to confirm:
                            </Label>
                            <Input
                                value={deleteConfirmationInput}
                                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                                placeholder={projectToDelete?.name}
                                className="bg-muted/50"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="ghost" onClick={() => {
                            setProjectToDelete(null);
                            setDeleteConfirmationInput("");
                        }}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="shadow-md"
                            disabled={deleteConfirmationInput !== projectToDelete?.name}
                            onClick={() => {
                                if (projectToDelete && deleteConfirmationInput === projectToDelete.name) {
                                    deleteProject(projectToDelete.id);
                                    setDeleteConfirmationInput("");
                                }
                            }}
                        >
                            Delete Project
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
