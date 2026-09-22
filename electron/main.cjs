const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    frame: true, // Native Windows frame with custom titlebar support
    title: 'JN Book & Stationary Shop - Kasir & POS',
    backgroundColor: '#020617', // slate-950
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  // Di mode produksi, muat file dist/index.html
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Sembunyikan menu bar standar Windows (File, Edit, dll) agar UI bersih seperti aplikasi POS kasir modern
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Window Control IPC Handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// Thermal Printing IPC Handlers
ipcMain.handle('print-thermal-receipt', async (event, options = {}) => {
  if (!mainWindow) return { success: false, error: 'Window not found' };

  try {
    mainWindow.webContents.print({
      silent: options.silent !== undefined ? options.silent : false,
      printBackground: true,
      margins: {
        marginType: 'none'
      },
      pageSize: {
        width: options.paperWidth === '80mm' ? 80000 : 58000, // microns
        height: 200000
      }
    }, (success, failureReason) => {
      console.log('Print result:', success, failureReason);
    });
    return { success: true };
  } catch (err) {
    console.error('Print thermal error:', err);
    return { success: false, error: err.message };
  }
});

// Persistent SQLite Storage on Windows File System
const userDataPath = app.getPath('userData');
const localDbPath = path.join(userDataPath, 'jn_pos_database.sqlite.json');

ipcMain.handle('save-database-file', async (event, dataString) => {
  try {
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    fs.writeFileSync(localDbPath, dataString, 'utf-8');
    return { success: true, path: localDbPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-database-file', async () => {
  try {
    if (fs.existsSync(localDbPath)) {
      const content = fs.readFileSync(localDbPath, 'utf-8');
      return { success: true, data: content };
    }
    return { success: false, message: 'File belum ada' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
