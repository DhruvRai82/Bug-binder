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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
            <div>
                <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    AI Brain Configuration
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                    Confgure your AI providers to power the autonomous testing agent.
                    Supports Google Gemini, OpenAI, Groq (for speed), or any OpenAI-compatible endpoint.
                </p>
            </div>

            {/* Add New Profile Form */}
            <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 opacity-70" />
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-purple-600" />
                        Connect New Brain
                    </CardTitle>
                    <CardDescription>Add a new API key to expand your testing capabilities.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 group/input">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground group-focus-within/input:text-purple-600 transition-colors">
                                Key Profile Name
                            </Label>
                            <Input
                                placeholder="e.g. My Fast Groq Key"
                                value={newProfile.name}
                                onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                                className="bg-background/50 border-muted-foreground/20 focus:border-purple-500 transition-all h-11"
                            />
                        </div>

                        <div className="space-y-2 group/input">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground group-focus-within/input:text-purple-600 transition-colors">
                                AI Provider
                            </Label>
                            <Select
                                value={newProfile.provider || 'google'}
                                onValueChange={handleProviderChange}
                            >
                                <SelectTrigger className="bg-background/50 border-muted-foreground/20 h-11 focus:ring-purple-500/20">
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

                        <div className="space-y-2 group/input">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground group-focus-within/input:text-purple-600 transition-colors">
                                Model Identifier
                            </Label>
                            <div className="relative">
                                <Activity className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/50" />
                                <Input
                                    placeholder="e.g. gpt-4o"
                                    value={newProfile.model}
                                    onChange={(e) => setNewProfile({ ...newProfile, model: e.target.value })}
                                    className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-purple-500 transition-all h-11 font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group/input">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground group-focus-within/input:text-purple-600 transition-colors">
                                Secret API Key
                            </Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/50" />
                                <Input
                                    placeholder="sk-..."
                                    type="password"
                                    value={newProfile.apiKey}
                                    onChange={(e) => setNewProfile({ ...newProfile, apiKey: e.target.value })}
                                    className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-purple-500 transition-all h-11 font-mono text-sm"
                                />
                            </div>
                        </div>

                        {(newProfile.provider === 'custom' || newProfile.provider === 'openai') && (
                            <div className="space-y-2 md:col-span-2 group/input animate-in fade-in slide-in-from-top-2">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground group-focus-within/input:text-purple-600 transition-colors">
                                    Base URL (Optional)
                                </Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/50" />
                                    <Input
                                        placeholder="https://api.openai.com/v1"
                                        value={newProfile.baseUrl}
                                        onChange={(e) => setNewProfile({ ...newProfile, baseUrl: e.target.value })}
                                        className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-purple-500 transition-all h-11 font-mono text-sm"
                                    />
                                </div>
                                <p className="text-[11px] text-muted-foreground ml-1">
                                    Override this if you are using a proxy or local LLM (e.g. LM Studio).
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={saveProfile}
                            disabled={!newProfile.name || !newProfile.apiKey}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all w-full md:w-auto"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Save Configuration
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Profiles List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <h4 className="text-lg font-semibold">Registered AI Brains</h4>
                </div>

                {aiProfiles.length === 0 ? (
                    <Card className="border-dashed border-2 bg-muted/20">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <Bot className="h-12 w-12 mb-4 opacity-50" />
                            <p>No custom keys found.</p>
                            <p className="text-sm">The system will use the default restricted Google Gemini Flash tier.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {aiProfiles.map((profile, i) => (
                            <div
                                key={profile.id}
                                className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border transition-all duration-300 ${profile.is_active
                                        ? 'border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-blue-500/5 shadow-md'
                                        : 'bg-card/50 hover:bg-card hover:border-border/80 hover:shadow-sm'
                                    }`}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
                                    <div className={`p-3 rounded-xl shadow-inner ${profile.is_active
                                            ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-purple-500/20'
                                            : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {profile.is_active ? <Zap className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg flex items-center gap-3">
                                            {profile.name}
                                            {profile.is_active && (
                                                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-purple-500 text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                                    Active
                                                </span>
                                            )}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1.5">
                                            <span className="flex items-center gap-1.5 bg-background/50 border px-2 py-0.5 rounded-md text-xs font-medium">
                                                <Server className="h-3 w-3" /> {profile.provider}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-background/50 border px-2 py-0.5 rounded-md text-xs font-medium">
                                                <Activity className="h-3 w-3" /> {profile.model}
                                            </span>
                                            {profile.baseUrl && (
                                                <span className="flex items-center gap-1.5 text-xs text-blue-500" title={profile.baseUrl}>
                                                    <Globe className="h-3 w-3" /> Custom URL
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    {!profile.is_active ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => activateProfile(profile)}
                                            className="flex-1 sm:flex-none border-purple-200 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                        >
                                            <Power className="h-4 w-4 mr-2" /> Activate
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            disabled
                                            className="flex-1 sm:flex-none bg-background/50 text-foreground/50 border-transparent cursor-default"
                                        >
                                            Currently Active
                                        </Button>
                                    )}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => deleteProfile(profile.id)}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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

