/**
 * Module: CommandCenter (Premium Design)
 * Purpose: Visual control panel for test execution configuration
 * Why: Replaces boring dropdowns with premium visual selectors
 * Design: Glassmorphism card with gradient accents, icon-based selectors
 */

import { Settings2, Play, Zap, Globe2, Laptop, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RunConfig } from '../types';
import { cn } from '@/lib/utils';

interface CommandCenterProps {
    config: RunConfig;
    onConfigChange: (config: RunConfig) => void;
    onRun: () => void;
    selectedCount: number;
    isRunning: boolean;
}

/**
 * What: Premium command center with visual selectors
 * Why: Users need an intuitive, beautiful way to configure test runs
 * Design: Glassmorphism, gradients, icons, smooth animations
 */
export function CommandCenter({
    config,
    onConfigChange,
    onRun,
    selectedCount,
    isRunning
}: CommandCenterProps) {

    const environments = [
        { value: 'local', label: 'Localhost', icon: '🏠', color: 'from-green-500/20 to-emerald-500/10 border-green-500/30' },
        { value: 'staging', label: 'Staging', icon: '🧪', color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30' },
        { value: 'prod', label: 'Production', icon: '🚀', color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30' }
    ];

    const browsers = [
        { value: 'chrome', label: 'Chrome', icon: '🟦', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
        { value: 'firefox', label: 'Firefox', icon: '🟧', color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30' },
        { value: 'edge', label: 'Edge', icon: '🟪', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' }
    ];

    return (
        <Card className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border-2 shadow-2xl">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                            <Settings2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold tracking-tight">Command Center</h3>
                            <p className="text-xs text-muted-foreground">Configure your test execution</p>
                        </div>
                    </div>
                    <Badge
                        variant={isRunning ? "destructive" : "outline"}
                        className={cn(
                            "text-xs font-semibold px-3 py-1",
                            isRunning ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse" : "bg-green-500/20 text-green-400 border-green-500/30"
                        )}
                    >
                        {isRunning ? '🔴 Running' : '🟢 Ready'}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Environment Selector */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-semibold">Environment</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {environments.map((env) => (
                            <button
                                key={env.value}
                                onClick={() => onConfigChange({ ...config, environment: env.value as any })}
                                disabled={isRunning}
                                className={cn(
                                    "relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
                                    config.environment === env.value
                                        ? `bg-gradient-to-br ${env.color} shadow-lg`
                                        : "border-white/10 hover:border-white/20 bg-slate-800/50"
                                )}
                            >
                                <div className="text-2xl mb-1">{env.icon}</div>
                                <div className="text-xs font-medium">{env.label}</div>
                                {config.environment === env.value && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Browser Selector */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-semibold">Browser</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {browsers.map((browser) => (
                            <button
                                key={browser.value}
                                onClick={() => onConfigChange({ ...config, browser: browser.value as any })}
                                disabled={isRunning}
                                className={cn(
                                    "relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
                                    config.browser === browser.value
                                        ? `bg-gradient-to-br ${browser.color} shadow-lg`
                                        : "border-white/10 hover:border-white/20 bg-slate-800/50"
                                )}
                            >
                                <div className="text-2xl mb-1">{browser.icon}</div>
                                <div className="text-xs font-medium">{browser.label}</div>
                                {config.browser === browser.value && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Headless Mode Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <MonitorPlay className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <Label htmlFor="headless-mode" className="text-sm font-semibold cursor-pointer">
                                Headless Mode
                            </Label>
                            <p className="text-xs text-muted-foreground">Run without visible browser window</p>
                        </div>
                    </div>
                    <Switch
                        id="headless-mode"
                        checked={config.headless}
                        onCheckedChange={(c) => onConfigChange({ ...config, headless: c })}
                        disabled={isRunning}
                        className="data-[state=checked]:bg-purple-500"
                    />
                </div>

                {/* Parallel Execution Slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-muted-foreground" />
                            <Label className="text-sm font-semibold">Parallel Tests</Label>
                        </div>
                        <Badge variant="secondary" className="font-mono">
                            {config.parallel}
                        </Badge>
                    </div>
                    <Slider
                        value={[config.parallel]}
                        onValueChange={([value]) => onConfigChange({ ...config, parallel: value })}
                        max={10}
                        min={1}
                        step={1}
                        disabled={isRunning}
                        className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Sequential</span>
                        <span>Max Speed</span>
                    </div>
                </div>

                {/* RUN Button - Less annoying */}
                <Button
                    onClick={onRun}
                    disabled={selectedCount === 0 || isRunning}
                    size="lg"
                    className={
                        cn(
                            "w-full h-14 text-base font-bold tracking-wide transition-all duration-300",
                            selectedCount > 0 && !isRunning
                                ? "bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-500 hover:via-green-500 hover:to-emerald-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/30"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                        )
                    }
                >
                    {isRunning ? (
                        <>
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-3" />
                            Running Tests...
                        </>
                    ) : (
                        <>
                            <Play className="w-6 h-6 mr-3 fill-current" />
                            RUN {selectedCount} TEST{selectedCount !== 1 ? 'S' : ''}
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
