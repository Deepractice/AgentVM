const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods to renderer
contextBridge.exposeInMainWorld("electronAPI", {
  // Add IPC methods here if needed
  getVersion: () => ipcRenderer.invoke("get-version"),
});
