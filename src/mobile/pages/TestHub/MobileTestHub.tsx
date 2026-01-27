import React, { useState } from 'react';
import { Layers, Database, Clock, Eye } from 'lucide-react';
import MobileTestData from './MobileTestData';
import MobileSchedules from './MobileSchedules';
import MobileVisualTests from './MobileVisualTests';
import { cn } from '@/lib/utils';
import { MobileNavBar } from '@/components/common/MobileNavBar';

export default function MobileTestHub() {
    const [activeTab, setActiveTab] = useState<'data' | 'schedules' | 'visual'>('data');

    const tabs = [
        { id: 'data', label: 'Test Data', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { id: 'schedules', label: 'Scheduler', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { id: 'visual', label: 'Visual Tests', icon: Eye, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ] as const;

    return (
        <div className="min-h-screen bg-background pb-20">
            <MobileNavBar />

            <div className="p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <Layers className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Automation</h1>
                        <p className="text-sm text-muted-foreground">Manage data & schedules</p>
                    </div>
                </div>

                {/* Modern Pill Tabs */}
                <div className="flex p-1 bg-muted/40 rounded-xl gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-background text-foreground shadow-sm scale-[1.02]"
                                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground/80"
                            )}
                        >
                            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? tab.color : "opacity-70")} />
                            <span className={cn(activeTab !== tab.id && "hidden sm:inline")}>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area - Animated */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[50vh]">
                    {activeTab === 'data' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-lg flex items-center gap-2">
                                    <Database className="h-5 w-5 text-emerald-500" />
                                    Data Management
                                </h2>
                            </div>
                            <MobileTestData />
                        </div>
                    )}
                    {activeTab === 'schedules' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    Scheduler
                                </h2>
                            </div>
                            <MobileSchedules />
                        </div>
                    )}
                    {activeTab === 'visual' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-lg flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-purple-500" />
                                    Visual Regression
                                </h2>
                            </div>
                            <MobileVisualTests />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
