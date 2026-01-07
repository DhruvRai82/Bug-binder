import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center h-full min-h-[400px] animate-in fade-in zoom-in-95 duration-500 ${className}`}>
            <div className="bg-muted/30 p-6 rounded-full mb-6">
                <Icon className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{title}</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction} className="mt-8" size="lg">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
