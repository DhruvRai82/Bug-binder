import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/common/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings as SettingsIcon, Sun, Moon, Zap } from "lucide-react";
import { Link } from '@tanstack/react-router';

export function MobileHeader() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    if (!user) return null;

    return (
        <header className="sticky top-0 z-40 w-full flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            {/* Brand / Logo */}
            <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-1.5 shadow-sm">
                    <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                    <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TestFlow</span>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="rounded-full w-9 h-9"
                >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                {/* User Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 p-0 overflow-hidden border">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-bold">
                                    {user.email?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/settings" className="cursor-pointer">
                                <SettingsIcon className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => logout()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
