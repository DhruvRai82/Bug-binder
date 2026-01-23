import React from 'react';
import { Bug } from '@/types';
import { BugCard } from './BugCard';
import { Search } from 'lucide-react';

interface BugListProps {
    bugs: Bug[];
    onSelect: (bug: Bug) => void;
    filterQuery: string;
}

export function BugList({ bugs, onSelect, filterQuery }: BugListProps) {
    const filteredBugs = bugs.filter(b =>
        !filterQuery ||
        b.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
        b.bugId.toLowerCase().includes(filterQuery.toLowerCase())
    );

    if (filteredBugs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8 space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                    <p className="text-base font-medium">No results found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search terms</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24">
            {filteredBugs.map(bug => (
                <BugCard
                    key={bug.id}
                    bug={bug}
                    onClick={() => onSelect(bug)}
                />
            ))}
        </div>
    );
}
