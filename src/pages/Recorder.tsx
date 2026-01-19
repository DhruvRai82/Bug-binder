import { useState } from 'react';
import { Video, Library, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecorderStudio } from '@/features/recorder/RecorderStudio';
import RecordedScriptsLibrary from "./RecordedScriptsLibrary";
import { FlowBuilder } from "@/features/builder/FlowBuilder";

type ViewMode = 'recorder' | 'builder' | 'library';

export default function Recorder() {
    const [view, setView] = useState<ViewMode>('recorder');

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Top Navigation Bar */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-center p-2">
                    <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
                        <button
                            onClick={() => setView('recorder')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                                view === 'recorder'
                                    ? "bg-white text-red-600 shadow-sm border border-red-100 dark:bg-zinc-950 dark:border-zinc-800"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <Video className="w-4 h-4" />
                            <span>Web Recorder</span>
                        </button>

                        <div className="w-px h-4 bg-border mx-1" />

                        <button
                            onClick={() => setView('builder')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                                view === 'builder'
                                    ? "bg-white text-indigo-600 shadow-sm border border-indigo-100 dark:bg-zinc-950 dark:border-zinc-800"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <Layers className="w-4 h-4" />
                            <span>Flow Builder</span>
                        </button>

                        <div className="w-px h-4 bg-border mx-1" />

                        <button
                            onClick={() => setView('library')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                                view === 'library'
                                    ? "bg-white text-blue-600 shadow-sm border border-blue-100 dark:bg-zinc-950 dark:border-zinc-800"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <Library className="w-4 h-4" />
                            <span>Script Library</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Full Screen for each module */}
            <div className="flex-1 overflow-hidden p-4 bg-muted/5 relative">

                {/* 1. Web Recorder View */}
                <div className={cn("h-full w-full absolute inset-0 p-4 transition-opacity duration-300", view === 'recorder' ? "opacity-100 z-10" : "opacity-0 pointer-events-none")}>
                    {view === 'recorder' && <RecorderStudio onSaveComplete={() => setView('library')} />}
                </div>

                {/* 2. Flow Builder View */}
                <div className={cn("h-full w-full absolute inset-0 p-4 transition-opacity duration-300", view === 'builder' ? "opacity-100 z-10" : "opacity-0 pointer-events-none")}>
                    {view === 'builder' && <FlowBuilder />}
                </div>

                {/* 3. Library View */}
                <div className={cn("h-full w-full absolute inset-0 p-4 transition-opacity duration-300", view === 'library' ? "opacity-100 z-10" : "opacity-0 pointer-events-none")}>
                    {view === 'library' && (
                        <div className="h-full overflow-auto">
                            <RecordedScriptsLibrary />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
