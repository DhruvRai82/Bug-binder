import { createFileRoute, Outlet, redirect, useLocation, Link } from '@tanstack/react-router'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/common/AppSidebar"
import { ProjectProvider, useProject } from "@/context/ProjectContext"
import { SettingsProvider } from "@/contexts/SettingsContext"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/components/common/ThemeProvider"
import { ProjectSelector } from "@/features/projects/ProjectSelector"
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings as SettingsIcon, Sun, Moon } from "lucide-react"

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    // Auth check logic can go here or in component (if using context passed from root)
    // For migration, we rely on the component using useAuth() and redirecting
  },
  component: AuthenticatedComponent,
})

function AuthenticatedComponent() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <SidebarProvider className="h-screen w-full overflow-hidden">
        <div className="h-full w-full flex overflow-hidden bg-background">
          {/* STATIC Sidebar (High Fidelity) */}
          <div className="w-[19rem] h-full border-r bg-sidebar p-2 flex flex-col gap-2">
            {/* Header Logo Area */}
            <div className="flex items-center space-x-3 mb-4 px-4 py-2 border-b border-sidebar-border">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-2.5 shadow-lg">
                <div className="h-7 w-7 text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TestFlow
                </h1>
                <p className="text-xs text-muted-foreground">Test Management Platform</p>
              </div>
            </div>

            {/* Navigation Groups - Static High Fidelity */}
            <div className="px-2 space-y-1">
              {/* Dashboard */}
              <div className="flex items-center gap-3 px-4 py-3 w-full rounded-xl mb-1 text-slate-700 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
                <span className="flex-1 text-base tracking-wide">Dashboard</span>
              </div>

              {/* Test Cases */}
              <div className="flex items-center gap-3 px-4 py-3 w-full rounded-xl mb-1 text-slate-700 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01v0a2.83 2.83 0 0 1 0-4L17 3" /><path d="m16 2 6 6" /><path d="M12 16H4" /></svg>
                <span className="flex-1 text-base tracking-wide">Test Cases</span>
              </div>

              {/* Bugs */}
              <div className="flex items-center gap-3 px-4 py-3 w-full rounded-xl mb-1 text-slate-700 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect width="8" height="14" x="8" y="6" rx="4" /><path d="m19 7-3 2" /><path d="m5 7 3 2" /><path d="m19 19-3-2" /><path d="m5 19 3-2" /><path d="M20 13h-4" /><path d="M4 13h4" /><path d="m10 4 1 2" /><path d="m14 4-1 2" /></svg>
                <span className="flex-1 text-base tracking-wide">Bugs</span>
              </div>

              {/* Web Recorder */}
              <div className="flex items-center gap-3 px-4 py-3 w-full rounded-xl mb-1 text-slate-700 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
                <span className="flex-1 text-base tracking-wide">Web Recorder</span>
              </div>
            </div>
          </div>

          <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative z-10">
            {/* Header - Almost Static */}
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4">
              {/* Sidebar Trigger Fake */}
              <div className="mr-4 h-8 w-8 rounded-md bg-muted/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M9 3v18" /><path d="m15 9 3 3-3 3" /></svg>
              </div>

              <div className="flex items-center gap-4">
                {/* Theme Toggle Fake */}
                <div className="h-8 w-8 rounded-full bg-muted/10" />
                {/* User Menu Fake - This still needs to be skeleton-ish because we don't have user data yet! */}
                <div className="h-8 w-24 rounded-full bg-muted/10 animate-pulse" />
              </div>
            </header>

            {/* Content Skeleton (Pulsing) */}
            <div className="flex-1 p-6 space-y-6 overflow-hidden">
              <div className="h-8 w-48 bg-muted/10 rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-muted/10 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    )
  }
  if (!user) {
    // Better handling: throw redirect in beforeLoad, but here is fine for now
    // Actually TanStack Router recommends beforeLoad redirects for auth
    // But we need context.auth available in beforeLoad.
    // For now, simple component return is safe.
    throw redirect({ to: '/login' })
    return null
  }

  return (
    <SidebarProvider className="h-screen w-full overflow-hidden">
      <div className="h-full w-full flex overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative z-10">
          <Header user={user} logout={logout} />
          <div id="main-content-scroll" className="flex-1 overflow-y-auto relative">
            <ProjectProvider>
              <SettingsProvider>
                <ProjectCheckWrapper />
              </SettingsProvider>
            </ProjectProvider>
            <ScrollToTop />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

function Header({ user, logout }: { user: any, logout: () => void }) {
  const { theme, setTheme } = useTheme()
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex items-center">
        <SidebarTrigger className="mr-4" />
        <div className="text-sm font-medium">TestFlow Platform</div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full w-8 h-8">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
            <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function ProjectCheckWrapper() {
  const { selectedProject, setSelectedProject } = useProject()
  const location = useLocation()
  const isPublicRoute = location.pathname.startsWith('/settings')

  if (!selectedProject && !isPublicRoute) {
    return <ProjectSelector selectedProject={selectedProject} onProjectSelect={setSelectedProject} />
  }

  return <Outlet />
}
