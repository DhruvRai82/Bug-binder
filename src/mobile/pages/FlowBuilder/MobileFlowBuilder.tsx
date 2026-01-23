
import React from 'react';
import { MobileNavBar } from '@/components/common/MobileNavBar';
import { Layers, Monitor, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MobileFlowList } from '@/mobile/components/test-hub/MobileFlowList';

export default function MobileFlowBuilder() {
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
                        <h1 className="text-2xl font-bold tracking-tight">Flow Builder</h1>
                        <p className="text-sm text-muted-foreground">Visual Automation Flows</p>
                    </div>
                </div>

                {/* Info Card */}
                <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-200/50">
                    <div className="p-4 flex items-start gap-4">
                        <Monitor className="h-8 w-8 text-blue-600 shrink-0" />
                        <div className="space-y-2">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Desktop Recommended</h3>
                            <p className="text-xs text-blue-800/80 dark:text-blue-200/80 leading-relaxed">
                                The Visual Flow Builder is optimized for large screens with drag-and-drop capabilities.
                                On mobile, you can view existing flows and their status.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Flows List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Your Flows</h2>
                        <Button variant="ghost" size="sm" className="text-xs">
                            View All <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                    </div>

                    <MobileFlowList />
                </div>
            </div>
        </div>
    );
}
