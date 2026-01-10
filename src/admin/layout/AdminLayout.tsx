import { Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";

export default function AdminLayout() {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background dark:bg-background">
                <AdminSidebar />
                <main className="flex-1 overflow-auto flex flex-col">
                    <div className="p-4 border-b bg-card flex items-center shadow-sm">
                        <SidebarTrigger />
                        <div className="ml-4 font-semibold text-lg">Admin Console</div>
                    </div>
                    <div className="container mx-auto p-6 md:p-8 pt-6 space-y-8 animate-in fade-in duration-500 flex-1">
                        <Outlet />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
