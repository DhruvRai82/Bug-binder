import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/SettingsContext";

export default function NotificationsSettings() {
    const { settings, updateSetting } = useSettings();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                    Configure how you receive notifications.
                </p>
            </div>
            <div className="border-t pt-6" />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>
                            Select the types of emails you would like to receive.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="marketing" className="flex flex-col space-y-1">
                                <span>Marketing emails</span>
                                <span className="font-normal text-xs text-muted-foreground">Receive emails about new products, features, and more.</span>
                            </Label>
                            <Switch
                                id="marketing"
                                checked={settings.marketingEmails}
                                onCheckedChange={(val) => updateSetting('marketingEmails', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="security" className="flex flex-col space-y-1">
                                <span>Security emails</span>
                                <span className="font-normal text-xs text-muted-foreground">Receive emails about your account security and activity.</span>
                            </Label>
                            <Switch
                                id="security"
                                checked={settings.securityEmails}
                                onCheckedChange={(val) => updateSetting('securityEmails', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="updates" className="flex flex-col space-y-1">
                                <span>Product updates</span>
                                <span className="font-normal text-xs text-muted-foreground">Receive emails about the product roadmap and changelog.</span>
                            </Label>
                            <Switch
                                id="updates"
                                checked={settings.productUpdates}
                                onCheckedChange={(val) => updateSetting('productUpdates', val)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>In-App Notifications</CardTitle>
                        <CardDescription>
                            Manage alerts within the application dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="comments" className="flex flex-col space-y-1">
                                <span>New Comments</span>
                                <span className="font-normal text-xs text-muted-foreground">Notify when someone comments on your bugs or test cases.</span>
                            </Label>
                            <Switch
                                id="comments"
                                checked={settings.newComments}
                                onCheckedChange={(val) => updateSetting('newComments', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="mentions" className="flex flex-col space-y-1">
                                <span>Mentions</span>
                                <span className="font-normal text-xs text-muted-foreground">Notify when you are mentioned in a discussion.</span>
                            </Label>
                            <Switch
                                id="mentions"
                                checked={settings.mentions}
                                onCheckedChange={(val) => updateSetting('mentions', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="status" className="flex flex-col space-y-1">
                                <span>Status Changes</span>
                                <span className="font-normal text-xs text-muted-foreground">Notify when a bug or test case status changes.</span>
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
    );
}
