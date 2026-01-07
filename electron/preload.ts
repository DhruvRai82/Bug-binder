import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
console.error('[Preload] Script Initializing...');
contextBridge.exposeInMainWorld('electron', {
    ping: () => ipcRenderer.invoke('ping'),
    getProjects: (userId: string) => ipcRenderer.invoke('get-projects', userId),
    createProject: (data: any) => ipcRenderer.invoke('create-project', data),

    // Window Controls
    minimize: () => ipcRenderer.invoke('window-minimize'),
    maximize: () => ipcRenderer.invoke('window-maximize'),
    close: () => ipcRenderer.invoke('window-close'),
});
