
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Link } from '@tanstack/react-router';
import {
    User,
    Settings,
    Sparkles,
    Palette,
    Laptop,
    GitBranch,
    Bell,
    ChevronRight,
    LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const settingsGroups = [
    {
        title: "Account",
        items: [
            { icon: User, label: "Profile", url: "/settings/profile", color: "text-blue-500" },
            { icon: Settings, label: "Account", url: "/settings/account", color: "text-gray-500" },
        ]
    },
    {
        title: "Preferences",
        items: [
            { icon: Sparkles, label: "AI Configuration", url: "/settings/ai", color: "text-purple-500" },
            { icon: Palette, label: "Appearance", url: "/settings/appearance", color: "text-pink-500" },
            { icon: Laptop, label: "Display", url: "/settings/display", color: "text-green-500" },
            { icon: Bell, label: "Notifications", url: "/settings/notifications", color: "text-red-500" },
        ]
    },
    {
        title: "Project",
        items: [
            { icon: GitBranch, label: "Git Integration", url: "/settings/git", color: "text-orange-500" },
            { icon: Settings, label: "Project Settings", url: "/settings/projects", color: "text-indigo-500" },
        ]
    }
];

export function MobileSettingsHub() {
    const { user, logout } = useAuth();

    return (
        <div className="space-y-6 p-4 pb-24">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your preferences</p>
            </div>

            {/* Profile Card */}
            <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl border">
                <img src={user?.photoURL || ''} alt="User" className="h-16 w-16 rounded-full border-2 border-background shadow-sm" />
                <div>
                    <h2 className="text-lg font-semibold">{user?.displayName}</h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
            </div>

            {settingsGroups.map((group) => (
                <div key={group.title} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground ml-2">{group.title}</h3>
                    <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                        {group.items.map((item, index) => (
                            <Link
                                key={item.label}
                                to={item.url}
                                className={`flex items-center justify-between p-4 active:bg-muted/50 transition-colors ${index !== group.items.length - 1 ? 'border-b' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg bg-muted/30 ${item.color}`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-sm">{item.label}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                            </Link>
                        ))}
                    </div>
                </div>
            ))}

            <Button
                variant="destructive"
                className="w-full h-12 rounded-xl mt-8"
                onClick={() => logout()}
            >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
        </div>
    );
}
