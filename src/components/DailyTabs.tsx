import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyTabsProps {
  dates: string[];
  activeDate: string;
  onDateSelect: (date: string) => void;
  onAddDay: () => void;
}

export function DailyTabs({ dates, activeDate, onDateSelect, onAddDay }: DailyTabsProps) {
  const formatTabDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className="bg-background border-b border-border">
      <div className="flex items-center overflow-x-auto scrollbar-hide">
        {dates.map((date) => (
          <button
            key={date}
            onClick={() => onDateSelect(date)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeDate === date 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <Calendar className="h-4 w-4" />
            {formatTabDate(date)}
          </button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddDay}
          className="ml-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}