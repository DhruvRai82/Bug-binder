import React from "react";
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
  Code,
  Lock
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
import { useNavigationLock } from "@/contexts/NavigationLockContext";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
      { title: "Flow Builder", url: "/flow-builder", icon: Layers }, // MOVED HERE
      { title: "Automation Suite", url: "/test-hub", icon: Layers },
    ]
  },
  {
    items: [
      { title: "API Lab", url: "/http-lab", icon: Globe },
      { title: "Speed Lab", url: "/speed-lab", icon: Zap },
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
const SidebarLink = React.forwardRef<
  HTMLAnchorElement,
  { item: any; collapsed: boolean; isLocked: boolean }
>(({ item, collapsed, isLocked }, ref) => {
  const { pathname } = useLocation();
  const isActive = pathname === item.url || pathname.startsWith(item.url + '/');

  if (isLocked) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 w-full rounded-xl mb-1 opacity-50 cursor-not-allowed select-none bg-transparent text-muted-foreground",
          collapsed && "justify-center w-10 h-10 p-0 mx-auto"
        )}
      >
        <div className="relative">
          <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-5 w-5")} />
          <div className="absolute -top-1 -right-1 bg-background rounded-full p-0.5">
            <Lock className="w-2.5 h-2.5 text-amber-500" />
          </div>
        </div>
        {!collapsed && <span className="flex-1 text-base tracking-wide">{item.title}</span>}
      </div>
    );
  }

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
  { collapsed: boolean; isLocked: boolean }
>(({ collapsed, isLocked }, ref) => {
  const { pathname } = useLocation();
  const isActive = pathname.startsWith('/admin');

  if (isLocked) {
    return (
      <div className={cn("flex items-center gap-3 px-4 py-3 w-full rounded-xl mb-1 opacity-50 cursor-not-allowed bg-transparent text-muted-foreground", collapsed && "justify-center w-10 h-10 p-0 mx-auto")}>
        <Shield className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-5 w-5")} />
        {!collapsed && <span className="flex-1 text-base tracking-wide">Admin Panel</span>}
      </div>
    )
  }

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

export function AppSidebar() {
  const { state } = useSidebar();
  const { isAdmin } = useAuth();
  const location = useLocation();
  const { isNavLocked } = useNavigationLock(); // Consume Lock Context

  const isActive = (path: string) => location.pathname === path;
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-[19rem]"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!collapsed && (
          <>
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-2.5 shadow-lg relative">
                <Zap className="h-7 w-7 text-white" />
                {isNavLocked && (
                  <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 shadow-sm animate-pulse border border-white">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TestFlow
                </h1>
                <p className="text-xs text-muted-foreground">Test Management Platform</p>
              </div>
            </div>
            {isNavLocked && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] px-2 py-1 rounded text-center mb-2 font-medium animate-in fade-in slide-in-from-left-1">
                Navigation Locked
              </div>
            )}
          </>
        )}

        {collapsed && (
          <div className="flex justify-center relative">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-2">
              <Zap className="h-6 w-6 text-white" />
            </div>
            {isNavLocked && (
              <div className="absolute top-0 right-2 bg-amber-500 rounded-full p-0.5 border border-white">
                <Lock className="w-2 h-2 text-white" />
              </div>
            )}
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
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            {/* We pass isLocked to the actual Link component */}
                            <div>
                              <SidebarLink item={item} collapsed={collapsed} isLocked={isNavLocked} />
                            </div>
                          </TooltipTrigger>
                          {isNavLocked ? (
                            <TooltipContent side="right" className="bg-amber-600 text-white font-medium z-[50]">
                              Flow Builder Active - Close to Navigate
                            </TooltipContent>
                          ) : (
                            collapsed && (
                              <TooltipContent side="right" className="bg-slate-900 text-white border-slate-700 font-medium z-[50]">
                                {item.title}
                              </TooltipContent>
                            )
                          )}
                        </Tooltip>
                      </TooltipProvider>
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