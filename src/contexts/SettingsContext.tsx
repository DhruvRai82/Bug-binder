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

    // Load settings when project changes
    useEffect(() => {
        if (!selectedProject) return;

        const storageKey = `settings_${selectedProject.id}`;
        const storedSettings = localStorage.getItem(storageKey);

        if (storedSettings) {
            // Merge stored settings with defaults to ensure all keys exist
            setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
        } else {
            // Retrieve global defaults if no project specific settings
            setSettings(defaultSettings);
        }
    }, [selectedProject]);

    const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
        if (!selectedProject) return;

        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };

            // Persist to local storage
            const storageKey = `settings_${selectedProject.id}`;
            localStorage.setItem(storageKey, JSON.stringify(newSettings));

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
