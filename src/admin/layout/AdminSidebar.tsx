import { NavLink } from "react-router-dom";
import {
    BarChart3,
    Users,
    Settings,
    LogOut,
    Shield
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar";

const adminItems = [
    { title: "Dashboard", url: "/admin", icon: BarChart3 },
    { title: "User Management", url: "/admin/users", icon: Users },
    { title: "System Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";

    const getNavClasses = ({ isActive }: { isActive: boolean }) =>
        isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";

    return (
        <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
            <SidebarHeader className="border-b border-sidebar-border p-4">
                {!collapsed && (
                    <div className="flex items-center gap-2 font-bold">
                        <Shield className="h-6 w-6" />
                        <span>Admin Panel</span>
                    </div>
                )}
                {collapsed && <Shield className="h-6 w-6 mx-auto" />}
            </SidebarHeader>

            <SidebarContent className="px-2 py-4">
                <SidebarGroup>
                    <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
                        Controls
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {adminItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <NavLink to={item.url} end={item.url === '/admin'} className={getNavClasses}>
                                            <item.icon className="h-5 w-5" />
                                            {!collapsed && <span>{item.title}</span>}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="hover:bg-red-100/50 text-red-700">
                            <NavLink to="/">
                                <LogOut className="h-5 w-5" />
                                {!collapsed && <span>Exit to App</span>}
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
