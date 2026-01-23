import React, { useState } from 'react';
import { Plus, FilePlus, Sparkles, Download, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface MobileFabProps {
    onNewTestCase: () => void;
    onNewPage: () => void;
    onAiGenerate: () => void;
    onImport: () => void;
}

export function MobileFab({ onNewTestCase, onNewPage, onAiGenerate, onImport }: MobileFabProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    const actions = [
        { label: 'Import', icon: <Download className="h-5 w-5" />, onClick: onImport, color: 'bg-emerald-500 text-white' },
        { label: 'AI Gen', icon: <Sparkles className="h-5 w-5" />, onClick: onAiGenerate, color: 'bg-purple-600 text-white' },
        { label: 'New Page', icon: <Archive className="h-5 w-5" />, onClick: onNewPage, color: 'bg-blue-500 text-white' },
        { label: 'New Case', icon: <Plus className="h-5 w-5" />, onClick: onNewTestCase, color: 'bg-indigo-600 text-white' },
    ];

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
                {isOpen && actions.map((action, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "flex items-center gap-3 transition-all duration-300 transform",
                            isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95 pointer-events-none"
                        )}
                        style={{ transitionDelay: `${(actions.length - 1 - idx) * 50}ms` }}
                    >
                        <span className="text-sm font-medium bg-card px-2 py-1 rounded-md shadow-sm border border-border/50">
                            {action.label}
                        </span>
                        <Button
                            size="icon"
                            className={cn("h-12 w-12 rounded-full shadow-lg", action.color)}
                            onClick={() => {
                                action.onClick();
                                setIsOpen(false);
                            }}
                        >
                            {action.icon}
                        </Button>
                    </div>
                ))}

                <Button
                    size="icon"
                    className={cn(
                        "h-14 w-14 rounded-full shadow-xl transition-transform duration-300",
                        isOpen ? "rotate-45 bg-slate-800" : "bg-foreground"
                    )}
                    onClick={toggle}
                >
                    <Plus className="h-6 w-6 text-background" />
                </Button>
            </div>
        </>
    );
}
