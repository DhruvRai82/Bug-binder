import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Define the dist directory for production builds
const DIST_DIR = path.join(__dirname, '../dist');
const RENDER_DIR = path.join(__dirname, '../dist-electron');
const isDev = process.env.NODE_ENV === 'development';
function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(RENDER_DIR, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: true,
    });
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
app.whenReady().then(() => {
    createWindow();
    ipcMain.handle('ping', () => 'pong');
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
