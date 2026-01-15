import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, FileSpreadsheet, Trash2, Wand2, Plus, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

export default function MobileTestData() {
    const { selectedProject } = useProject();
    const [datasets, setDatasets] = useState<any[]>([]);
    const [selectedDataset, setSelectedDataset] = useState<any>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (selectedProject) fetchDatasets();
    }, [selectedProject]);

    const fetchDatasets = async () => {
        try {
            const data = await api.get(`/api/test-data?projectId=${selectedProject?.id}`);
            setDatasets(data);
        } catch {
            toast.error("Failed to load datasets");
        }
    };

    const handleSelectDataset = async (dataset: any) => {
        setSelectedDataset(dataset);
        setLoading(true);
        try {
            const data = await api.get(`/api/test-data/${dataset.id}/preview?projectId=${selectedProject?.id}`);
            setPreviewData(data);
        } catch {
            toast.error("Failed to load preview");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDataset = async (id: string, e: any) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this dataset?')) return;
        try {
            await api.delete(`/api/test-data/${id}?projectId=${selectedProject?.id}`);
            toast.success("Dataset deleted");
            setDatasets(datasets.filter(d => d.id !== id));
            if (selectedDataset?.id === id) {
                setSelectedDataset(null);
            }
        } catch {
            toast.error("Failed to delete");
        }
    };

    const filteredDatasets = datasets.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4 pb-20">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search datasets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-muted/50 border-0"
                />
            </div>

            {/* Empty State */}
            {datasets.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No test data found.</p>
                    <p className="text-xs mt-1">Generate data using the Desktop App.</p>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 gap-3">
                {filteredDatasets.map((dataset) => (
                    <Card key={dataset.id} onClick={() => handleSelectDataset(dataset)} className="active:scale-[0.98] transition-transform">
                        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg shrink-0">
                                    <FileSpreadsheet className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <CardTitle className="text-sm font-semibold truncate">{dataset.name}</CardTitle>
                                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                        <span>CSV/JSON</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-red-500 shrink-0"
                                onClick={(e) => handleDeleteDataset(dataset.id, e)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Detail Drawer */}
            <Drawer open={!!selectedDataset} onOpenChange={(o) => !o && setSelectedDataset(null)}>
                <DrawerContent className="h-[85vh]">
                    <DrawerHeader className="border-b pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                                <Database className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <DrawerTitle>{selectedDataset?.name}</DrawerTitle>
                                <DrawerDescription>Data Preview</DrawerDescription>
                            </div>
                        </div>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="flex items-center justify-center h-40 text-muted-foreground">
                                Loading preview...
                            </div>
                        ) : previewData.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                    <span>Showing first {previewData.length} records</span>
                                    <Badge variant="outline">JSON View</Badge>
                                </div>
                                {previewData.map((row, i) => (
                                    <Card key={i} className="bg-muted/30 border-0">
                                        <CardContent className="p-3 grid gap-1.5">
                                            {Object.entries(row).map(([key, value]) => (
                                                <div key={key} className="flex justify-between text-xs border-b border-border/50 last:border-0 pb-1 last:pb-0">
                                                    <span className="font-medium text-muted-foreground">{key}:</span>
                                                    <span className="font-mono truncate max-w-[60%]">{String(value)}</span>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                No data available for preview.
                            </div>
                        )}
                    </div>

                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
