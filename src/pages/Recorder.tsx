import { useState } from 'react';
import { Video, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecorderStudio } from '@/features/recorder/RecorderStudio';
import RecordedScriptsLibrary from "./RecordedScriptsLibrary";

type ViewMode = 'recorder' | 'library';

export default function Recorder() {
    const [view, setView] = useState<ViewMode>('recorder');

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Top Navigation Bar - Floating Island Design */}
            <div className="absolute top-4 left-0 right-0 z-30 flex justify-center pointer-events-none">
                <div className="bg-background/80 backdrop-blur-md border shadow-lg rounded-full p-1.5 flex items-center gap-2 pointer-events-auto transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary/20">

                    <button
                        onClick={() => setView('recorder')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-full text-base font-semibold transition-all duration-300",
                            view === 'recorder'
                                ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md transform scale-100"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105"
                        )}
                    >
                        <Video className={cn("w-5 h-5 transition-transform duration-300", view === 'recorder' && "scale-110")} />
                        <span>Web Recorder</span>
                    </button>

                    <div className="w-px h-6 bg-border/50 mx-1" />

                    <button
                        onClick={() => setView('library')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-full text-base font-semibold transition-all duration-300",
                            view === 'library'
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-100"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105"
                        )}
                    >
                        <Library className={cn("w-5 h-5 transition-transform duration-300", view === 'library' && "scale-110")} />
                        <span>Script Library</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area - Full Screen for each module */}
            <div className="flex-1 overflow-hidden relative bg-muted/5 pt-0">

                {/* 1. Web Recorder View */}
                <div className={cn("h-full w-full absolute inset-0 transition-opacity duration-300", view === 'recorder' ? "opacity-100 z-10" : "opacity-0 pointer-events-none")}>
                    {view === 'recorder' && <RecorderStudio onSaveComplete={() => setView('library')} />}
                </div>

                {/* 2. Library View */}
                <div className={cn("h-full w-full absolute inset-0 transition-opacity duration-300", view === 'library' ? "opacity-100 z-10" : "opacity-0 pointer-events-none")}>
                    {view === 'library' && (
                        <div className="h-full overflow-auto p-4">
                            <RecordedScriptsLibrary />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
