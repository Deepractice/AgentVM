import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFile, readdir } from "fs/promises";
import { createServer, type Server } from "agentvm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let server: Server | null = null;

const API_PORT = 8080;

// Start embedded API server
async function startServer() {
  server = await createServer({ port: API_PORT });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1514,
    height: 1240,
    minWidth: 900,
    minHeight: 700,
    titleBarStyle: "hidden", // macOS - traffic lights overlay on content
    trafficLightPosition: { x: 15, y: 14 },
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In development, load from Vite dev server
  if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from built files
    await mainWindow.loadFile(join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await startServer();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("quit", () => {
  if (server) {
    server.close();
  }
});

// IPC Handlers
ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("select-file", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("read-file", async (_event, filePath: string) => {
  return readFile(filePath, "utf-8");
});

ipcMain.handle("read-dir", async (_event, dirPath: string) => {
  return readdir(dirPath);
});
