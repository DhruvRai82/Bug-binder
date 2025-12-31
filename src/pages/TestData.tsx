import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProject } from '@/context/ProjectContext';
import { api, API_BASE_URL } from '@/lib/api';
import { FileSpreadsheet, Trash2, Upload, Plus, ArrowDownToLine } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';

export default function TestData() {
    const { selectedProject } = useProject();
    const [datasets, setDatasets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState<any | null>(null);
    const [rows, setRows] = useState<any[]>([]);

    useEffect(() => {
        fetchDatasets();
    }, []);

    const fetchDatasets = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/api/test-data?projectId=${selectedProject.id}`);
            setDatasets(data);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load datasets");
        } finally {
            setLoading(false);
        }
    };

    const loadData = async (dataset: any) => {
        setSelectedDataset(dataset);
        try {
            const data = await api.get(`/api/test-data/${dataset.id}`);
            setRows(data);
        } catch {
            toast.error("Failed to load rows");
        }
    };

    const handleFileUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', selectedProject.id);

        try {
            await api.post('/api/test-data/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Dataset Uploaded");
            fetchDatasets();
        } catch {
            toast.error("Upload failed");
        }
    };

    const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);

    const confirmDelete = async () => {
        if (!datasetToDelete) return;
        try {
            await api.delete(`/api/test-data/${datasetToDelete}`);
            toast.success("Deleted");
            if (selectedDataset?.id === datasetToDelete) setSelectedDataset(null);
            fetchDatasets();
            setDatasetToDelete(null);
        } catch {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                        Test Data Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Upload CSV or JSON files to drive your tests with dynamic variables.
                    </p>
                </div>
                <div className="flex gap-2">
                    <input type="file" id="file-upload" className="hidden" accept=".csv,.json" onChange={handleFileUpload} />
                    <Button onClick={() => document.getElementById('file-upload')?.click()}>
                        <Upload className="h-4 w-4 mr-2" /> Upload Dataset
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Dataset List */}
                <Card className="col-span-1 h-[600px] shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Datasets</CardTitle>
                        <CardDescription>Select a file to preview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {datasets.map(d => (
                                <div
                                    key={d.id}
                                    onClick={() => loadData(d)}
                                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors flex justify-between items-center ${selectedDataset?.id === d.id ? 'bg-muted border-primary' : ''}`}
                                >
                                    <div className="flex items-center gap-2 font-medium">
                                        <FileSpreadsheet className="h-4 w-4 text-green-500" />
                                        <div className="overflow-hidden">
                                            <div className="truncate w-[150px]">{d.name}</div>
                                            <div className="text-xs text-muted-foreground">{d.rowCount} Rows • {d.type.toUpperCase()}</div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-blue-500" onClick={(e) => { e.stopPropagation(); window.open(`${API_BASE_URL}/api/test-data/${d.id}/download`); }}>
                                        <ArrowDownToLine className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={(e) => { e.stopPropagation(); setDatasetToDelete(d.id); }}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                            {datasets.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">
                                    No datasets uploaded.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Data Grid */}
                <Card className="col-span-2 min-h-[600px] shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Data Preview</CardTitle>
                        <CardDescription>
                            {selectedDataset ? `Showing content for ${selectedDataset.name}` : "Select a dataset to view rows"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedDataset && rows.length > 0 ? (
                            <div className="overflow-auto max-h-[500px] border rounded-md">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted sticky top-0">
                                        <tr>
                                            {Object.keys(rows[0]).map(header => (
                                                <th key={header} className="p-2 text-left font-medium border-b">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/50 border-b last:border-0">
                                                {Object.values(row).map((val: any, j) => (
                                                    <td key={j} className="p-2 truncate max-w-[200px]">{String(val)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                                <FileSpreadsheet className="h-12 w-12 mb-4 opacity-50" />
                                Select a dataset to preview data.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
