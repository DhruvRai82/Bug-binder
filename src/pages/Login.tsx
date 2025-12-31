import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Chrome } from 'lucide-react';

export const Login = () => {
    const { user, signInWithGoogle } = useAuth();

    if (user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
            <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                <CardHeader className="text-center space-y-2 pb-8">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <Chrome className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-base">
                        Sign in to Test Automation Studio
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pb-8">
                    <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-3 h-14 text-base font-medium transition-all hover:bg-primary/5 hover:border-primary/20 hover:text-primary group"
                        onClick={signInWithGoogle}
                    >
                        <Chrome className="w-5 h-5 transition-transform group-hover:scale-110" />
                        Continue with Google
                    </Button>
                    <div className="text-center text-xs text-muted-foreground mt-4">
                        By clicking continue, you agree to our <span className="underline hover:text-primary cursor-pointer">Terms of Service</span> and <span className="underline hover:text-primary cursor-pointer">Privacy Policy</span>.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
