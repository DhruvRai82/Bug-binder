const { contextBridge, ipcRenderer } = require('electron');

console.error('[Preload CJS] Script Initializing...');


try {
    contextBridge.exposeInMainWorld('electron', {
        ping: () => ipcRenderer.invoke('ping'),
        getProjects: (userId) => ipcRenderer.invoke('get-projects', userId),
        createProject: (data) => ipcRenderer.invoke('create-project', data),

        // Window Controls
        minimize: () => ipcRenderer.invoke('window-minimize'),
        maximize: () => ipcRenderer.invoke('window-maximize'),
        close: () => ipcRenderer.invoke('window-close'),
    });
    console.log('[Preload] Electron API exposed successfully');
} catch (error) {
    console.error('[Preload] Failed to expose Electron API:', error);
}
