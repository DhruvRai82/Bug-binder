import React, { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  TestTube2,
  Bug,
  BarChart3,
  Settings,
  Zap,
  Globe,
  PlayCircle,
  Layers,
  Code
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigationGroups = [
  {
    items: [
      { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    ]
  },
  {
    items: [
      { title: "Test Cases", url: "/test-cases", icon: TestTube2 },
      { title: "Bugs", url: "/bugs", icon: Bug, badge: "" },
    ]
  },
  {
    items: [
      { title: "Web Recorder", url: "/recorder", icon: PlayCircle },
      { title: "Automation Suite", url: "/test-hub", icon: Layers },
    ]
  },
  {
    items: [
      { title: "API Lab", url: "/http-lab", icon: Globe },
    ]
  },
  {
    items: [
      { title: "Dev Studio (IDE)", url: "/ide", icon: Code },
      { title: "Test Orchestrator", url: "/test-orchestrator", icon: Layers },
    ]
  }
];

// Helper component that forwards ref to ensure TooltipTrigger works correctly.
// This is critical for preventing "stuck" tooltips.
const SidebarLink = React.forwardRef<
  HTMLAnchorElement,
  { item: any; collapsed: boolean }
>(({ item, collapsed }, ref) => {
  const { pathname } = useLocation();
  // Simple equality check for active state, or startsWith if nested?
  // Previous logic was exact match usually for sidebar items, except maybe sub-routes.
  // Let's use exact match for now as per previous simple logic usually implied, 
  // or checks if it starts with for some.
  // The 'isActive' in NavLink usually implies partial match relative to 'to'.
  // But here we can just check pathname.
  const isActive = pathname === item.url || pathname.startsWith(item.url + '/');

  return (
    <Link
      ref={ref}
      to={item.url}
      className={cn(
        "flex items-center transition-all duration-200 group/link select-none",
        collapsed
          ? "justify-center w-10 h-10 p-0 mx-auto rounded-lg mb-1"
          : "gap-3 px-4 py-3 w-full rounded-xl mb-1",
        isActive
          ? "bg-blue-600 text-white shadow-md font-bold"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
      )}
    >
      <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-5 w-5")} />
      {!collapsed && (
        <>
          <span className="flex-1 text-base tracking-wide">{item.title}</span>
          {item.badge && (
            <Badge
              variant="destructive"
              className="text-xs px-1.5 py-0.5 ml-auto text-white"
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );
});
SidebarLink.displayName = "SidebarLink";

const AdminLink = React.forwardRef<
  HTMLAnchorElement,
  { collapsed: boolean }
>(({ collapsed }, ref) => {
  const { pathname } = useLocation();
  const isActive = pathname.startsWith('/admin');

  return (
    <Link
      ref={ref}
      to="/admin"
      className={cn(
        "flex items-center transition-all duration-200 group/link select-none",
        collapsed
          ? "justify-center w-10 h-10 p-0 mx-auto rounded-lg mb-1"
          : "gap-3 px-4 py-3 w-full rounded-xl mb-1",
        isActive
          ? "bg-blue-600 text-white shadow-md font-bold"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
      )}
    >
      <Shield className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-5 w-5")} />
      {!collapsed && (
        <span className="flex-1 text-base tracking-wide">Admin Panel</span>
      )}
    </Link>
  );
});
AdminLink.displayName = "AdminLink";

// SettingsLink component removed as it is moving to the Profile Dropdown

export function AppSidebar() {
  const { state } = useSidebar();
  const { isAdmin } = useAuth();
  const location = useLocation();


  const isActive = (path: string) => location.pathname === path;
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-[19rem]"} collapsible="icon">
      {/* Explicitly defined TooltipProvider at root of sidebar content if needed, but App likely wraps it */}
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!collapsed && (
          <>
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-2.5 shadow-lg">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TestFlow
                </h1>
                <p className="text-xs text-muted-foreground">Test Management Platform</p>
              </div>
            </div>

            {/* Search */}

          </>
        )}

        {collapsed && (
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-2">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {navigationGroups.map((group, index) => (
          <div key={index}>
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className={collapsed ? "sr-only" : "hidden"}>
                Group {index + 1}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <SidebarLink item={item} collapsed={collapsed} />
                        </TooltipTrigger>
                        {collapsed && (
                          <TooltipContent side="right" className="bg-slate-900 text-white border-slate-700 font-medium z-[50]">
                            {item.title}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {index < navigationGroups.length - 1 && !collapsed && <SidebarSeparator className="my-2 mx-4" />}
          </div>
        ))}


      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {/* Settings moved to Top Right Profile Menu */}
      </SidebarFooter>
    </Sidebar>
  );
}