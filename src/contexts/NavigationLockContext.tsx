import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationLockContextType {
    isNavLocked: boolean;
    setNavLocked: (locked: boolean) => void;
}

const NavigationLockContext = createContext<NavigationLockContextType | undefined>(undefined);

export function NavigationLockProvider({ children }: { children: ReactNode }) {
    const [isNavLocked, setNavLocked] = useState(false);

    return (
        <NavigationLockContext.Provider value={{ isNavLocked, setNavLocked }}>
            {children}
        </NavigationLockContext.Provider>
    );
}

export function useNavigationLock() {
    const context = useContext(NavigationLockContext);
    if (context === undefined) {
        throw new Error('useNavigationLock must be used within a NavigationLockProvider');
    }
    return context;
}
