import React, { useState } from 'react';
import { Layers, Database, Clock, Eye } from 'lucide-react';
import MobileTestData from './MobileTestData';
import MobileSchedules from './MobileSchedules';
import MobileVisualTests from './MobileVisualTests';
import { cn } from '@/lib/utils';
import { MobileNavBar } from '@/components/common/MobileNavBar';

export default function MobileTestHub() {
    const [activeTab, setActiveTab] = useState<'data' | 'schedules' | 'visual'>('data');

    return (
        <div className="min-h-screen bg-background pb-20">
            <MobileNavBar />

            <div className="p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <Layers className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">TestFlow Automation</h1>
                        <p className="text-sm text-muted-foreground">Manage data & schedules</p>
                    </div>
                </div>

                {/* Segmented Control */}
                <div className="bg-muted/50 p-1 rounded-xl flex gap-1">
                    <button
                        onClick={() => setActiveTab('data')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                            activeTab === 'data'
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-background/50"
                        )}
                    >
                        <Database className="h-4 w-4" />
                        <span>Data</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('schedules')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                            activeTab === 'schedules'
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-background/50"
                        )}
                    >
                        <Clock className="h-4 w-4" />
                        <span>Timing</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('visual')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                            activeTab === 'visual'
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-background/50"
                        )}
                    >
                        <Eye className="h-4 w-4" />
                        <span>Visual</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === 'data' && <MobileTestData />}
                    {activeTab === 'schedules' && <MobileSchedules />}
                    {activeTab === 'visual' && <MobileVisualTests />}
                </div>
            </div>
        </div>
    );
}
