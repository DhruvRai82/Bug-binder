
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Power, Zap, Activity, Key, Globe, Server, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Link } from '@tanstack/react-router';

// Reuse types/interfaces if possible, or redefine for now
interface AIProfile {
    id: string;
    name: string;
    apiKey: string;
    model: string;
    provider: 'google' | 'openai' | 'groq' | 'custom';
    baseUrl?: string;
    is_active: boolean;
}

export function MobileAISettings() {
    // --- Duplicate Logic from Desktop (Ideally we should extract hook) ---
    const [newProfile, setNewProfile] = useState<{ id: string, name: string, apiKey: string, model: string, provider: 'google' | 'openai' | 'groq' | 'custom', baseUrl: string }>({
        id: '', name: '', apiKey: '', model: 'gemini-1.5-flash', provider: 'google', baseUrl: ''
    });
    const [aiProfiles, setAiProfiles] = useState<AIProfile[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        loadAiKeys();
    }, []);

    const loadAiKeys = async () => {
        try {
            const data = await api.get('/api/settings/keys');
            setAiProfiles(data);
        } catch (e) {
            console.error("Failed to load AI keys", e);
        }
    };

    const saveProfile = async () => {
        if (!newProfile.name || !newProfile.apiKey || !newProfile.model) {
            toast.error("Missing fields");
            return;
        }
        try {
            await api.post('/api/settings/keys', newProfile);
            toast.success("Saved");
            setNewProfile({ id: '', name: '', apiKey: '', model: 'gemini-1.5-flash', provider: 'google', baseUrl: '' });
            setIsFormOpen(false);
            loadAiKeys();
        } catch (error) {
            toast.error("Failed to save");
        }
    };

    const deleteProfile = async (id: string) => {
        if (!confirm("Delete this key?")) return;
        try {
            await api.delete(`/api/settings/keys/${id}`);
            toast.success("Deleted");
            loadAiKeys();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const activateProfile = async (profile: AIProfile) => {
        try {
            await api.put(`/api/settings/keys/${profile.id}/activate`, {});
            toast.success(`Active: ${profile.name}`);
            loadAiKeys();
        } catch (error) {
            toast.error("Activation failed");
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Mobile Header */}
            <div className="flex items-center gap-3 p-4 border-b sticky top-0 bg-background/95 backdrop-blur z-20">
                <Link to="/settings">
                    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-lg font-semibold">AI Configuration</h1>
            </div>

            <div className="p-4 space-y-6">

                {/* Active Profile Status */}
                {aiProfiles.find(p => p.is_active) ? (
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-2 bg-green-500/20 rounded-full text-green-600">
                            <Zap className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-green-600 font-semibold uppercase">Currently Active</p>
                            <p className="font-bold text-lg">{aiProfiles.find(p => p.is_active)?.name}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-muted/30 rounded-xl p-4 flex items-center gap-3 text-muted-foreground">
                        <div className="p-2 bg-muted rounded-full">
                            <Bot className="h-5 w-5" />
                        </div>
                        <p className="text-sm">No active AI brain selected.</p>
                    </div>
                )}

                {/* Profiles List */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase">Available Keys</h3>
                    {aiProfiles.map((profile) => (
                        <Card key={profile.id} className={`overflow-hidden ${profile.is_active ? 'border-primary shadow-sm' : ''}`}>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold">{profile.name}</h4>
                                        <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                            <span className="bg-muted px-1.5 rounded">{profile.provider}</span>
                                            <span className="bg-muted px-1.5 rounded">{profile.model}</span>
                                        </div>
                                    </div>
                                    {profile.is_active && <Activity className="h-4 w-4 text-green-500" />}
                                </div>

                                <div className="flex gap-2">
                                    {!profile.is_active ? (
                                        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => activateProfile(profile)}>
                                            Activate
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="secondary" className="flex-1 h-8 text-xs" disabled>
                                            Active
                                        </Button>
                                    )}
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500" onClick={() => deleteProfile(profile.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Add New Button or Form */}
                {!isFormOpen ? (
                    <Button className="w-full rounded-xl" onClick={() => setIsFormOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add New Key
                    </Button>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="p-4 space-y-4">
                            <h3 className="font-semibold text-sm">New Configuration</h3>

                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    placeholder="My Key"
                                    value={newProfile.name}
                                    onChange={e => setNewProfile({ ...newProfile, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Provider</Label>
                                <Select value={newProfile.provider} onValueChange={(v: any) => setNewProfile({ ...newProfile, provider: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="google">Google</SelectItem>
                                        <SelectItem value="openai">OpenAI</SelectItem>
                                        <SelectItem value="groq">Groq</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Key</Label>
                                <Input
                                    type="password"
                                    placeholder="sk-..."
                                    value={newProfile.apiKey}
                                    onChange={e => setNewProfile({ ...newProfile, apiKey: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button className="flex-1" onClick={saveProfile}>Save</Button>
                                <Button variant="outline" className="flex-1" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    );
}
