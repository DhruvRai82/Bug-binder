import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProject } from '@/context/ProjectContext';
import { api } from '@/lib/api';
import { FileSpreadsheet, Trash2, Database, Wand2, Upload, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from '@/components/common/EmptyState';
import { generateMockData, SchemaField, FIELD_TYPES } from '@/lib/mockDataGenerator';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from 'uuid';

export default function TestData() {
    const { selectedProject } = useProject();
    const [datasets, setDatasets] = useState<any[]>([]);
    const [selectedDataset, setSelectedDataset] = useState<any>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Mock Data Generator State
    const [mockGenOpen, setMockGenOpen] = useState(false);

    // Fixed: Use valid 'name' type instead of 'fullName'/'firstName'
    const [schema, setSchema] = useState<SchemaField[]>([
        { id: '1', name: 'User ID', type: 'uuid' },
        { id: '2', name: 'Full Name', type: 'name' },
        { id: '3', name: 'Email', type: 'email' },
    ]);
    const [rowCount, setRowCount] = useState(50);
    const [datasetName, setDatasetName] = useState("Mock Users");

    useEffect(() => {
        if (selectedProject) fetchDatasets();
    }, [selectedProject]);

    const fetchDatasets = async () => {
        try {
            const data = await api.get(`/api/test-data?projectId=${selectedProject?.id}`);
            setDatasets(data);
            // Auto-select first if none selected
            if (data.length > 0 && !selectedDataset) {
                handleSelectDataset(data[0]);
            }
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
        try {
            await api.delete(`/api/test-data/${id}?projectId=${selectedProject?.id}`);
            toast.success("Dataset deleted");
            const updated = datasets.filter(d => d.id !== id);
            setDatasets(updated);
            if (selectedDataset?.id === id) {
                setSelectedDataset(null);
                setPreviewData([]);
            }
        } catch {
            toast.error("Failed to delete");
        }
    };

    // Schema Builder Handlers
    // Fixed: Use valid 'name' type default
    const addField = () => setSchema([...schema, { id: uuidv4(), name: 'New Field', type: 'name' }]);
    const removeField = (id: string) => setSchema(schema.filter(f => f.id !== id));
    // Fixed: Explicit type casting for values from Select to match SchemaField['type']
    const updateField = (id: string, key: keyof SchemaField, value: string) => {
        setSchema(schema.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', selectedProject?.id || '');

        try {
            await api.post('/api/test-data/upload', formData);
            toast.success("Dataset uploaded successfully");
            fetchDatasets();
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload dataset");
        } finally {
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleGenerate = async () => {
        try {
            const data = generateMockData(schema, rowCount);
            // Convert to CSV or JSON script? For now, let's just save as JSON array
            // We need a backend endpoint that accepts raw JSON to save as a file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const file = new File([blob], `${datasetName}.json`, { type: 'application/json' });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('projectId', selectedProject?.id || '');

            await api.post('/api/test-data/upload', formData); // Reusing upload endpoint
            toast.success("Mock Data Generated & Saved");
            setMockGenOpen(false);
            fetchDatasets();
        } catch (e) {
            console.error(e);
            toast.error("Failed to generate data");
        }
    };

    return (
        <div className="h-full flex flex-col p-8 pt-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 flex-shrink-0">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Data Management
                    </h1>
                    <p className="text-muted-foreground max-w-lg">
                        Manage test datasets, upload CSVs, or generate realistic mock scenarios for your tests.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Dialog open={mockGenOpen} onOpenChange={setMockGenOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 shadow-sm"><Wand2 className="h-4 w-4 mr-2" /> Mock Generator</Button>
                        </DialogTrigger>
                        <DialogContent
                            className="max-w-4xl max-h-[90vh] flex flex-col border-0 bg-card/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden"
                            onInteractOutside={(e) => e.preventDefault()}
                        >
                            <DialogHeader className="px-6 py-4 border-b bg-muted/20 backdrop-blur-md sticky top-0 z-10 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-emerald-500/10 rounded-md">
                                        <Wand2 className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-bold">
                                            Mock Data Generator
                                        </DialogTitle>
                                        <DialogDescription className="mt-1">
                                            Design a schema and generate realistic test data instantly.
                                        </DialogDescription>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setMockGenOpen(false)} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </DialogHeader>
                            {/* ... kept inner dialog logic same for brevity, it uses grid layout which is fine ... */}
                            <div className="flex-1 overflow-hidden grid grid-cols-2 gap-0">
                                <div className="space-y-4 overflow-y-auto p-6 border-r bg-background/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider mb-2">Schema Definition</h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2 group">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground group-focus-within:text-blue-600 transition-colors">Dataset Name</Label>
                                            <Input
                                                value={datasetName}
                                                onChange={e => setDatasetName(e.target.value)}
                                                className="bg-background/50 border-input/50 focus:border-blue-500 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2 group">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground group-focus-within:text-blue-600 transition-colors">Row Count</Label>
                                            <Input
                                                type="number"
                                                value={rowCount}
                                                onChange={e => setRowCount(parseInt(e.target.value))}
                                                max={1000}
                                                className="bg-background/50 border-input/50 focus:border-blue-500 transition-all font-mono"
                                            />
                                        </div>
                                        <div className="space-y-3 pt-4 border-t border-dashed">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs font-semibold text-muted-foreground">Fields Configuration</Label>
                                                <Button size="sm" variant="outline" onClick={addField} className="h-7 text-xs border-dashed border-blue-200 hover:border-blue-400 text-blue-600 hover:bg-blue-50"><Plus className="h-3 w-3 mr-1" /> Add Field</Button>
                                            </div>
                                            <div className="space-y-2">
                                                {schema.map((field, idx) => (
                                                    <div key={field.id} className="flex gap-2 items-center group/field animate-in slide-in-from-left-2 duration-300">
                                                        <Input
                                                            className="h-9 flex-1 bg-background/50 border-input/50 focus:border-blue-500 transition-all text-sm"
                                                            value={field.name}
                                                            onChange={e => updateField(field.id, 'name', e.target.value)}
                                                            placeholder="Field Name"
                                                        />
                                                        <Select value={field.type} onValueChange={v => updateField(field.id, 'type', v)}>
                                                            <SelectTrigger className="h-9 w-[140px] bg-background/50 border-input/50"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                {FIELD_TYPES.map((typeOption) => (
                                                                    <SelectItem key={typeOption.value} value={typeOption.value}>{typeOption.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-50" onClick={() => removeField(field.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col bg-muted/10 p-6 overflow-hidden">
                                    <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Database className="h-4 w-4 text-muted-foreground" />
                                        Live Preview <span className="text-[10px] text-muted-foreground font-normal normal-case">(First 5 Rows)</span>
                                    </h4>
                                    <div className="flex-1 bg-card rounded-xl border shadow-inner text-xs overflow-auto p-4 font-mono relative group">
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Badge variant="outline" className="bg-background/80 backdrop-blur">JSON Preview</Badge>
                                        </div>
                                        <pre className="text-muted-foreground">
                                            {JSON.stringify(generateMockData(schema, 5), null, 2)}
                                        </pre>
                                    </div>
                                    <Button onClick={handleGenerate} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 py-6 text-md font-semibold">
                                        <Wand2 className="h-5 w-5 mr-2" /> Generate & Save Dataset
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv,.json"
                        onChange={handleFileUpload}
                    />
                    <Button onClick={() => fileInputRef.current?.click()} className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/20">
                        <Upload className="h-4 w-4 mr-2" /> Upload CSV/JSON
                    </Button>
                </div>
            </div>

            {/* Main Content Layout - Premium Glass Cards */}
            {datasets.length === 0 ? (
                <EmptyState
                    icon={Database}
                    title="No Data Available"
                    description="Upload a CSV/JSON file or generate mock data to get started."
                    actionLabel="Generate Mock Data"
                    onAction={() => setMockGenOpen(true)}
                />
            ) : (
                <div className="flex-1 min-h-0 flex gap-6">
                    {/* Left Sidebar: Dataset List */}
                    <Card className="w-[320px] flex flex-col border-0 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                        <CardHeader className="pb-3 px-5 pt-5 border-b bg-emerald-50/50 dark:bg-emerald-900/10">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Your Datasets</CardTitle>
                        </CardHeader>
                        <ScrollArea className="flex-1 bg-transparent">
                            <div className="p-3 space-y-2">
                                {datasets.map(dataset => (
                                    <div
                                        key={dataset.id}
                                        onClick={() => handleSelectDataset(dataset)}
                                        className={`group px-4 py-3 rounded-xl text-sm font-medium cursor-pointer flex justify-between items-center transition-all duration-200 ${selectedDataset?.id === dataset.id
                                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md transform scale-[1.02]'
                                            : 'hover:bg-white/60 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 truncate">
                                            <div className={`p-1.5 rounded-lg ${selectedDataset?.id === dataset.id ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                                                <FileSpreadsheet className={`h-4 w-4 ${selectedDataset?.id === dataset.id ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                                            </div>
                                            <span className="truncate max-w-[150px]">{dataset.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-full ${selectedDataset?.id === dataset.id ? 'text-white hover:bg-white/20' : 'text-red-500 hover:bg-red-50'}`}
                                            onClick={(e) => handleDeleteDataset(dataset.id, e)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </Card>

                    {/* Right Main: Data Preview */}
                    <Card className="flex-1 flex flex-col border-0 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                        <CardHeader className="pb-3 px-6 pt-5 border-b bg-emerald-50/30 dark:bg-emerald-900/5 flex flex-row justify-between items-center">
                            <div>
                                <CardTitle className="text-base flex items-center gap-2 text-foreground/80">
                                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-md">
                                        <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    {selectedDataset?.name || 'Select a dataset'}
                                </CardTitle>
                                <CardDescription className="text-xs mt-1 ml-9">
                                    {previewData.length > 0 ? `${previewData.length} records loaded for preview` : 'No preview available'}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 min-h-0 relative">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-3 text-emerald-600/60">
                                    <div className="h-8 w-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm font-medium">Fetching Data...</span>
                                </div>
                            ) : previewData.length > 0 ? (
                                <ScrollArea className="h-full">
                                    <div className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent border-b border-emerald-100/50 dark:border-emerald-900/20">
                                                    {Object.keys(previewData[0]).map(k => (
                                                        <TableHead key={k} className="h-10 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/20 sticky top-0 z-10 first:pl-6">{k}</TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {previewData.map((row, i) => (
                                                    <TableRow key={i} className="border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10">
                                                        {Object.values(row).map((v: any, j) => (
                                                            <TableCell key={j} className="py-2.5 text-xs text-muted-foreground truncate max-w-[200px] first:pl-6">{String(v)}</TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 gap-4">
                                    <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center">
                                        <Database className="h-10 w-10 opacity-20" />
                                    </div>
                                    <span className="text-sm">Select a dataset to view its content.</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
