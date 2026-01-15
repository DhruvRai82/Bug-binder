
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useProject } from '@/context/ProjectContext';
import { ArrowLeft, Plus, FolderOpen, Check, Trash2, Edit } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Project } from '@/types';
import { cn } from "@/lib/utils";

export function MobileProjectSettings() {
    const { selectedProject, setSelectedProject } = useProject();
    const [projects, setProjects] = useState<Project[]>([]);
    const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await api.get('/api/projects');
            setProjects(data);
        } catch (error) {
            console.error('Error loading projects:', error);
            toast.error('Failed to load projects');
        }
    };

    const createProject = async () => {
        if (!newProject.name.trim()) return;
        try {
            const project = await api.post('/api/projects', newProject);
            setProjects([...projects, project]);
            setNewProject({ name: '', description: '' });
            setShowNewProjectDialog(false);
            toast.success('Project created');
        } catch (error) {
            toast.error('Failed to create project');
        }
    };

    const switchProject = (project: Project) => {
        setSelectedProject(project);
        toast.success(`Active: ${project.name}`);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background/95 backdrop-blur z-20">
                <div className="flex items-center gap-3">
                    <Link to="/settings">
                        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-semibold">Projects</h1>
                </div>

                <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8">
                            <Plus className="h-4 w-4 mr-1" /> New
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[90%] rounded-xl">
                        <DialogHeader>
                            <DialogTitle>New Project</DialogTitle>
                            <DialogDescription>Create a new testing workspace.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    placeholder="Project Name"
                                />
                            </div>
                            <Button onClick={createProject} className="w-full">Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="p-4 space-y-4">
                <p className="text-xs text-muted-foreground uppercase ml-1">Your Projects</p>

                <div className="space-y-2">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => switchProject(project)}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98]",
                                selectedProject?.id === project.id
                                    ? "bg-primary/5 border-primary shadow-sm"
                                    : "bg-card border-border hover:bg-muted/50"
                            )}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    selectedProject?.id === project.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                )}>
                                    <FolderOpen className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-medium truncate">{project.name}</span>
                                    <span className="text-xs text-muted-foreground truncate">
                                        {project.description || "No description"}
                                    </span>
                                </div>
                            </div>

                            {selectedProject?.id === project.id && (
                                <Check className="h-5 w-5 text-primary shrink-0" />
                            )}
                        </div>
                    ))}
                </div>

                {projects.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <FolderOpen className="h-10 w-10 mx-auto mb-2" />
                        <p>No projects found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
