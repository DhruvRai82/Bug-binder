import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ProfileSettings() {
    const { user: authUser } = useAuth(); // AuthUser from context (Firebase)
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        photoURL: ''
    });

    // Load Profile from Backend
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await api.get('/api/user/profile');
                setFormData({
                    displayName: data.displayName || authUser?.displayName || '',
                    bio: data.bio || '',
                    photoURL: data.photoURL || authUser?.photoURL || ''
                });
            } catch (error) {
                console.error("Failed to load profile", error);
            }
        };
        if (authUser) loadProfile();
    }, [authUser]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await api.put('/api/user/profile', formData);
            toast.success("Profile updated successfully");

            // Optionally force reload auth context or just UI
            // For now, UI state is enough.
        } catch (error) {
            toast.error("Failed to save profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <div>
                <h3 className="text-xl font-semibold tracking-tight">Profile</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your public profile and how others see you on the site.
                </p>
            </div>

            <Card className="border shadow-lg bg-card/60 backdrop-blur-md overflow-hidden relative group">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors duration-700" />

                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your photo and basic details.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center p-4 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all duration-300">
                        <div className="relative group/avatar cursor-pointer">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 group-hover/avatar:border-primary transition-colors shadow-sm">
                                <img
                                    src={formData.photoURL || authUser?.photoURL || ''}
                                    alt="Avatar"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                                />
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full backdrop-blur-[2px]">
                                <span className="text-xs text-white font-medium">Change</span>
                            </div>
                        </div>
                        <div className="space-y-2 flex-1">
                            <h4 className="font-medium text-foreground">Profile Photo</h4>
                            <p className="text-xs text-muted-foreground max-w-sm">
                                Paste a URL for your avatar image.
                            </p>
                            <div className="flex gap-2 pt-1">
                                <Input
                                    value={formData.photoURL}
                                    onChange={e => setFormData({ ...formData, photoURL: e.target.value })}
                                    placeholder="https://example.com/avatar.jpg"
                                    className="h-8 text-xs bg-background"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 max-w-xl">
                        <div className="grid gap-2 group/input">
                            <Label htmlFor="name" className="text-xs font-medium uppercase text-muted-foreground group-focus-within/input:text-primary transition-colors">Display Name</Label>
                            <div className="relative">
                                <Input
                                    id="username"
                                    value={formData.displayName}
                                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                    className="h-10 transition-all duration-300 border-muted hover:border-primary/50 focus:border-primary bg-background/50 pl-4"
                                    placeholder="Enter your display name"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 group/input">
                            <Label htmlFor="bio" className="text-xs font-medium uppercase text-muted-foreground group-focus-within/input:text-primary transition-colors">Bio</Label>
                            <div className="relative">
                                <Input
                                    id="bio"
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    className="h-10 transition-all duration-300 border-muted hover:border-primary/50 focus:border-primary bg-background/50 pl-4"
                                    placeholder="Software Engineer at Acme Inc."
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 group/input opacity-80">
                            <Label htmlFor="email" className="text-xs font-medium uppercase text-muted-foreground">Email Address</Label>
                            <Input
                                id="email"
                                defaultValue={authUser?.email || ''}
                                disabled
                                className="h-10 bg-muted/50 cursor-not-allowed font-mono text-sm"
                            />
                            <p className="text-[0.8rem] text-muted-foreground flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                Managed via Google Auth
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full sm:w-auto shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
