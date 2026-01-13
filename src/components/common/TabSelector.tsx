import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabSelectorProps {
  activeTab: 'testcases' | 'bugs';
  onTabChange: (tab: 'testcases' | 'bugs') => void;
}

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="flex border-b border-border bg-background">
      <Button
        variant="ghost"
        onClick={() => onTabChange('testcases')}
        className={cn(
          "rounded-none border-b-2 border-transparent px-6 py-3",
          activeTab === 'testcases' && "border-primary bg-primary/5 text-primary"
        )}
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Test Cases
      </Button>
      <Button
        variant="ghost"
        onClick={() => onTabChange('bugs')}
        className={cn(
          "rounded-none border-b-2 border-transparent px-6 py-3",
          activeTab === 'bugs' && "border-primary bg-primary/5 text-primary"
        )}
      >
        <Bug className="h-4 w-4 mr-2" />
        Bug Tracking
      </Button>
    </div>
  );
}