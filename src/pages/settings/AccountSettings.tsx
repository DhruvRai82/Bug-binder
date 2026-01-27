import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/contexts/SettingsContext";
import { useProject } from "@/context/ProjectContext";

export default function AccountSettings() {
    const { settings, updateSetting } = useSettings();
    const { selectedProject } = useProject();

    if (!selectedProject) {
        return <div className="p-4">Please select a project to configure account preferences.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Account Preferences</h3>
                <p className="text-sm text-muted-foreground">
                    Settings for project <strong>{selectedProject.name}</strong>.
                </p>
            </div>
            <div className="border-t pt-6" />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Regional Settings</CardTitle>
                        <CardDescription>
                            Manage your regional settings and preferences for this project.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="language">Language</Label>
                                <Select
                                    value={settings.language}
                                    onValueChange={(val) => updateSetting('language', val)}
                                >
                                    <SelectTrigger id="language">
                                        <SelectValue placeholder="Select Language" />
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
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Select
                                    value={settings.timezone}
                                    onValueChange={(val) => updateSetting('timezone', val)}
                                >
                                    <SelectTrigger id="timezone">
                                        <SelectValue placeholder="Select Timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="utc">UTC (Universal Coordinated Time)</SelectItem>
                                        <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                                        <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                                        <SelectItem value="ist">IST (India Standard Time)</SelectItem>
                                        <SelectItem value="gmt">GMT (Greenwich Mean Time)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>
                            Control your data and portability.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Export Data</h4>
                                <p className="text-sm text-muted-foreground">Download a copy of your personal data.</p>
                            </div>
                            <Button variant="outline" onClick={async () => {
                                const token = await import('@/lib/firebase').then(m => m.auth.currentUser?.getIdToken());
                                window.open(`http://localhost:8081/api/user/export?token=${token}`, '_blank');
                            }}>
                                Download JSON
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-500/20 bg-red-500/5">
                    <CardHeader>
                        <CardTitle className="text-red-500">Danger Zone</CardTitle>
                        <CardDescription>
                            Irreversible actions. Proceed with caution.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-background">
                            <div>
                                <h4 className="font-medium text-red-600">Delete Account</h4>
                                <p className="text-sm text-muted-foreground">Permanently remove your account and all data.</p>
                            </div>
                            <Button variant="destructive" onClick={() => {
                                if (confirm("Are you SURE? This cannot be undone.")) {
                                    import('@/lib/api').then(async ({ api }) => {
                                        await api.delete('/api/user/account');
                                        location.reload(); // Force logout
                                    });
                                }
                            }}>
                                Delete Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
