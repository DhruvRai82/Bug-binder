import { useState } from 'react';
import { Database, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import TestData from "./TestData";
import Schedules from "./Schedules";
import VisualTests from "./VisualTests";

type ViewMode = 'data' | 'schedule' | 'visual';

export default function TestHub() {
    const [view, setView] = useState<ViewMode>('data');

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col relative bg-muted/5">

            {/* Top Navigation Bar - Floating Island Design */}
            <div className="absolute top-4 left-0 right-0 z-30 flex justify-center pointer-events-none">
                <div className="bg-background/80 backdrop-blur-md border shadow-lg rounded-full p-1.5 flex items-center gap-2 pointer-events-auto transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary/20">

                    <button
                        onClick={() => setView('data')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-full text-base font-semibold transition-all duration-300",
                            view === 'data'
                                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md transform scale-100"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105"
                        )}
                    >
                        <Database className={cn("w-5 h-5 transition-transform duration-300", view === 'data' && "scale-110")} />
                        <span>Test Data</span>
                    </button>

                    <div className="w-px h-6 bg-border/50 mx-1" />

                    <button
                        onClick={() => setView('schedule')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-full text-base font-semibold transition-all duration-300",
                            view === 'schedule'
                                ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md transform scale-100"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105"
                        )}
                    >
                        <Clock className={cn("w-5 h-5 transition-transform duration-300", view === 'schedule' && "scale-110")} />
                        <span>Scheduler</span>
                    </button>

                    <div className="w-px h-6 bg-border/50 mx-1" />

                    <button
                        onClick={() => setView('visual')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-full text-base font-semibold transition-all duration-300",
                            view === 'visual'
                                ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md transform scale-100"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105"
                        )}
                    >
                        <Eye className={cn("w-5 h-5 transition-transform duration-300", view === 'visual' && "scale-110")} />
                        <span>Visual Tests</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative pt-0">
                {/* 1. Test Data View */}
                <div className={cn("h-full w-full absolute inset-0 transition-opacity duration-300 p-4 pt-20", view === 'data' ? "opacity-100 z-10" : "opacity-0 pointer-events-none")}>
                    {view === 'data' && <TestData />}
                </div>

                {/* 2. Scheduler View */}
                <div className={cn("h-full w-full absolute inset-0 transition-opacity duration-300 p-4 pt-20", view === 'schedule' ? "opacity-100 z-10" : "opacity-0 pointer-events-none")}>
                    {view === 'schedule' && <Schedules />}
                </div>

                {/* 3. Visual Tests View */}
                <div className={cn("h-full w-full absolute inset-0 transition-opacity duration-300 p-4 pt-20", view === 'visual' ? "opacity-100 z-10" : "opacity-0 pointer-events-none")}>
                    {view === 'visual' && <VisualTests />}
                </div>
            </div>
        </div>
    );
}
