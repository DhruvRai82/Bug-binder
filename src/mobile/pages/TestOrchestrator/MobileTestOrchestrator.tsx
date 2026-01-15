import React, { useState } from 'react';
import { MobileNavBar } from '@/components/common/MobileNavBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, Play, TestTube2, CalendarClock } from 'lucide-react';
import MobileHistory from './MobileHistory';
import MobileRunner from './MobileRunner';
import MobileOrchestratorSchedules from './MobileOrchestratorSchedules';

export default function MobileTestOrchestrator() {
    const [activeTab, setActiveTab] = useState("activity");

    return (
        <div className="min-h-screen bg-background pb-20">
            <MobileNavBar />

            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <TestTube2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Orchestrator</h1>
                        <p className="text-sm text-muted-foreground">Monitor & Execute</p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="activity">
                            <Activity className="w-4 h-4 mr-2" /> Activity
                        </TabsTrigger>
                        <TabsTrigger value="run">
                            <Play className="w-4 h-4 mr-2" /> Run
                        </TabsTrigger>
                        <TabsTrigger value="schedules">
                            <CalendarClock className="w-4 h-4 mr-2" /> Schedule
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-4">
                        <TabsContent value="activity" className="m-0">
                            <MobileHistory />
                        </TabsContent>
                        <TabsContent value="run" className="m-0">
                            <MobileRunner />
                        </TabsContent>
                        <TabsContent value="schedules" className="m-0">
                            <MobileOrchestratorSchedules />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}

