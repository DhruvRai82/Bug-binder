import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/contexts/SettingsContext";
import { useSidebar } from "@/components/ui/sidebar";

export default function DisplaySettings() {
    const { settings, updateSetting } = useSettings();
    const { setOpen } = useSidebar();

    // Handler to update both settings and sidebar state
    const handleSidebarChange = (value: 'expanded' | 'collapsed') => {
        updateSetting('sidebarPreference', value);
        setOpen(value === 'expanded');
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Display</h3>
                <p className="text-sm text-muted-foreground">
                    Customize how data and content are presented.
                </p>
            </div>
            <div className="border-t pt-6" />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Sidebar Preference</CardTitle>
                        <CardDescription>
                            Choose how the navigation sidebar should behave.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={settings.sidebarPreference}
                            onValueChange={(val) => handleSidebarChange(val as 'expanded' | 'collapsed')}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div>
                                <RadioGroupItem value="expanded" id="expanded" className="peer sr-only" />
                                <Label
                                    htmlFor="expanded"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <div className="mb-2 h-16 w-24 rounded-lg bg-muted/50 p-1 flex">
                                        <div className="h-full w-1/3 bg-muted rounded-l-md mr-1"></div>
                                        <div className="h-full w-2/3 bg-muted rounded-r-md"></div>
                                    </div>
                                    <span className="block w-full text-center font-normal">
                                        Default (Expanded)
                                    </span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="collapsed" id="collapsed" className="peer sr-only" />
                                <Label
                                    htmlFor="collapsed"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <div className="mb-2 h-16 w-24 rounded-lg bg-muted/50 p-1 flex">
                                        <div className="h-full w-1/6 bg-muted rounded-l-md mr-1"></div>
                                        <div className="h-full w-5/6 bg-muted rounded-r-md"></div>
                                    </div>
                                    <span className="block w-full text-center font-normal">
                                        Compact (Icon Only)
                                    </span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Information Density</CardTitle>
                        <CardDescription>
                            Control the spacing and density of lists and tables.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <RadioGroup
                                value={settings.density}
                                onValueChange={(val) => updateSetting('density', val as 'comfortable' | 'compact' | 'spacious')}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="comfortable" id="comfortable" />
                                    <Label htmlFor="comfortable" className="font-normal">Comfortable (Recommended)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="compact" id="compact" />
                                    <Label htmlFor="compact" className="font-normal">Compact (More data on screen)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="spacious" id="spacious" />
                                    <Label htmlFor="spacious" className="font-normal">Spacious</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
