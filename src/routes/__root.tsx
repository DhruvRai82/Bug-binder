import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
      <Sonner />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  ),
  notFoundComponent: NotFound,
})
