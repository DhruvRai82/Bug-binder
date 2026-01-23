import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sparkles, Loader2 } from 'lucide-react';

interface MobileAIGenDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (prompt: string) => Promise<void>;
    isGenerating: boolean;
}

export function MobileAIGenDialog({ open, onOpenChange, onGenerate, isGenerating }: MobileAIGenDialogProps) {
    const [prompt, setPrompt] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        await onGenerate(prompt);
        setPrompt('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] rounded-2xl border-0 bg-background/95 backdrop-blur-xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                        <div className="p-1.5 bg-indigo-500/10 rounded-md">
                            <Sparkles className="h-5 w-5 text-indigo-600" />
                        </div>
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            AI Suite Gen
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Describe the flow (e.g., "User login with invalid password"). We'll handle the rest.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <Textarea
                        placeholder="e.g. User adds item to cart, goes to checkout. If out of stock, show error..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={6}
                        className="bg-muted/50 border-transparent focus:border-indigo-500 font-medium text-sm resize-none"
                    />
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Magic happening...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate Cases
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
