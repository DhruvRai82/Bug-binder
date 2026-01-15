
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettings } from "@/contexts/SettingsContext";
import { ArrowLeft, Layout, MousePointerClick } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from "@/components/ui/card";

export function MobileDisplaySettings() {
    const { settings, updateSetting } = useSettings();

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b sticky top-0 bg-background/95 backdrop-blur z-20">
                <Link to="/settings">
                    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-lg font-semibold">Display</h1>
            </div>

            <div className="p-4 space-y-6">

                {/* Information Density */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 ml-1 text-muted-foreground">
                        <Layout className="h-4 w-4" />
                        <h3 className="text-sm font-medium uppercase">Density</h3>
                    </div>

                    <Card>
                        <CardContent className="p-4">
                            <RadioGroup
                                value={settings.density}
                                onValueChange={(val) => updateSetting('density', val as 'comfortable' | 'compact' | 'spacious')}
                                className="space-y-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="comfortable" id="comfortable" />
                                    <Label htmlFor="comfortable" className="font-normal text-base">Comfortable</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="compact" id="compact" />
                                    <Label htmlFor="compact" className="font-normal text-base">Compact</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="spacious" id="spacious" />
                                    <Label htmlFor="spacious" className="font-normal text-base">Spacious</Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                    <p className="text-xs text-muted-foreground px-2">
                        Affects list spacing in Test Cases and Bugs.
                    </p>
                </div>

                {/* Sidebar - Not Applicable */}
                <div className="space-y-3 opacity-50">
                    <div className="flex items-center gap-2 ml-1 text-muted-foreground">
                        <MousePointerClick className="h-4 w-4" />
                        <h3 className="text-sm font-medium uppercase">Desktop Sidebar</h3>
                    </div>
                    <Card>
                        <CardContent className="p-4 text-sm text-muted-foreground">
                            Sidebar settings only apply to the desktop view.
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
