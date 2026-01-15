import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";

import { useIsMobile } from "@/hooks/use-mobile"

export const Route = createRootRoute({
  component: () => {
    const isMobile = useIsMobile()
    return (
      <>
        <Outlet />
        <Toaster />
        <Sonner />
        {!isMobile && <TanStackRouterDevtools position="bottom-right" />}
      </>
    )
  },
  notFoundComponent: NotFound,
})
