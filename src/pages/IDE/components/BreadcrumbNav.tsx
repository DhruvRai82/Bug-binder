import { ChevronRight, Home } from 'lucide-react';
import { FileNode } from '../types';
import { cn } from '@/lib/utils';

interface BreadcrumbNavProps {
    path: FileNode[];
    onNavigate: (index: number) => void;
}

export function BreadcrumbNav({ path, onNavigate }: BreadcrumbNavProps) {
    return (
        <nav className="flex items-center gap-1 text-sm">
            {path.map((node, index) => {
                const isLast = index === path.length - 1;

                return (
                    <div key={node.id} className="flex items-center">
                        <div
                            className={cn(
                                "flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors cursor-pointer",
                                isLast ? "font-semibold text-foreground bg-muted" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                            onClick={() => onNavigate(index)}
                        >
                            {index === 0 && <Home className="w-4 h-4" />}
                            <span>{node.name}</span>
                        </div>

                        {!isLast && (
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50 mx-1" />
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
