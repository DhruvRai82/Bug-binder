import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { ProjectProvider, useProject } from "@/context/ProjectContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Login } from "@/pages/Login";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";
import Dashboard from "./pages/Dashboard";
import TestCases from "./pages/TestCases";
import Bugs from "./pages/Bugs";
import SettingsLayout from "./pages/settings/SettingsLayout";
import ProfileSettings from "./pages/settings/ProfileSettings";
import AISettings from "./pages/settings/AISettings";
import ProjectSettings from "./pages/settings/ProjectSettings";
import GitSettings from "./pages/settings/GitSettings";
import AppearanceSettings from "./pages/settings/AppearanceSettings";
import AccountSettings from "./pages/settings/AccountSettings";
import NotificationsSettings from "./pages/settings/NotificationsSettings";
import DisplaySettings from "./pages/settings/DisplaySettings";
import Recorder from './pages/Recorder';
import { ScrollToTop } from './components/ScrollToTop';
import ExecutionHistory from './pages/ExecutionHistory';
import VisualTests from './pages/VisualTests';
import TestHub from "./pages/TestHub";
import TestOrchestrator from "./pages/TestOrchestrator";
import TestData from "./pages/TestData";
import Schedules from "./pages/Schedules";
import APILab from "./pages/APILab";
import IdeLayout from "./pages/IDE/IdeLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings as SettingsIcon, User as UserIcon, Sun, Moon } from "lucide-react";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DebugDrawer } from '@/components/DebugDrawer';
//import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";


import NotFound from "./pages/NotFound";
import { ProjectSelector } from "./components/ProjectSelector";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { selectedProject, setSelectedProject } = useProject();
  const location = useLocation();

  // Allow access to settings without a project selected
  // Check if we need to show project selector
  // Allow access to settings and admin without project selection
  const isPublicRoute = location.pathname === '/settings' || location.pathname.startsWith('/admin');

  if (!selectedProject && !isPublicRoute) {
    return <ProjectSelector selectedProject={selectedProject} onProjectSelect={setSelectedProject} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard selectedProject={selectedProject} />} />
      <Route path="/dashboard" element={<Dashboard selectedProject={selectedProject} />} />
      <Route path="/test-cases" element={<TestCases selectedProject={selectedProject} />} />
      <Route path="/bugs" element={<Bugs selectedProject={selectedProject} />} />
      <Route path="/recorder" element={<Recorder />} />
      {/* Both routes point to the new ExecutionHistory component */}
      <Route path="/execution-reports" element={<ExecutionHistory />} />
      <Route path="/execution-history" element={<ExecutionHistory />} />
      <Route path="/visual-tests" element={<VisualTests />} />
      <Route path="/visual-tests" element={<VisualTests />} />
      <Route path="/test-hub" element={<TestHub />} />
      <Route path="/test-orchestrator" element={<TestOrchestrator />} />




      <Route path="/test-data" element={<TestData />} />
      <Route path="/schedules" element={<Schedules />} />
      <Route path="/http-lab" element={<APILab />} />
      <Route path="/ide" element={<IdeLayout />} />
      <Route path="/settings" element={<SettingsLayout />}>
        <Route index element={<Navigate to="/settings/profile" replace />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="account" element={<AccountSettings />} />
        <Route path="appearance" element={<AppearanceSettings />} />
        <Route path="notifications" element={<NotificationsSettings />} />
        <Route path="display" element={<DisplaySettings />} />
        <Route path="ai" element={<AISettings />} />
        <Route path="projects" element={<ProjectSettings />} />
        <Route path="git" element={<GitSettings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <div className="w-full h-screen">
        <ProjectProvider>
          <SettingsProvider>
            <AppRoutes />
          </SettingsProvider>
        </ProjectProvider>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="h-screen w-full flex overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <div className="text-sm font-medium">TestFlow Platform</div>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newTheme = theme === 'dark' ? 'light' : 'dark';
                    setTheme(newTheme);
                  }}
                  className="rounded-full w-8 h-8"
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                      <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-zinc-200" />
                      <span className="font-medium">{user.displayName}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
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
                    <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => {
                      logout();
                    }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </header>
          <div id="main-content-scroll" className="flex-1 overflow-y-auto relative">
            <ProjectProvider>
              <SettingsProvider>
                <AppRoutes />
              </SettingsProvider>
            </ProjectProvider>
            <ScrollToTop />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        <DebugDrawer />
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
