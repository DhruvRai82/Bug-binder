
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/common/ThemeProvider";
import { ArrowLeft, Moon, Sun, Smartphone, Check } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from "@/lib/utils";

export function MobileAppearanceSettings() {
    const { theme, setTheme, color, setColor, radius, setRadius } = useTheme();

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

                {/* Accent Color */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase ml-1">Accent Color</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {['zinc', 'blue', 'violet', 'orange', 'green', 'red'].map((c) => (
                            <div
                                key={c}
                                onClick={() => setColor(c as any)}
                                className={cn(
                                    "h-16 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer relative overflow-hidden",
                                    color === c ? "border-primary" : "border-transparent bg-muted/30"
                                )}
                            >
                                <div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundColor: c === 'zinc' ? '#18181b' :
                                            c === 'blue' ? '#3b82f6' :
                                                c === 'violet' ? '#8b5cf6' :
                                                    c === 'orange' ? '#f97316' :
                                                        c === 'green' ? '#22c55e' :
                                                            '#ef4444'
                                    }}
                                />
                                {color === c && <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg transform scale-100 transition-transform">
                                    <Check className="h-4 w-4 text-primary-foreground" />
                                </div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Radius */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase ml-1">Radius</h3>
                    <div className="flex p-1 bg-muted/40 rounded-xl gap-1 overflow-x-auto">
                        {[0, 0.3, 0.5, 0.75, 1.0].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRadius(r)}
                                className={cn(
                                    "flex-1 min-w-[60px] py-2.5 text-sm font-medium rounded-lg transition-all duration-300",
                                    radius === r
                                        ? "bg-background text-foreground shadow-sm scale-[1.02]"
                                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground/80"
                                )}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
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
