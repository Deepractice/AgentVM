import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods to renderer
contextBridge.exposeInMainWorld("electronAPI", {
  // Add IPC methods here if needed
  getVersion: () => ipcRenderer.invoke("get-version"),
});

// Type definitions for exposed API
declare global {
  interface Window {
    electronAPI: {
      getVersion: () => Promise<string>;
    };
  }
}
