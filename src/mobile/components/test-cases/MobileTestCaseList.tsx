import React from 'react';
import { MobileTestCaseCard } from './MobileTestCaseCard';
import { TestCase } from '@/types';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileTestCaseListProps {
    testCases: TestCase[];
    onSelect: (tc: TestCase) => void;
    filterQuery?: string;
}

export function MobileTestCaseList({ testCases, onSelect, filterQuery = '' }: MobileTestCaseListProps) {
    const [statusFilter, setStatusFilter] = React.useState<string>('All');

    const filteredCases = testCases.filter(tc => {
        // Text Search
        const matchesSearch = !filterQuery ||
            tc.testScenario.toLowerCase().includes(filterQuery.toLowerCase()) ||
            tc.testCaseId.toLowerCase().includes(filterQuery.toLowerCase());

        // Status Filter
        const matchesStatus = statusFilter === 'All' || tc.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const filters = ['All', 'Pass', 'Fail', 'Blocked', 'Not Executed'];

    return (
        <div className="flex flex-col h-full bg-muted/5">
            {/* Filter Chips */}
            <div className="flex overflow-x-auto p-3 gap-2 scrollbar-none sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                            statusFilter === filter
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-card text-muted-foreground border-input hover:bg-muted"
                        )}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
                {filteredCases.length > 0 ? (
                    filteredCases.map(tc => (
                        <MobileTestCaseCard
                            key={tc.id}
                            testCase={tc}
                            onClick={() => onSelect(tc)}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                        <FileText className="h-12 w-12 mb-3 stroke-1" />
                        <p className="text-sm font-medium">No test cases found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
