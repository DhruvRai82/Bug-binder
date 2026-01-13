import { useState, useEffect, useMemo } from 'react';
import { SpreadsheetGrid, textEditor } from '@/components/common/DataGrid';
import { Column } from 'react-data-grid';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TestCase } from '@/types';
import { useProject } from '@/context/ProjectContext';
import { format } from 'date-fns';

export default function SpreadsheetLab() {
    const { selectedProject } = useProject();
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    // Default to today for lab purposes
    const selectedDate = format(new Date(), 'yyyy-MM-dd');

    useEffect(() => {
        if (selectedProject) {
            fetchTestCases();
        }
    }, [selectedProject, selectedDate]);

    const fetchTestCases = async () => {
        if (!selectedProject) return;
        setIsLoading(true);
        try {
            // Correct endpoint for project data
            console.log("SPREADSHEET LAB: Fetching daily data from new endpoint...");
            const response: any[] = await api.get(`/api/projects/${selectedProject.id}/daily-data?date=${selectedDate}`);

            // Should return an array of daily data entries. We want the one for this date.
            const dailyData = response.length > 0 ? response[0] : null;

            if (dailyData && dailyData.testCases) {
                // Ensure IDs are strings for the grid
                const processedCases = dailyData.testCases.map((tc: any) => ({
                    ...tc,
                    id: tc.id || tc.testCaseId || Math.random().toString() // Fallback ID
                }));
                setTestCases(processedCases);
            } else {
                setTestCases([]);
            }
        } catch (error) {
            console.error("Failed to fetch test cases:", error);
            // Silent fail or warning only if explicitly desired
            // toast({ variant: "destructive", title: "Could not load test cases" });
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo((): Column<TestCase>[] => [
        { key: 'testCaseId', name: 'ID', width: 80, frozen: true },
        { key: 'module', name: 'Module', width: 120, renderEditCell: textEditor },
        { key: 'testScenario', name: 'Scenario', width: 200, renderEditCell: textEditor },
        { key: 'testCaseDescription', name: 'Description', width: 300, renderEditCell: textEditor },
        { key: 'status', name: 'Status', width: 100, renderEditCell: textEditor },
        { key: 'expectedResult', name: 'Expected Result', width: 200, renderEditCell: textEditor },
        { key: 'actualResult', name: 'Actual Result', width: 200, renderEditCell: textEditor },
        { key: 'comments', name: 'Comments', width: 200, renderEditCell: textEditor },
    ], []);

    const handleSave = async () => {
        if (!selectedProject) return;
        setIsSaving(true);
        try {
            // We need to update the entire daily data object or just the testCases field
            // The backend expects a PUT to /api/projects/:id/daily-data/:date
            await api.put(`/api/projects/${selectedProject.id}/daily-data/${selectedDate}`, {
                testCases: testCases
                // Note: This matches the 'updates' partial expected by updateDailyData service
            });
            toast({ title: "Saved!", description: "Spreadsheet data updated successfully." });
        } catch (error) {
            console.error(error);
            toast({ title: "Save Failed", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (!selectedProject) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground p-8 text-center bg-muted/20">
                <div>
                    <h2 className="text-xl font-semibold mb-2">No Project Selected</h2>
                    <p>Please select a project from the sidebar to view its Spreadsheet Lab.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="h-full flex flex-col space-y-4 p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Spreadsheet Lab 🧪</h1>
                    <p className="text-muted-foreground">Editing Test Cases for {selectedDate}</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="flex-1 border rounded-md overflow-hidden shadow-sm bg-background">
                {testCases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <p>No test cases found for today ({selectedDate}).</p>
                        <p className="text-xs mt-1">Add data via the main Test Cases page first.</p>
                    </div>
                ) : (
                    <SpreadsheetGrid
                        columns={columns}
                        rows={testCases}
                        onRowsChange={setTestCases}
                    />
                )}
            </div>

            <div className="text-xs text-muted-foreground">
                <p>Tip: Double-click a cell to edit. Use Arrow keys to navigate.</p>
            </div>
        </div>
    );
}
