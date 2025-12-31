
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

interface TableDump {
    tableName: string;
    rows: any[];
}

interface DatabaseDump {
    source: string;
    tables: TableDump[];
}

const FullDatabaseView = () => {
    const [localData, setLocalData] = useState<DatabaseDump | null>(null);
    const [remoteData, setRemoteData] = useState<DatabaseDump | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /*
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch Local JSON Dump
                const localRes = await api.get('/api/admin-inspector/database-dump?source=local');
                setLocalData(localRes);
                
                // Remote Supabase Removed
            } catch (err: any) {
                setError(err.message || 'Failed to fetch database dump');
            } finally {
                setLoading(false);
            }
        };
    */
    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const localRes = await api.get('/api/admin-inspector/database-dump?source=local');
            setLocalData(localRes);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch database dump');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const DatabaseTable = ({ table }: { table: TableDump }) => (
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                {table.tableName}
                <Badge variant="secondary">{table.rows.length} records</Badge>
            </h3>
            {table.rows.length === 0 ? (
                <div className="text-muted-foreground italic pl-4">Empty Table</div>
            ) : (
                <div className="rounded-md border overflow-x-auto">
                    <pre className="p-4 text-xs font-mono bg-muted/50 max-h-[400px] overflow-y-auto">
                        {JSON.stringify(table.rows, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );

    return (
        <div className="p-8 w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Full Database Viewer</h1>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {error && (
                <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <Tabs defaultValue="local" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="local">Json Backups (Local)</TabsTrigger>
                </TabsList>

                <TabsContent value="local">
                    <Card>
                        <CardHeader>
                            <CardTitle>Local JSON File Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {localData?.tables.map((table) => (
                                <DatabaseTable key={table.tableName} table={table} />
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default FullDatabaseView;
