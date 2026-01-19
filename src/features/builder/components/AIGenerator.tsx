import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AIGeneratorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (nodes: any[], edges: any[]) => void;
}

export function AIGenerator({ open, onOpenChange, onGenerate }: AIGeneratorProps) {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);

        try {
            // Call AI Endpoint
            // NOTE: Using a placeholder endpoint or simulation for now if specific AI route isn't ready
            // For now, let's simulate a response to show the UX

            // SIMULATION (Remove this when endpoint is ready)
            // await new Promise(r => setTimeout(r, 2000));
            // const mockNodes = [
            //     { id: '1', position: { x: 100, y: 100 }, data: { action: 'navigate', params: { url: 'https://example.com' }, label: 'Navigate to Site' }, type: 'default' },
            //     { id: '2', position: { x: 100, y: 300 }, data: { action: 'click', params: { selector: '#login' }, label: 'Click Login' }, type: 'default' },
            // ];
            // const mockEdges = [{ id: 'e1-2', source: '1', target: '2' }];
            // onGenerate(mockNodes, mockEdges);

            const res = await api.post('/api/ai/generate-flow', { prompt });
            const { nodes, edges } = res.data || res; // Handle direct/nested
            onGenerate(nodes, edges);

            toast.success("Flow Generated!");
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            toast.error("AI Generation Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        Generate Flow with AI
                    </DialogTitle>
                    <DialogDescription>
                        Describe your test scenario in plain English, and AI will build the flow for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Textarea
                        placeholder="e.g., Navigate to google.com, type 'Playwright' in the search box, and click the first result."
                        className="h-32 resize-none"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                    />
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Generate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
