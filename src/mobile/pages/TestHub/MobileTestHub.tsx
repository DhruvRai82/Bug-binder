import React, { useState } from 'react';
import { Layers, Database, Clock, Eye, GitGraph, Box } from 'lucide-react';
import MobileTestData from './MobileTestData';
import MobileSchedules from './MobileSchedules';
import MobileVisualTests from './MobileVisualTests';
import { MobileSuiteList } from '@/mobile/components/test-hub/MobileSuiteList';
import { MobileFlowList } from '@/mobile/components/test-hub/MobileFlowList';
import { cn } from '@/lib/utils';
import { MobileNavBar } from '@/components/common/MobileNavBar';

export default function MobileTestHub() {
    const [activeTab, setActiveTab] = useState<'suites' | 'flows' | 'data' | 'schedules' | 'visual'>('suites');

    const tabs = [
        { id: 'suites', label: 'Suites', icon: Box },
        { id: 'flows', label: 'Flows', icon: GitGraph },
        { id: 'schedules', label: 'Schedule', icon: Clock },
        { id: 'data', label: 'Data', icon: Database },
        { id: 'visual', label: 'Visual', icon: Eye },
    ] as const;

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
                        <h1 className="text-2xl font-bold tracking-tight">Test Hub</h1>
                        <p className="text-sm text-muted-foreground">Manage suites & automation</p>
                    </div>
                </div>

                {/* Scrollable Tabs */}
                <div className="bg-muted/30 p-1 rounded-xl flex gap-1 overflow-x-auto scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 min-w-[80px] flex flex-col items-center justify-center gap-1.5 py-2 text-[10px] font-medium rounded-lg transition-all",
                                activeTab === tab.id
                                    ? "bg-background text-foreground shadow-sm shadow-indigo-500/10"
                                    : "text-muted-foreground hover:bg-background/50"
                            )}
                        >
                            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-indigo-600" : "text-muted-foreground")} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === 'suites' && <MobileSuiteList />}
                    {activeTab === 'flows' && <MobileFlowList />}
                    {activeTab === 'data' && <MobileTestData />}
                    {activeTab === 'schedules' && <MobileSchedules />}
                    {activeTab === 'visual' && <MobileVisualTests />}
                </div>
            </div>
        </div>
    );
}
