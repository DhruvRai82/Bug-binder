
import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { MobileNav } from './components/MobileNav';
// We will eventually move MobileNavBar here or refactor it

interface MobileLayoutProps {
    children?: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
    return (
        <div className="h-screen w-full flex flex-col bg-background">
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10 pb-16">
                {/* Content Area */}
                <div id="main-content-scroll" className="flex-1 overflow-y-auto relative p-2">
                    {children || <Outlet />}
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
