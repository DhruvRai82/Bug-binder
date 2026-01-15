import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Chrome, Mail, Lock, Sparkles } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export const Login = () => {
    const { user, signInWithGoogle } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('login');

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Preload animations
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (name) {
                await updateProfile(userCredential.user, { displayName: name });
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background selection:bg-primary/20 transition-colors duration-500">
            {/* --- Animated Background Layers --- */}

            {/* 1. Base Gradient Mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.1),rgba(15,23,42,1))]" />

            {/* 2. Moving Orbs (Aurora Effect) */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-600/20 blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px] animate-pulse delay-1000" />

            {/* 3. Grid Pattern with Fade */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* --- Main Card --- */}
            <div className={`relative z-10 w-full max-w-md transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                {/* Glowing Border Container */}
                <div className="group relative rounded-xl p-[1px] bg-gradient-to-br from-black/5 via-black/0 to-transparent dark:from-white/20 dark:via-white/5 dark:to-transparent">

                    {/* Glow Blur behind card */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-xl transition-opacity duration-500 group-hover:opacity-40" />

                    <Card className="relative border-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-2xl dark:shadow-none">
                        <CardHeader className="text-center space-y-2 pb-6">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-black/5 dark:ring-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <Chrome className="w-8 h-8 text-primary animate-pulse" />
                            </div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                                Bug Binder
                            </CardTitle>
                            <CardDescription className="text-base text-muted-foreground">
                                Next-Gen Test Automation
                            </CardDescription>
                        </CardHeader>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="px-8 mb-6">
                                <TabsList className="grid w-full grid-cols-2 bg-muted p-1 border border-border/50">
                                    <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:text-primary transition-all shadow-sm">Login</TabsTrigger>
                                    <TabsTrigger value="register" className="data-[state=active]:bg-background data-[state=active]:text-primary transition-all shadow-sm">Register</TabsTrigger>
                                </TabsList>
                            </div>

                            <CardContent className="space-y-4 pb-8">
                                {error && (
                                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md text-center animate-in fade-in slide-in-from-top-2">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <Button
                                        variant="outline"
                                        className="w-full flex items-center justify-center gap-3 h-12 text-base font-medium border-input hover:bg-accent hover:text-accent-foreground transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                                        onClick={signInWithGoogle}
                                        disabled={isLoading}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        <Chrome className="w-5 h-5" />
                                        Continue with Google
                                    </Button>

                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-border" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground backdrop-blur-sm">
                                                Or continue with email
                                            </span>
                                        </div>
                                    </div>

                                    {/* Login Form */}
                                    <TabsContent value="login" className="space-y-4 mt-0 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <form onSubmit={handleEmailLogin} className="space-y-4">
                                            <div className="space-y-2 group">
                                                <Label htmlFor="email">Email</Label>
                                                <div className="relative transition-all duration-300 focus-within:scale-[1.02]">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="m@example.com"
                                                        className="pl-10 bg-muted/50 border-input focus:border-primary/50 focus:bg-background transition-all"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 group">
                                                <Label htmlFor="password">Password</Label>
                                                <div className="relative transition-all duration-300 focus-within:scale-[1.02]">
                                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        className="pl-10 bg-muted/50 border-input focus:border-primary/50 focus:bg-background transition-all"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={isLoading}>
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 animate-spin" /> Signing In...</span>
                                                ) : (
                                                    'Sign In'
                                                )}
                                            </Button>
                                        </form>
                                    </TabsContent>

                                    {/* Register Form */}
                                    <TabsContent value="register" className="space-y-4 mt-0 animate-in fade-in slide-in-from-left-4 duration-300">
                                        <form onSubmit={handleRegister} className="space-y-4">
                                            <div className="space-y-2 group">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="John Doe"
                                                    className="bg-muted/50 border-input focus:border-primary/50 focus:bg-background transition-all focus:scale-[1.02]"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2 group">
                                                <Label htmlFor="register-email">Email</Label>
                                                <div className="relative transition-all duration-300 focus-within:scale-[1.02]">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="register-email"
                                                        type="email"
                                                        placeholder="m@example.com"
                                                        className="pl-10 bg-muted/50 border-input focus:border-primary/50 focus:bg-background transition-all"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 group">
                                                <Label htmlFor="register-password">Password</Label>
                                                <div className="relative transition-all duration-300 focus-within:scale-[1.02]">
                                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="register-password"
                                                        type="password"
                                                        className="pl-10 bg-muted/50 border-input focus:border-primary/50 focus:bg-background transition-all"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={isLoading}>
                                                {isLoading ? 'Creating Account...' : 'Create Account'}
                                            </Button>
                                        </form>
                                    </TabsContent>
                                </div>

                                <div className="text-center text-xs text-muted-foreground mt-4">
                                    By clicking continue, you agree to our <span className="underline hover:text-primary cursor-pointer transition-all">Terms of Service</span> and <span className="underline hover:text-primary cursor-pointer transition-all">Privacy Policy</span>.
                                </div>
                            </CardContent>
                        </Tabs>
                    </Card>
                </div>
            </div>

            {/* Global Styles for Custom Animations */}
            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    animation: gradient 6s ease infinite;
                }
            `}</style>
        </div>
    );
};
