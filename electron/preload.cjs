const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  printThermalReceipt: (options) => ipcRenderer.invoke('print-thermal-receipt', options),
  saveDatabaseFile: (data) => ipcRenderer.invoke('save-database-file', data),
  loadDatabaseFile: () => ipcRenderer.invoke('load-database-file')
});
