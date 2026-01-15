
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/contexts/SettingsContext";
import { useProject } from "@/context/ProjectContext";
import { ArrowLeft, Globe, Clock } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';

export function MobileAccountSettings() {
    const { settings, updateSetting } = useSettings();
    const { selectedProject } = useProject();

    if (!selectedProject) {
        return (
            <div className="p-8 text-center text-muted-foreground mt-20">
                <p>Please select a project first.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b sticky top-0 bg-background/95 backdrop-blur z-20">
                <Link to="/settings">
                    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold">Account</h1>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {selectedProject.name}
                    </p>
                </div>
            </div>

            <div className="p-4 space-y-6">

                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase ml-1">Region & Language</h3>

                    <Card>
                        <CardContent className="p-0 divide-y">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <Globe className="h-5 w-5 text-blue-500" />
                                    <Label className="text-base font-normal">Language</Label>
                                </div>
                                <Select value={settings.language} onValueChange={(val) => updateSetting('language', val)}>
                                    <SelectTrigger className="w-[110px] h-8 border-none bg-transparent shadow-none focus:ring-0 text-right pr-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                        <SelectItem value="de">German</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="ja">Japanese</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    <Label className="text-base font-normal">Timezone</Label>
                                </div>
                                <Select value={settings.timezone} onValueChange={(val) => updateSetting('timezone', val)}>
                                    <SelectTrigger className="w-[100px] h-8 border-none bg-transparent shadow-none focus:ring-0 text-right pr-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="utc">UTC</SelectItem>
                                        <SelectItem value="pst">PST</SelectItem>
                                        <SelectItem value="est">EST</SelectItem>
                                        <SelectItem value="ist">IST</SelectItem>
                                        <SelectItem value="gmt">GMT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <p className="text-xs text-muted-foreground px-2">
                    Regional settings apply to date formatting and report generation times for this project.
                </p>

            </div>
        </div>
    );
}
