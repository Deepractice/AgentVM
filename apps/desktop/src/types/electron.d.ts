/**
 * Electron API type declarations
 */

interface ElectronAPI {
  getVersion: () => Promise<string>;
  selectFolder: () => Promise<string | null>;
  selectFile: () => Promise<string | null>;
  readFile: (filePath: string) => Promise<string>;
  readDir: (dirPath: string) => Promise<string[]>;
}

interface Window {
  electronAPI: ElectronAPI;
}
