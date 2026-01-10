import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Play, History, CalendarClock, TestTube2 } from 'lucide-react';
import RunnerView from './RunnerView';
import HistoryView from './HistoryView';
import SchedulesView from './SchedulesView';

export default function TestOrchestrator() {
    const [activeTab, setActiveTab] = useState("runner");

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
            {/* Top Navigation Bar */}
            <div className="border-b px-6 py-2 bg-card flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-md">
                        <TestTube2 className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-lg font-semibold tracking-tight">Test Orchestrator</h1>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                    <TabsList className="grid w-[400px] grid-cols-3">
                        <TabsTrigger value="runner" className="flex items-center gap-2">
                            <Play className="w-4 h-4" /> Runner
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <History className="w-4 h-4" /> History
                        </TabsTrigger>
                        <TabsTrigger value="schedules" className="flex items-center gap-2">
                            <CalendarClock className="w-4 h-4" /> Schedules
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Spacer for alignment */}
                <div className="w-[150px]"></div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 relative">
                <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'runner' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <RunnerView />
                </div>
                <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'history' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    {activeTab === 'history' && <HistoryView />}
                </div>
                <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'schedules' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    {activeTab === 'schedules' && <SchedulesView />}
                </div>
            </div>
        </div>
    );
}
