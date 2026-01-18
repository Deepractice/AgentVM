import { app, BrowserWindow } from "electron";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
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
