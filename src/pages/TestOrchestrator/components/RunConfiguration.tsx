/**
 * Module: RunConfiguration
 * Purpose: Visual panel for configuring test execution parameters
 * Why: Users need to control environment, browser, and execution settings
 * Design: Modern card with labeled controls and clear visual hierarchy
 */

import { Settings2, Globe, Laptop, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RunConfig } from '../types';

interface RunConfigurationProps {
    config: RunConfig;
    onConfigChange: (config: RunConfig) => void;
    onRun: () => void;
    selectedCount: number;
    isRunning: boolean;
}

/**
 * What: Configuration panel for test execution
 * Why: Centralized control for all run parameters
 * Design: Horizontal layout with icon indicators and primary action button
 */
export function RunConfiguration({
    config,
    onConfigChange,
    onRun,
    selectedCount,
    isRunning
}: RunConfigurationProps) {
    return (
        <Card className="shrink-0 bg-gradient-to-br from-card/50 to-card/30 border-2 backdrop-blur-sm">
            <CardHeader className="py-3 px-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-primary/10">
                            <Settings2 className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold">Run Configuration</h3>
                    </div>
                    <Badge variant={isRunning ? "destructive" : "outline"} className="text-xs font-normal">
                        {isRunning ? '🔴 Running' : '🟢 Ready'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 flex items-end gap-4 flex-wrap">
                {/* Environment Selector */}
                <div className="space-y-1.5 w-44">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        Environment
                    </Label>
                    <Select
                        value={config.environment}
                        onValueChange={(v) => onConfigChange({ ...config, environment: v as any })}
                        disabled={isRunning}
                    >
                        <SelectTrigger className="h-9 bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="local">🏠 Localhost</SelectItem>
                            <SelectItem value="staging">🧪 Staging</SelectItem>
                            <SelectItem value="prod">🚀 Production</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Browser Selector */}
                <div className="space-y-1.5 w-44">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5" />
                        Browser
                    </Label>
                    <Select
                        value={config.browser}
                        onValueChange={(v) => onConfigChange({ ...config, browser: v as any })}
                        disabled={isRunning}
                    >
                        <SelectTrigger className="h-9 bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="chrome">🟦 Chrome</SelectItem>
                            <SelectItem value="firefox">🟧 Firefox</SelectItem>
                            <SelectItem value="edge">🟪 Edge</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Headless Mode Toggle */}
                <div className="flex items-center gap-3 px-4 py-2 border rounded-md h-9 bg-background">
                    <Label htmlFor="headless-toggle" className="text-xs cursor-pointer flex items-center gap-2">
                        <span className="text-xl">👁️</span>
                        Headless Mode
                    </Label>
                    <Switch
                        id="headless-toggle"
                        checked={config.headless}
                        onCheckedChange={(c) => onConfigChange({ ...config, headless: c })}
                        disabled={isRunning}
                        className="scale-90"
                    />
                </div>

                {/* Spacer */}
                <div className="flex-1 min-w-[100px]" />

                {/* Run Button (Primary Action) */}
                <Button
                    onClick={onRun}
                    disabled={selectedCount === 0 || isRunning}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg shadow-green-500/20 min-w-[180px] h-11 text-sm font-semibold transition-all hover:scale-105"
                >
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    {isRunning ? 'Running...' : `Run ${selectedCount} Test${selectedCount !== 1 ? 's' : ''}`}
                </Button>
            </CardContent>
        </Card>
    );
}
