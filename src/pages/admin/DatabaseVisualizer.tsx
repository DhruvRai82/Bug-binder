import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Database, HardDrive, Server, Loader2, Table } from 'lucide-react';
import { toast } from 'sonner';

interface TableDump {
    tableName: string;
    rows: any[];
}

interface DatabaseDump {
    source: 'local' | 'supabase';
    tables: TableDump[];
}

export default function DatabaseVisualizer() {
    const [source, setSource] = useState<'local' | 'supabase'>('local');
    const [data, setData] = useState<DatabaseDump | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [source]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/admin-inspector/database-dump?source=${source}`);
            setData(res);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch database dump");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                        <Database className="h-8 w-8 text-blue-500" />
                        Database Visualizer
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Inspector Mode: View raw data from your hybrid persistence layer.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-card p-1 rounded-lg border shadow-sm">
                    <Button
                        variant={source === 'local' ? 'default' : 'ghost'}
                        onClick={() => setSource('local')}
                        className="gap-2"
                    >
                        <HardDrive className="h-4 w-4" /> Local JSON
                    </Button>
                    <Button
                        variant={source === 'supabase' ? 'default' : 'ghost'}
                        onClick={() => setSource('supabase')}
                        className="gap-2"
                    >
                        <Server className="h-4 w-4" /> Supabase Cloud
                    </Button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="h-[600px] flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : data ? (
                <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
                    {data.tables.map((table) => (
                        <TableCard key={table.tableName} table={table} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-muted-foreground">
                    No data loaded.
                </div>
            )}
        </div>
    );
}

function TableCard({ table }: { table: TableDump }) {
    if (!table.rows || !Array.isArray(table.rows) || table.rows.length === 0) return null;

    const firstRow = table.rows.find(r => r !== null && r !== undefined);
    if (!firstRow) return null; // All rows are null/undefined

    let columns: string[] = [];
    if (typeof firstRow === 'object') {
        columns = Object.keys(firstRow);
    } else {
        // Handle primitive arrays (e.g. ['a', 'b'])
        columns = ['Value'];
    }

    return (
        <Card className="break-inside-avoid border-t-4 border-t-primary shadow-md hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Table className="h-4 w-4 text-muted-foreground" />
                        {table.tableName}
                    </CardTitle>
                    <Badge variant="outline">{table.rows.length} rows</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md overflow-hidden bg-background">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr>
                                    {columns.slice(0, 5).map(col => (
                                        <th key={col} className="px-3 py-2 whitespace-nowrap">
                                            {col}
                                        </th>
                                    ))}
                                    {columns.length > 5 && <th className="px-3 py-2">...</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {table.rows.slice(0, 10).map((row, i) => {
                                    const isPrimitive = typeof row !== 'object' || row === null;
                                    return (
                                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                                            {isPrimitive ? (
                                                <td className="px-3 py-2 truncate">
                                                    <ValueRenderer value={row} colName="Value" />
                                                </td>
                                            ) : (
                                                columns.slice(0, 5).map(col => (
                                                    <td key={col} className="px-3 py-2 max-w-[150px] truncate" title={getStringValue(row[col])}>
                                                        <ValueRenderer value={row[col]} colName={col} />
                                                    </td>
                                                ))
                                            )}
                                            {columns.length > 5 && <td className="px-3 py-2 text-muted-foreground">...</td>}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {table.rows.length > 10 && (
                        <div className="p-2 text-center text-xs text-muted-foreground bg-muted/20">
                            Showing 10 of {table.rows.length} rows
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function getStringValue(val: any): string {
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
}

function ValueRenderer({ value, colName }: { value: any, colName: string }) {
    // Relationship highlighting
    if (colName === 'user_id' || colName === 'userId') {
        return <span className="text-pink-500 font-mono text-xs">{String(value).substring(0, 8)}...</span>;
    }
    if (colName === 'project_id' || colName === 'projectId') {
        return <span className="text-blue-500 font-mono text-xs">{String(value).substring(0, 8)}...</span>;
    }
    if (colName === 'id') {
        return <span className="font-mono text-muted-foreground text-xs">{String(value).substring(0, 8)}...</span>;
    }

    if (typeof value === 'boolean') {
        return value ? <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">true</Badge> : <Badge variant="outline">false</Badge>;
    }

    if (typeof value === 'object' && value !== null) {
        return <span className="text-xs text-muted-foreground italic">{JSON.stringify(value).substring(0, 20)}...</span>;
    }

    return <span>{String(value)}</span>;
}
