
import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
    BarChart3,
    TestTube2,
    Bug,
    Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Simplified Navigation for Mobile
const mobileNavItems = [
    { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    { title: "Tests", url: "/test-cases", icon: TestTube2 },
    // { title: "Bugs", url: "/bugs", icon: Bug }, // Reduced clutter for now
    { title: "Menu", url: "/settings", icon: Menu }, // Acts as "Simulated" More menu for now
];

export function MobileNavBar() {
    const { pathname } = useLocation();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 pb-safe">
            {mobileNavItems.map((item) => {
                // Active check logic
                const isActive = pathname === item.url || pathname.startsWith(item.url + '/');

                return (
                    <Link
                        key={item.title}
                        to={item.url}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                            isActive
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        <div className={cn("p-1.5 rounded-xl transition-all", isActive && "bg-primary/10")}>
                            <item.icon className={cn("h-6 w-6", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className="text-[10px] tracking-wide">{item.title}</span>
                    </Link>
                );
            })}
        </div>
    );
}
