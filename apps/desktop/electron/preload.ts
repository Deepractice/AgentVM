const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods to renderer
contextBridge.exposeInMainWorld("electronAPI", {
  // Version
  getVersion: () => ipcRenderer.invoke("get-version"),

  // File system operations
  selectFolder: (): Promise<string | null> => ipcRenderer.invoke("select-folder"),
  selectFile: (): Promise<string | null> => ipcRenderer.invoke("select-file"),
  readFile: (filePath: string): Promise<string> => ipcRenderer.invoke("read-file", filePath),
  readDir: (dirPath: string): Promise<string[]> => ipcRenderer.invoke("read-dir", dirPath),
});
