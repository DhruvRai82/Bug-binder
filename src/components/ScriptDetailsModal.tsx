import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MousePointer2, Type, Globe } from 'lucide-react';

interface ScriptDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    script: any;
}

export function ScriptDetailsModal({ isOpen, onClose, script }: ScriptDetailsModalProps) {
    if (!script) return null;

    const getIcon = (action: string) => {
        switch (action) {
            case 'click': return <MousePointer2 className="h-4 w-4 text-blue-500" />;
            case 'type': return <Type className="h-4 w-4 text-green-500" />;
            case 'navigate': return <Globe className="h-4 w-4 text-purple-500" />;
            default: return <MousePointer2 className="h-4 w-4" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{script.name}</DialogTitle>
                    <DialogDescription>
                        Module: {script.module} • {script.steps.length} steps
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[60vh] mt-4 pr-4">
                    <div className="space-y-3">
                        {script.steps.map((step: any, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
                                <div className="mt-1 bg-muted p-1.5 rounded-md">
                                    {getIcon(step.action)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold capitalize">{step.action}</span>
                                    </div>
                                    <div className="text-sm font-mono bg-muted/50 p-1.5 rounded text-muted-foreground break-all">
                                        {step.selector || step.url}
                                    </div>
                                    {step.value && (
                                        <div className="mt-1 text-sm text-blue-500">
                                            Value: "{step.value}"
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs font-mono text-muted-foreground opacity-50">
                                    #{index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
