import React from 'react';
import { MousePointerClick, Globe, Type, Clock, Camera, CheckCircle, AlertTriangle, GitBranch, Repeat } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export const FlowSidebar = () => {
    const onDragStart = (event: React.DragEvent, nodeType: string, action: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/action', action);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-64 bg-background border-r h-full flex flex-col shrink-0">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-sm">Components</h2>
                <p className="text-xs text-muted-foreground">Drag to canvas</p>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">

                    {/* Browser Actions */}
                    <div>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Browser</h3>
                        <div className="grid gap-2">
                            <DraggableItem label="Navigate" icon={<Globe className="w-4 h-4 text-blue-500" />} type="navigate" onDragStart={onDragStart} />
                            <DraggableItem label="Click" icon={<MousePointerClick className="w-4 h-4 text-green-500" />} type="click" onDragStart={onDragStart} />
                            <DraggableItem label="Type Text" icon={<Type className="w-4 h-4 text-purple-500" />} type="type" onDragStart={onDragStart} />
                            <DraggableItem label="Screenshot" icon={<Camera className="w-4 h-4 text-pink-500" />} type="screenshot" onDragStart={onDragStart} />
                        </div>
                    </div>

                    <Separator />

                    {/* Logic */}
                    <div>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Logic</h3>
                        <div className="grid gap-2">
                            <DraggableItem label="Wait" icon={<Clock className="w-4 h-4 text-orange-500" />} type="wait" onDragStart={onDragStart} />
                            <DraggableItem label="If / Else" icon={<GitBranch className="w-4 h-4 text-yellow-500" />} type="condition" onDragStart={onDragStart} />
                            <DraggableItem label="Loop" icon={<Repeat className="w-4 h-4 text-cyan-500" />} type="loop" onDragStart={onDragStart} />
                        </div>
                    </div>

                    <Separator />

                    {/* Assertions */}
                    <div>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Assertions</h3>
                        <div className="grid gap-2">
                            <DraggableItem label="Assert Visible" icon={<CheckCircle className="w-4 h-4 text-emerald-500" />} type="assert_visible" onDragStart={onDragStart} />
                            <DraggableItem label="Assert Text" icon={<SameTextIcon />} type="assert_text" onDragStart={onDragStart} />
                        </div>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
};

const DraggableItem = ({ label, icon, type, onDragStart }: any) => (
    <div
        className="flex items-center gap-3 p-2 rounded-md border bg-card hover:bg-accent/50 cursor-grab active:cursor-grabbing shadow-sm transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, 'default', type)}
    >
        <div className="p-1.5 bg-muted rounded-md">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
    </div>
);

const SameTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M7 7h10v10" /><path d="M7 17V7" /></svg>
)
