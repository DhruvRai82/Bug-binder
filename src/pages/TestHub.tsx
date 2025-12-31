import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Clock, Eye, Layers } from "lucide-react";
import TestData from "./TestData";
import Schedules from "./Schedules";
import VisualTests from "./VisualTests";

export default function TestHub() {
    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Layers className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Automation Suite</h1>
                        <p className="text-sm text-muted-foreground">Manage data, schedules, and visual tests in one place.</p>
                    </div>
                </div>

                <Tabs defaultValue="data" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="data" className="flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            <span className="hidden sm:inline">Test Data</span>
                        </TabsTrigger>
                        <TabsTrigger value="schedule" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="hidden sm:inline">Scheduler</span>
                        </TabsTrigger>
                        <TabsTrigger value="visual" className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Visual Tests</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* We mount all contents but hide them with CSS or let Tabs handle unmounting? 
                Radix Tabs (shadcn) handles display. 
                Note: Child pages have their own padding/headers. 
                We might want to pass a prop 'isEmbedded' to hide headers in future, 
                but for now we just render them.
            */}
                    <div className="mt-6">
                        <TabsContent value="data" className="m-0 border-none p-0 outline-none h-full">
                            <TestData />
                        </TabsContent>
                        <TabsContent value="schedule" className="m-0 border-none p-0 outline-none">
                            <Schedules />
                        </TabsContent>
                        <TabsContent value="visual" className="m-0 border-none p-0 outline-none">
                            <VisualTests />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
