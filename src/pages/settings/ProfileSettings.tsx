import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileSettings() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    This is how others will see you on the site.
                </p>
            </div>
            <div className="border-t pt-6" />

            <div className="space-y-8">
                <div className="flex flex-col gap-4">
                    <Label>Photo</Label>
                    <div className="flex items-center gap-4">
                        <img src={user?.photoURL || ''} alt="Avatar" className="w-16 h-16 rounded-full border" />
                        <Button variant="outline">Change Photo</Button>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" defaultValue={user?.displayName || ''} />
                    <p className="text-[0.8rem] text-muted-foreground">
                        This is your public display name.
                    </p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={user?.email || ''} disabled />
                    <p className="text-[0.8rem] text-muted-foreground">
                        Your email address is managed via Google Auth.
                    </p>
                </div>

                <Button>Update Profile</Button>
            </div>
        </div>
    );
}
