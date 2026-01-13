import { Link, useLocation, Outlet } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
    User,
    Settings,
    Bell,
    Palette,
    Shield,
    Monitor,
    Sparkles,
    GitBranch,
    Folder
} from "lucide-react";
import { TitleBar } from "@/components/common/TitleBar";

const sidebarNavItems = [
    {
        title: "Profile",
        href: "/settings/profile",
        icon: User,
    },
    {
        title: "Account",
        href: "/settings/account",
        icon: Shield,
    },
    {
        title: "Appearance",
        href: "/settings/appearance",
        icon: Palette,
    },
    {
        title: "Notifications",
        href: "/settings/notifications",
        icon: Bell,
    },
    {
        title: "Display",
        href: "/settings/display",
        icon: Monitor,
    },
    {
        title: "AI Integration",
        href: "/settings/ai",
        icon: Sparkles,
    },
    {
        title: "Projects",
        href: "/settings/projects",
        icon: Folder,
    },
    {
        title: "Git Integration",
        href: "/settings/git",
        icon: GitBranch,
    },
];

export default function SettingsLayout() {
    const { pathname } = useLocation();

    return (
        <div className="flex flex-col h-full bg-background">
            {/* TitleBar removed from here as it likely belongs in main layout */}
            <div className="flex-1 space-y-6 p-10 pb-16 overflow-y-auto">
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground">
                        Manage your account settings and set e-mail preferences.
                    </p>
                </div>
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                    <aside className="-mx-4 lg:w-1/5">
                        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 pl-4">
                            {sidebarNavItems.map((item) => (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-3 justify-start rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-colors",
                                        pathname === item.href
                                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </aside>
                    <div className="flex-1 lg:max-w-4xl">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

