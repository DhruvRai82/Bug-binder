export interface ElectronAPI {
    ping: () => Promise<string>;
    getProjects: (userId: string) => Promise<any[]>;
    createProject: (data: any) => Promise<any>;
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
}

declare global {
    interface Window {
        electron?: ElectronAPI;
    }
}
