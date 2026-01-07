import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Define the dist directory for production builds
// With rootDir="..", this file is in dist-electron/electron/main.js
const DIST_DIR = path.join(__dirname, '../../dist');
const RENDER_DIR = path.join(__dirname, '.'); // preload is properly relative in the same folder
const isDev = process.env.NODE_ENV === 'development';
function createWindow() {
    const preloadPath = path.join(RENDER_DIR, 'preload.cjs');
    console.log('[Main] Loading Preload from:', preloadPath);
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: preloadPath,
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false, // DEBUG: Disable sandbox to rule out issues
        },
        autoHideMenuBar: true, // Hide File/Edit menu (User requested removal)
        frame: true, // Native Title Bar
        // titleBarStyle: 'hidden', // REMOVED
    });
    console.log('[Main] Window created with native frame');
    if (isDev) {
        // In dev, wait for Vite server
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    }
    else {
        // In prod, load static file
        win.loadFile(path.join(DIST_DIR, 'index.html'));
    }
}
import { localProjectService } from '../backend/src/services/LocalProjectService.js';
app.whenReady().then(() => {
    createWindow();
    ipcMain.handle('ping', () => 'pong');
    // Projects IPC
    ipcMain.handle('get-projects', async (event, userId) => {
        console.log('[IPC] get-projects requested for', userId);
        return await localProjectService.getAllProjects(userId);
    });
    ipcMain.handle('create-project', async (event, projectData) => {
        // Destructure to match signature: createProject(name, description, userId, id?)
        const { name, description, userId, id } = projectData;
        console.log('[IPC] create-project', name);
        return await localProjectService.createProject(name, description, userId, id);
    });
    // Window Controls IPC (Global)
    // Window Controls IPC (Global) - REMOVED (Using Native Frame)
    /*
    ipcMain.handle('window-minimize', (event) => { ... });
    ipcMain.handle('window-maximize', (event) => { ... });
    ipcMain.handle('window-close', (event) => { ... });
    */
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
