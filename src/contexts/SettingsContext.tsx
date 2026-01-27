import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';

interface SettingsState {
    // Global Settings
    language: string;
    timezone: string;

    // Project Scoped Settings (Notifications)
    marketingEmails: boolean;
    securityEmails: boolean;
    productUpdates: boolean;
    newComments: boolean;
    mentions: boolean;
    statusChanges: boolean;

    // Display Settings
    sidebarPreference: 'expanded' | 'collapsed';
    density: 'comfortable' | 'compact' | 'spacious';
}

interface SettingsContextType {
    settings: SettingsState;
    updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
}

const defaultSettings: SettingsState = {
    language: 'en',
    timezone: 'utc',
    marketingEmails: false,
    securityEmails: true,
    productUpdates: true,
    newComments: true,
    mentions: true,
    statusChanges: false,
    sidebarPreference: 'expanded',
    density: 'comfortable',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const { selectedProject } = useProject();
    const [settings, setSettings] = useState<SettingsState>(defaultSettings);

    // Load settings from backend AND local storage
    useEffect(() => {
        const loadSettings = async () => {
            try {
                // Try to get token
                const token = await import('@/lib/firebase').then(m => m.auth.currentUser?.getIdToken());
                if (!token) return;

                const { api } = await import('@/lib/api');
                const userProfile = await api.get('/api/user/profile');
                const backendSettings = userProfile.settings;

                if (backendSettings) {
                    setSettings(prev => ({
                        ...prev,
                        ...backendSettings
                    }));
                }
            } catch (error) {
                console.error("Failed to load settings from backend:", error);
            }
        };

        if (selectedProject) {
            loadSettings();
        }
    }, [selectedProject]);

    const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };

            // Sync to Backend (Optimistic)
            import('@/lib/api').then(({ api }) => {
                api.put('/api/user/profile', {
                    settings: { [key]: value }
                }).catch(err => console.error("Failed to sync setting:", key, err));
            });

            return newSettings;
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
