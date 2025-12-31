import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Sync external value changes to editor content
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            // Only update if the content is different to avoid cursor jumping
            // This is a simple check; for a robust editor, we'd need more complex diffing
            // But for this use case, we'll just set it if it's empty or significantly different
            if (value === '' && editorRef.current.innerHTML === '<br>') {
                return;
            }
            if (document.activeElement !== editorRef.current) {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            editorRef.current.focus();
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className={cn("relative border rounded-md overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-1 border-b bg-muted/50 overflow-x-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => execCommand('bold')}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Bold"
                    type="button"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => execCommand('italic')}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Italic"
                    type="button"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => execCommand('formatBlock', 'H1')}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Heading 1"
                    type="button"
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => execCommand('formatBlock', 'H2')}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Heading 2"
                    type="button"
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => execCommand('insertUnorderedList')}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Bullet List"
                    type="button"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => execCommand('insertOrderedList')}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Numbered List"
                    type="button"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => execCommand('formatBlock', 'BLOCKQUOTE')}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Quote"
                    type="button"
                >
                    <Quote className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => execCommand('formatBlock', 'PRE')}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Code Block"
                    type="button"
                >
                    <Code className="h-4 w-4" />
                </Button>
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="min-h-[150px] p-3 outline-none prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: value }}
            />

            {/* Placeholder (simulated) */}
            {value === '' && !isFocused && (
                <div className="absolute top-[50px] left-3 text-muted-foreground pointer-events-none text-sm">
                    {placeholder}
                </div>
            )}
        </div>
    );
}
