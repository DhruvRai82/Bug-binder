import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Plus, Trash2, Power, Zap, Activity, Key, Globe, Server } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

// AI Configuration State (Multi-Profile)
interface AIProfile {
    id: string;
    name: string;
    apiKey: string;
    model: string;
    provider: 'google' | 'openai' | 'groq' | 'custom';
    baseUrl?: string;
    is_active: boolean;
}

export default function AISettings() {
    const [newProfile, setNewProfile] = useState<{ id: string, name: string, apiKey: string, model: string, provider: 'google' | 'openai' | 'groq' | 'custom', baseUrl: string }>({
        id: '', name: '', apiKey: '', model: 'gemini-1.5-flash', provider: 'google', baseUrl: ''
    });
    const [aiProfiles, setAiProfiles] = useState<AIProfile[]>([]);

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
            toast.error("Please fill all AI Profile fields");
            return;
        }

        try {
            await api.post('/api/settings/keys', newProfile);
            toast.success("AI Profile Saved");
            setNewProfile({ id: '', name: '', apiKey: '', model: 'gemini-1.5-flash', provider: 'google', baseUrl: '' });
            loadAiKeys();
        } catch (error) {
            toast.error("Failed to save key");
        }
    };

    const deleteProfile = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/api/settings/keys/${id}`);
            toast.success("Key Deleted");
            loadAiKeys();
        } catch (error) {
            toast.error("Failed to delete key");
        }
    };

    const activateProfile = async (profile: AIProfile) => {
        try {
            await api.put(`/api/settings/keys/${profile.id}/activate`, {});
            toast.success(`Active: ${profile.name}`);
            loadAiKeys();
        } catch (error) {
            toast.error("Failed to activate key");
        }
    };

    const handleProviderChange = (value: 'google' | 'openai' | 'groq' | 'custom') => {
        let defaultModel = 'gemini-1.5-flash';
        let defaultUrl = '';

        if (value === 'openai') defaultModel = 'gpt-4o';
        if (value === 'groq') {
            defaultModel = 'llama3-70b-8192';
        }
        if (value === 'custom') defaultModel = 'gpt-3.5-turbo';

        setNewProfile({ ...newProfile, provider: value, model: defaultModel, baseUrl: defaultUrl });
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">AI Brain Configuration</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your personal AI keys. You can use Gemini, OpenAI, Groq, or any OpenAI-compatible provider.
                </p>
            </div>
            <div className="border-t pt-6" />

            {/* Add New Profile Form */}
            <div className="p-4 rounded-xl border bg-muted/20 space-y-4">
                <h4 className="font-semibold text-sm mb-2">Add New AI Key</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Key Name</Label>
                        <Input
                            placeholder="e.g. My Groq Key"
                            value={newProfile.name}
                            onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Provider</Label>
                        <Select
                            value={newProfile.provider || 'google'}
                            onValueChange={handleProviderChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="google">Google Gemini</SelectItem>
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="groq">Groq (Recommended for Speed)</SelectItem>
                                <SelectItem value="custom">Custom (OpenAI Compatible)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Model Name</Label>
                        <Input
                            placeholder="e.g. gpt-4o, llama3-70b-8192"
                            value={newProfile.model}
                            onChange={(e) => setNewProfile({ ...newProfile, model: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input
                            placeholder="sk-..."
                            type="password"
                            value={newProfile.apiKey}
                            onChange={(e) => setNewProfile({ ...newProfile, apiKey: e.target.value })}
                        />
                    </div>

                    {(newProfile.provider === 'custom' || newProfile.provider === 'openai') && (
                        <div className="space-y-2 md:col-span-2">
                            <Label>Base URL (Optional)</Label>
                            <Input
                                placeholder="https://api.openai.com/v1"
                                value={newProfile.baseUrl}
                                onChange={(e) => setNewProfile({ ...newProfile, baseUrl: e.target.value })}
                            />
                            <p className="text-[10px] text-muted-foreground">Override this if you are using a proxy or local LLM (e.g. LM Studio).</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end pt-2">
                    <Button size="sm" onClick={saveProfile} disabled={!newProfile.name || !newProfile.apiKey} className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Plus className="h-4 w-4 mr-2" /> Save AI Profile
                    </Button>
                </div>
            </div>

            {/* Profiles List */}
            <div className="space-y-3">
                <Label>Your Saved Brains</Label>
                {aiProfiles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                        No custom keys found. Using system default (Google Gemini Flash).
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {aiProfiles.map((profile) => (
                            <div
                                key={profile.id}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${profile.is_active
                                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 shadow-md ring-1 ring-purple-200'
                                    : 'bg-card hover:bg-accent/50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${profile.is_active ? 'bg-purple-100 text-purple-600' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {profile.is_active ? <Zap className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2">
                                            {profile.name}
                                            {profile.is_active && (
                                                <span className="text-[10px] uppercase tracking-wider font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </h4>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-xs">
                                                <Server className="h-3 w-3" /> {profile.provider}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Activity className="h-3 w-3" /> {profile.model}
                                            </span>
                                            {profile.baseUrl && (
                                                <span className="flex items-center gap-1 text-xs opacity-70" title={profile.baseUrl}>
                                                    <Globe className="h-3 w-3" /> URL Configured
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!profile.is_active ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => activateProfile(profile)}
                                            className="hover:border-purple-500 hover:text-purple-600"
                                        >
                                            <Power className="h-4 w-4 mr-2" /> Activate
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            disabled
                                            className="text-purple-700 bg-purple-100 opacity-80"
                                        >
                                            Active
                                        </Button>
                                    )}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => deleteProfile(profile.id)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

