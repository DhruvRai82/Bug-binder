
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Camera, LogOut } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function MobileProfileSettings() {
    const { user: authUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        photoURL: ''
    });

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
            toast.success("Profile updated");
        } catch (error) {
            toast.error("Failed to save");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b sticky top-0 bg-background/95 backdrop-blur z-20">
                <Link to="/settings">
                    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-lg font-semibold">Edit Profile</h1>
            </div>

            <div className="p-4 space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-muted">
                            <img
                                src={formData.photoURL || authUser?.photoURL || ''}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg">
                            <Camera className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Display Name</Label>
                        <Input
                            value={formData.displayName}
                            onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Bio</Label>
                        <Input
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell us about yourself"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Photo URL</Label>
                        <Input
                            value={formData.photoURL}
                            onChange={e => setFormData({ ...formData, photoURL: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input defaultValue={authUser?.email || ''} disabled className="bg-muted text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Managed by Google</p>
                    </div>
                </div>

                <Button
                    className="w-full rounded-xl h-12 text-base"
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>

            </div>
        </div>
    );
}
