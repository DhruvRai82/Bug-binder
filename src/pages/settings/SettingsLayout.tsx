import { Outlet, NavLink, useLocation } from "react-router-dom";
import { User, Settings, Palette, Bell, Monitor, Key, FolderOpen, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarNavItems = [
    {
        title: "Profile",
        href: "/settings/profile",
        icon: <User className="h-4 w-4" />,
    },
    {
        title: "Account",
        href: "/settings/account",
        icon: <Settings className="h-4 w-4" />,
    },
    {
        title: "Appearance",
        href: "/settings/appearance",
        icon: <Palette className="h-4 w-4" />,
    },
    {
        title: "Notifications",
        href: "/settings/notifications",
        icon: <Bell className="h-4 w-4" />,
    },
    {
        title: "Display",
        href: "/settings/display",
        icon: <Monitor className="h-4 w-4" />,
    },
    {
        title: "AI Brain & Keys",
        href: "/settings/ai",
        icon: <Key className="h-4 w-4" />,
    },
    {
        title: "Projects",
        href: "/settings/projects",
        icon: <FolderOpen className="h-4 w-4" />,
    },
    {
        title: "Version Control",
        href: "/settings/git",
        icon: <GitBranch className="h-4 w-4" />,
    },
];

export default function SettingsLayout() {
    const location = useLocation();

    return (
        <div className="flex flex-col lg:flex-row w-full lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
            <aside className="lg:w-1/5 lg:border-r bg-muted/10 lg:overflow-y-auto">
                <div className="p-6">
                    <div className="mb-6 px-2">
                        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                        <p className="text-muted-foreground text-sm">
                            Manage your account settings and preferences.
                        </p>
                    </div>
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                        {sidebarNavItems.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                className={({ isActive }) =>
                                    cn(
                                        "justify-start text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 px-4 py-2 rounded-md",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted/50"
                                    )
                                }
                            >
                                {item.icon}
                                {item.title}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>
            <div className="flex-1 lg:overflow-y-auto bg-background p-8">
                <Outlet />
            </div>
        </div>
    );
}
