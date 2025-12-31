import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';

export function ReportsView() {
    const { selectedProject } = useProject();
    const [reports, setReports] = useState<any[]>([]);
    const [filteredReports, setFilteredReports] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (selectedProject) {
            fetchReports();
        }
    }, [selectedProject]);

    useEffect(() => {
        let result = reports;

        if (filterStatus !== 'all') {
            result = result.filter(r => r.status.toLowerCase() === filterStatus.toLowerCase());
        }

        if (searchQuery) {
            result = result.filter(r =>
                r.scriptName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.module.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredReports(result);
    }, [filterStatus, searchQuery, reports]);

    const fetchReports = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/recorder/reports?projectId=${selectedProject?.id}`);
            if (response.ok) {
                const data = await response.json();
                setReports(data);
                setFilteredReports(data);
            }
        } catch (error) {
            console.error('Failed to load reports:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'passed':
                return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Passed</Badge>;
            case 'failed':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
            default:
                return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> {status}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Input
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="passed">Passed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Script Name</TableHead>
                            <TableHead>Module</TableHead>
                            <TableHead>Steps</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Error</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredReports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No reports found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredReports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                                    <TableCell className="font-medium">{report.scriptName}</TableCell>
                                    <TableCell>{report.module}</TableCell>
                                    <TableCell>{report.stepsExecuted} / {report.totalSteps}</TableCell>
                                    <TableCell>{(report.duration / 1000).toFixed(2)}s</TableCell>
                                    <TableCell>{new Date(report.timestamp).toLocaleString()}</TableCell>
                                    <TableCell className="text-red-500 max-w-[200px] truncate" title={report.error}>
                                        {report.error || '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
