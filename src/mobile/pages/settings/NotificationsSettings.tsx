
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/SettingsContext";
import { ArrowLeft, Mail, Bell } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from "@/components/ui/card";

export function MobileNotificationsSettings() {
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
                <h1 className="text-lg font-semibold">Notifications</h1>
            </div>

            <div className="p-4 space-y-6">

                {/* Email Group */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 ml-1 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <h3 className="text-sm font-medium uppercase">Email Alerts</h3>
                    </div>

                    <Card>
                        <CardContent className="p-0 divide-y">
                            <div className="flex items-center justify-between p-4">
                                <Label htmlFor="marketing" className="flex flex-col">
                                    <span className="font-medium">Marketing</span>
                                    <span className="font-normal text-xs text-muted-foreground">Product news & offers</span>
                                </Label>
                                <Switch
                                    id="marketing"
                                    checked={settings.marketingEmails}
                                    onCheckedChange={(val) => updateSetting('marketingEmails', val)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4">
                                <Label htmlFor="security" className="flex flex-col">
                                    <span className="font-medium">Security</span>
                                    <span className="font-normal text-xs text-muted-foreground">Login alerts & activity</span>
                                </Label>
                                <Switch
                                    id="security"
                                    checked={settings.securityEmails}
                                    onCheckedChange={(val) => updateSetting('securityEmails', val)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4">
                                <Label htmlFor="updates" className="flex flex-col">
                                    <span className="font-medium">Product Updates</span>
                                    <span className="font-normal text-xs text-muted-foreground">Changelog & roadmap</span>
                                </Label>
                                <Switch
                                    id="updates"
                                    checked={settings.productUpdates}
                                    onCheckedChange={(val) => updateSetting('productUpdates', val)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* In-App Group */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 ml-1 text-muted-foreground">
                        <Bell className="h-4 w-4" />
                        <h3 className="text-sm font-medium uppercase">Push & In-App</h3>
                    </div>

                    <Card>
                        <CardContent className="p-0 divide-y">
                            <div className="flex items-center justify-between p-4">
                                <Label htmlFor="comments" className="flex flex-col">
                                    <span className="font-medium">New Comments</span>
                                    <span className="font-normal text-xs text-muted-foreground">On your bugs & tests</span>
                                </Label>
                                <Switch
                                    id="comments"
                                    checked={settings.newComments}
                                    onCheckedChange={(val) => updateSetting('newComments', val)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4">
                                <Label htmlFor="mentions" className="flex flex-col">
                                    <span className="font-medium">Mentions</span>
                                    <span className="font-normal text-xs text-muted-foreground">When tagged @you</span>
                                </Label>
                                <Switch
                                    id="mentions"
                                    checked={settings.mentions}
                                    onCheckedChange={(val) => updateSetting('mentions', val)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4">
                                <Label htmlFor="status" className="flex flex-col">
                                    <span className="font-medium">Status Changes</span>
                                    <span className="font-normal text-xs text-muted-foreground">Workflow updates</span>
                                </Label>
                                <Switch
                                    id="status"
                                    checked={settings.statusChanges}
                                    onCheckedChange={(val) => updateSetting('statusChanges', val)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
