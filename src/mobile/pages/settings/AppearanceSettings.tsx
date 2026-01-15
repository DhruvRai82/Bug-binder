
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/common/ThemeProvider";
import { ArrowLeft, Moon, Sun, Smartphone } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function MobileAppearanceSettings() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b sticky top-0 bg-background/95 backdrop-blur z-20">
                <Link to="/settings">
                    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-lg font-semibold">Appearance</h1>
            </div>

            <div className="p-4 space-y-6">

                {/* Theme Selection */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase ml-1">Theme</h3>
                    <RadioGroup
                        value={theme}
                        onValueChange={(val) => setTheme(val as "light" | "dark" | "system")}
                        className="grid grid-cols-1 gap-2"
                    >
                        <Label className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                            <div className="flex items-center gap-3">
                                <Sun className="h-5 w-5 text-orange-500" />
                                <span className="font-medium">Light</span>
                            </div>
                            <RadioGroupItem value="light" className="sr-only" />
                            {theme === 'light' && <div className="h-4 w-4 rounded-full bg-primary" />}
                        </Label>

                        <Label className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                            <div className="flex items-center gap-3">
                                <Moon className="h-5 w-5 text-purple-500" />
                                <span className="font-medium">Dark</span>
                            </div>
                            <RadioGroupItem value="dark" className="sr-only" />
                            {theme === 'dark' && <div className="h-4 w-4 rounded-full bg-primary" />}
                        </Label>

                        <Label className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-5 w-5 text-blue-500" />
                                <span className="font-medium">System</span>
                            </div>
                            <RadioGroupItem value="system" className="sr-only" />
                            {theme === 'system' && <div className="h-4 w-4 rounded-full bg-primary" />}
                        </Label>
                    </RadioGroup>
                </div>

                {/* Accessibility */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase ml-1">Accessibility</h3>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Reduced Motion</Label>
                                <p className="text-xs text-muted-foreground">Disable complex animations</p>
                            </div>
                            <Switch />
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
