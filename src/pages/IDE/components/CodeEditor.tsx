import Editor from '@monaco-editor/react';
import { FileNode } from '../types';
import { useTheme } from '@/components/common/ThemeProvider';
import { Loader2 } from 'lucide-react';

interface CodeEditorProps {
    file: FileNode | null;
    onChange: (value: string | undefined) => void;
}

export function CodeEditor({ file, onChange }: CodeEditorProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (!file) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-background text-muted-foreground gap-2">
                <FileCodeIcon className="w-12 h-12 opacity-20" />
                <p>Select a file to start editing</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-background pt-2">
            <Editor
                key={file.id}
                height="100%"
                defaultLanguage={getLanguage(file.name, file.language)}
                value={file.content} // Controlled or Uncontrolled? Using value makes it controlled but might lag. Using value + onChange is standard.
                theme={isDark ? "vs-dark" : "light"}
                path={file.name}
                onChange={onChange}
                loading={<Loader2 className="w-8 h-8 animate-spin text-primary" />}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 10 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    fontLigatures: true,
                }}
            />
        </div>
    );
}

function FileCodeIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="m10 13-2 2 2 2" />
            <path d="m14 17 2-2-2-2" />
        </svg>
    )
}

function getLanguage(filename: string, fallback?: string): string {
    if (filename.endsWith('.java')) return 'java';
    if (filename.endsWith('.py')) return 'python';
    if (filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    return fallback || 'typescript'; // Default to TS if unknown
}
