import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DebugDrawer } from '@/components/common/DebugDrawer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    // We will inject auth via InnerApp
    auth: undefined!,
  },
  defaultPreload: 'intent',
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

import { useIsMobile } from "@/hooks/use-mobile";

export default function App() {
  const isMobile = useIsMobile();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AuthProvider>
            <InnerApp />
          </AuthProvider>
          {!isMobile && (
            <>
              <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
              <DebugDrawer />
            </>
          )}
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
