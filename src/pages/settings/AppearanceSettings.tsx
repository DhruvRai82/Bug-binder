import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/common/ThemeProvider";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppearanceSettings() {
    const { theme, setTheme, color, setColor, radius, setRadius } = useTheme();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Appearance</h3>
                <p className="text-sm text-muted-foreground">
                    Customize the look and feel of the application.
                </p>
            </div>
            <div className="border-t pt-6" />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Theme</CardTitle>
                        <CardDescription>
                            Select the theme for the dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={theme}
                            onValueChange={(val) => setTheme(val as "light" | "dark" | "system")}
                            className="grid max-w-md grid-cols-2 gap-8 pt-2"
                        >
                            <div className="space-y-2">
                                <Label className="[&:has([data-state=checked])>div]:border-primary">
                                    <RadioGroupItem value="light" className="peer sr-only" />
                                    <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer">
                                        <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                            <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                                <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                            </div>
                                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                            </div>
                                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                            </div>
                                        </div>
                                    </div>
                                    <span className="block w-full p-2 text-center font-normal">
                                        Light
                                    </span>
                                </Label>
                            </div>
                            <div className="space-y-2">
                                <Label className="[&:has([data-state=checked])>div]:border-primary">
                                    <RadioGroupItem value="dark" className="peer sr-only" />
                                    <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer">
                                        <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                                            <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                            </div>
                                            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                <div className="h-4 w-4 rounded-full bg-slate-400" />
                                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                            </div>
                                            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                <div className="h-4 w-4 rounded-full bg-slate-400" />
                                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <span className="block w-full p-2 text-center font-normal">
                                        Dark
                                    </span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>



                <Card>
                    <CardHeader>
                        <CardTitle>Accent Color</CardTitle>
                        <CardDescription>
                            Select the primary color for the application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {['zinc', 'blue', 'violet', 'orange', 'green', 'red'].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c as any)}
                                    className={cn(
                                        "h-10 w-full rounded-md border-2 flex items-center justify-center transition-all",
                                        color === c ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent hover:bg-muted"
                                    )}
                                    style={{
                                        // We can't easily get the HSL CSS var here without mapping, but we can visualize it simply
                                        backgroundColor: c === 'zinc' ? '#18181b' :
                                            c === 'blue' ? '#3b82f6' :
                                                c === 'violet' ? '#8b5cf6' :
                                                    c === 'orange' ? '#f97316' :
                                                        c === 'green' ? '#22c55e' :
                                                            '#ef4444' // red
                                    }}
                                >
                                    {color === c && <Check className="h-4 w-4 text-white" />}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Radius</CardTitle>
                        <CardDescription>
                            Adjust the roundness of the user interface.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 gap-2">
                            {[0, 0.3, 0.5, 0.75, 1.0].map((r) => (
                                <Button
                                    key={r}
                                    variant={radius === r ? "default" : "outline"}
                                    onClick={() => setRadius(r)}
                                    className="w-full"
                                >
                                    {r}rem
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Accessibility</CardTitle>
                        <CardDescription>
                            Settings to make the interface more accessible.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="motion" className="flex flex-col space-y-1">
                                <span>Reduced motion</span>
                                <span className="font-normal text-xs text-muted-foreground">Reduce the amount of animation and movement in the interface.</span>
                            </Label>
                            <Switch id="motion" />
                        </div>
                    </CardContent>
                </Card>
            </div >
        </div >
    );
}
