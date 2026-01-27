
import React from "react";
import { Link } from "@tanstack/react-router";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Bug,
    PlayCircle,
    Layers,
    Globe,
    Code,
    Shield,
    Settings,
    LogOut,
    Menu,
    Zap,
    GitGraph
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const drawerItems = [
    { title: "Web Recorder", url: "/recorder", icon: PlayCircle, color: "text-orange-500" },
    { title: "Automation", url: "/test-hub", icon: Layers, color: "text-blue-500" },
    { title: "API Lab", url: "/http-lab", icon: Globe, color: "text-green-500" },
    { title: "Dev Studio", url: "/ide", icon: Code, color: "text-purple-500" },
    { title: "Orchestrator", url: "/test-orchestrator", icon: Layers, color: "text-indigo-500" },
    { title: "Speed Lab", url: "/speed-lab", icon: Zap, color: "text-yellow-500" },
];

interface MobileDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
    const { user, logout } = useAuth();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-[20px] px-4 pt-6">
                <SheetHeader className="mb-6 text-left">
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>
                        Access all features and settings.
                    </SheetDescription>
                </SheetHeader>

                <div className="grid grid-cols-4 gap-4 mb-8">
                    {drawerItems.map((item) => (
                        <Link
                            key={item.title}
                            to={item.url}
                            className="flex flex-col items-center gap-2"
                            onClick={() => onOpenChange(false)}
                        >
                            <div className={cn("h-14 w-14 rounded-2xl bg-muted/30 flex items-center justify-center transition-colors hover:bg-muted", item.color && "bg-opacity-10")}>
                                <item.icon className={cn("h-7 w-7", item.color || "text-foreground")} />
                            </div>
                            <span className="text-[11px] font-medium text-center leading-tight">{item.title}</span>
                        </Link>
                    ))}

                    {/* Settings Link */}
                    <Link
                        to="/settings"
                        className="flex flex-col items-center gap-2"
                        onClick={() => onOpenChange(false)}
                    >
                        <div className="h-14 w-14 rounded-2xl bg-muted/30 flex items-center justify-center hover:bg-muted">
                            <Settings className="h-7 w-7 text-gray-500" />
                        </div>
                        <span className="text-[11px] font-medium text-center leading-tight">Settings</span>
                    </Link>
                </div>

                <div className="mt-auto border-t pt-6">
                    <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-muted/20">
                        <img src={user?.photoURL || ''} alt="User" className="h-10 w-10 rounded-full bg-gray-200" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user?.displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    </div>

                    <Button
                        variant="destructive"
                        className="w-full rounded-xl h-12"
                        onClick={() => {
                            onOpenChange(false);
                            logout();
                        }}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
