
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Folder, FileText, Activity, Users, Server, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

export default function DatabaseView() {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [projectData, setProjectData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await api.get('/api/projects');
            setProjects(data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectDetails = async (projectId: string) => {
        setLoading(true);
        try {
            // Parallel fetch of sub-collections
            const [pages, daily, scripts, testRuns, files] = await Promise.all([
                api.get(`/api/projects/${projectId}/pages`),
                api.get(`/api/projects/${projectId}/daily-data`),
                api.get(`/api/projects/${projectId}/scripts`),
                api.get(`/api/projects/${projectId}/test-runs`),
                api.get(`/api/projects/${projectId}/files`)
            ]);

            setProjectData({
                id: projectId,
                pages,
                dailyData: daily,
                scripts,
                testRuns,
                files
            });
            setSelectedProject(projectId);
        } catch (error) {
            console.error('Failed to fetch details', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const uniqueUsers = React.useMemo(() => {
        const users = new Map<string, number>();
        projects.forEach(p => {
            const uid = p.user_id || 'unknown';
            users.set(uid, (users.get(uid) || 0) + 1);
        });
        return Array.from(users.entries()).map(([uid, count]) => ({ uid, count }));
    }, [projects]);

    return (
        <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-900/50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Database View</h1>
                    <p className="text-muted-foreground mt-1">
                        Direct access to underlying data structures and relationships.
                    </p>
                </div>
                <Button onClick={fetchProjects} variant="outline" disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </Button>
            </div>

            {/* ERD / Schema Visualization */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-blue-500" />
                        Schema Relationship Diagram (ERD)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 bg-white dark:bg-zinc-950 rounded-lg border flex flex-col md:flex-row gap-8 items-start overflow-x-auto">

                        {/* User Node */}
                        <div className="border rounded-md p-4 min-w-[200px] bg-red-50 dark:bg-red-950/20 border-red-200">
                            <div className="flex items-center gap-2 mb-2 font-bold text-red-700 dark:text-red-400">
                                <Users className="h-4 w-4" /> User
                            </div>
                            <div className="text-xs space-y-1 font-mono">
                                <p>PK: uid (string)</p>
                                <p>email (string)</p>
                                <p>displayName (string)</p>
                            </div>
                        </div>

                        {/* Relationship Line */}
                        <div className="hidden md:flex flex-col items-center justify-center h-full pt-8 text-muted-foreground">
                            <div className="border-t-2 border-dashed w-12 border-gray-400 relative">
                                <span className="absolute -top-3 left-1/3 text-[10px]">1:N</span>
                            </div>
                        </div>

                        {/* Project Node */}
                        <div className="border rounded-md p-4 min-w-[200px] bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                            <div className="flex items-center gap-2 mb-2 font-bold text-blue-700 dark:text-blue-400">
                                <Folder className="h-4 w-4" /> Project
                            </div>
                            <div className="text-xs space-y-1 font-mono">
                                <p>PK: id (uuid)</p>
                                <p>FK: user_id</p>
                                <p>name (string)</p>
                                <p>createdAt (iso-date)</p>
                            </div>
                        </div>

                        {/* Relationship Line */}
                        <div className="hidden md:flex flex-col items-center justify-center h-full pt-8 text-muted-foreground">
                            <div className="border-t-2 border-dashed w-12 border-gray-400 relative">
                                <span className="absolute -top-3 left-1/3 text-[10px]">1:N</span>
                            </div>
                        </div>

                        {/* Sub-Entities Stack */}
                        <div className="space-y-4">
                            <div className="border rounded-md p-3 min-w-[200px] bg-purple-50 dark:bg-purple-950/20 border-purple-200">
                                <div className="flex items-center gap-2 mb-1 font-bold text-purple-700 dark:text-purple-400 text-sm">
                                    <FileText className="h-3 w-3" /> Scripts
                                </div>
                                <div className="text-[10px] space-y-0.5 font-mono">
                                    <p>PK: id</p>
                                    <p>type: 'file' | 'web'</p>
                                </div>
                            </div>
                            <div className="border rounded-md p-3 min-w-[200px] bg-green-50 dark:bg-green-950/20 border-green-200">
                                <div className="flex items-center gap-2 mb-1 font-bold text-green-700 dark:text-green-400 text-sm">
                                    <Activity className="h-3 w-3" /> Test Runs
                                </div>
                                <div className="text-[10px] space-y-0.5 font-mono">
                                    <p>PK: id</p>
                                    <p>FK: projectId</p>
                                    <p>status (enum)</p>
                                </div>
                            </div>
                            <div className="border rounded-md p-3 min-w-[200px] bg-amber-50 dark:bg-amber-950/20 border-amber-200">
                                <div className="flex items-center gap-2 mb-1 font-bold text-amber-700 dark:text-amber-400 text-sm">
                                    <Activity className="h-3 w-3" /> Daily Data
                                </div>
                                <div className="text-[10px] space-y-0.5 font-mono">
                                    <p>PK: date + projectId</p>
                                    <p>bugs (json)</p>
                                    <p>testCases (json)</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Users Table */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Users (Derived)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User ID</TableHead>
                                        <TableHead>Projects</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {uniqueUsers.map((user) => (
                                        <TableRow key={user.uid}>
                                            <TableCell className="font-mono text-xs truncate max-w-[150px]" title={user.uid}>
                                                {user.uid}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{user.count}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Available Projects Table */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Projects Table</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project Name</TableHead>
                                        <TableHead>User ID (Owner)</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projects.map((project) => (
                                        <TableRow key={project.id} className={selectedProject === project.id ? 'bg-muted' : ''}>
                                            <TableCell className="font-medium">{project.name}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[100px]" title={project.user_id}>
                                                {project.user_id}
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="ghost" onClick={() => fetchProjectDetails(project.id)}>
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Data View */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {selectedProject ? 'Entity Data View' : 'Select a project to view data'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {projectData ? (
                            <Tabs defaultValue="scripts">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="scripts">Scripts ({projectData.scripts?.length || 0})</TabsTrigger>
                                    <TabsTrigger value="runs">Test Runs ({projectData.testRuns?.length || 0})</TabsTrigger>
                                    <TabsTrigger value="files">Files ({projectData.files?.length || 0})</TabsTrigger>
                                    <TabsTrigger value="pages">Pages ({projectData.pages?.length || 0})</TabsTrigger>
                                    <TabsTrigger value="daily">Daily ({projectData.dailyData?.length || 0})</TabsTrigger>
                                </TabsList>

                                <TabsContent value="scripts">
                                    <div className="rounded-md border max-h-[400px] overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Module</TableHead>
                                                    <TableHead>Steps</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {projectData.scripts?.map((script: any) => (
                                                    <TableRow key={script.id}>
                                                        <TableCell className="font-medium">{script.name}</TableCell>
                                                        <TableCell>{script.module || '-'}</TableCell>
                                                        <TableCell>{script.steps?.length || 0}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {(!projectData.scripts || projectData.scripts.length === 0) && (
                                                    <TableRow><TableCell colSpan={3} className="text-center p-4 text-muted-foreground">No scripts</TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>

                                <TabsContent value="runs">
                                    <div className="rounded-md border max-h-[400px] overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Run ID</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Time</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {projectData.testRuns?.map((run: any) => (
                                                    <TableRow key={run.id}>
                                                        <TableCell className="font-mono text-xs">{run.id.slice(0, 8)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={run.status === 'passed' ? 'default' : 'destructive'}>{run.status}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-xs">{new Date(run.started_at).toLocaleString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {(!projectData.testRuns || projectData.testRuns.length === 0) && (
                                                    <TableRow><TableCell colSpan={3} className="text-center p-4 text-muted-foreground">No test runs</TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>

                                <TabsContent value="files">
                                    <div className="rounded-md border max-h-[400px] overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Language</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {projectData.files?.map((file: any) => (
                                                    <TableRow key={file.id}>
                                                        <TableCell className="font-medium">{file.name}</TableCell>
                                                        <TableCell>{file.type}</TableCell>
                                                        <TableCell>{file.language || '-'}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {(!projectData.files || projectData.files.length === 0) && (
                                                    <TableRow><TableCell colSpan={3} className="text-center p-4 text-muted-foreground">No files</TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>

                                <TabsContent value="pages">
                                    <div className="rounded-md border max-h-[400px] overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Page ID</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Type</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {projectData.pages?.map((page: any) => (
                                                    <TableRow key={page.id}>
                                                        <TableCell className="font-mono text-xs">{page.id.slice(0, 8)}</TableCell>
                                                        <TableCell>{page.name}</TableCell>
                                                        <TableCell><Badge variant="outline">Custom</Badge></TableCell>
                                                    </TableRow>
                                                ))}
                                                {(!projectData.pages || projectData.pages.length === 0) && (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center p-4 text-muted-foreground">No pages found</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>

                                <TabsContent value="daily">
                                    <div className="rounded-md border max-h-[400px] overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Bugs</TableHead>
                                                    <TableHead>Test Cases</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {projectData.dailyData?.map((day: any, idx: number) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="font-medium">{day.date}</TableCell>
                                                        <TableCell>{day.bugs?.length || 0}</TableCell>
                                                        <TableCell>{day.testCases?.length || 0}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {(!projectData.dailyData || projectData.dailyData.length === 0) && (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center p-4 text-muted-foreground">No daily data found</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                                <Database className="h-8 w-8 mr-2 opacity-50" />
                                Select a project to inspect entities
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
