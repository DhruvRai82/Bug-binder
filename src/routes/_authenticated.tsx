import { createFileRoute, Outlet, redirect, useLocation, Link, Navigate } from '@tanstack/react-router'
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
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileNavBar } from "@/components/common/MobileNavBar"
import { MobileHeader } from "@/components/common/MobileHeader"
import { MobileLayout } from "@/mobile/MobileLayout"
import { AppLoadingSkeleton } from '@/components/common/skeletons'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    // Auth check logic can go here or in component (if using context passed from root)
    // For migration, we rely on the component using useAuth() and redirecting
  },
  component: AuthenticatedComponent,
})

function AuthenticatedComponent() {
  const { user, loading, logout } = useAuth()
  const isMobile = useIsMobile()

  if (loading) {
    return <AppLoadingSkeleton />
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (isMobile) {
    return (
      <MobileLayout>
        <MobileHeader />
        {/* We use ProjectWrapper to ensure context is loaded even on mobile dashboard */}
        <ProjectProvider>
          <SettingsProvider>
            <ProjectCheckWrapper />
          </SettingsProvider>
        </ProjectProvider>
      </MobileLayout>
    )
  }

  return (
    <SidebarProvider className="h-screen w-full overflow-hidden">
      <div className="h-full w-full flex overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative z-10">
          <Header user={user} logout={logout} isMobile={false} />
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

function Header({ user, logout, isMobile }: { user: any, logout: () => void, isMobile: boolean }) {
  const { theme, setTheme } = useTheme()
  // const isMobile = useIsMobile(); // REMOVED: Received as prop

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex items-center">
        {!isMobile && <SidebarTrigger className="mr-4" />}
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
