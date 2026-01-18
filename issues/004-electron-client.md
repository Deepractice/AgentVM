# 004 - Electron Client

## Background

AgentVM needs a desktop client for end-to-end user experience. Electron provides:

1. Native desktop experience
2. Embedded AgentVM server (no separate installation)
3. Future migration to Web with minimal effort

**Key Design Principles**:

1. Frontend communicates with backend via HTTP API only (100% Web reusable)
2. Apps go in `apps/` directory, libraries in `packages/`
3. Use shadcn/ui directly in project (not a separate UI package for MVP)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Electron App                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Main Process                             │ │
│  │                                                             │ │
│  │   • Start AgentVM Server (localhost:8080)                   │ │
│  │   • Manage app lifecycle                                    │ │
│  │   • System tray, menus, shortcuts                           │ │
│  │   • Auto-update                                             │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              │ HTTP (localhost:8080)             │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Renderer Process                          │ │
│  │                                                             │ │
│  │   React + TailwindCSS + shadcn/ui                           │ │
│  │                                                             │ │
│  │   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │ │
│  │   │   Tenants    │ │  Resources   │ │    Agents    │       │ │
│  │   └──────────────┘ └──────────────┘ └──────────────┘       │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer       | Choice           | Reason                                |
| ----------- | ---------------- | ------------------------------------- |
| Framework   | Electron + Vite  | Fast build, HMR                       |
| Frontend    | React 18         | Industry standard, easy Web migration |
| Styling     | TailwindCSS      | Utility-first, fast development       |
| Components  | shadcn/ui        | High quality, customizable            |
| State       | Zustand or Jotai | Simple, lightweight                   |
| HTTP Client | ky or fetch      | Lightweight                           |
| Build       | electron-builder | Cross-platform packaging              |

---

## Project Structure

```
AgentVM/
├── packages/                    # Libraries
│   ├── core/                   # Types, interfaces, commands
│   └── avm/                    # Server implementation
│
├── apps/                        # Applications
│   └── desktop/                # Electron app
│       ├── electron/
│       │   ├── main.ts         # Main process
│       │   ├── preload.ts      # Preload script
│       │   └── server.ts       # Embedded AgentVM server
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   ├── api/            # HTTP client
│       │   │   ├── client.ts
│       │   │   ├── tenants.ts
│       │   │   └── resources.ts
│       │   ├── components/
│       │   │   ├── ui/         # shadcn/ui (copied directly)
│       │   │   └── business/   # Business components
│       │   ├── pages/
│       │   │   ├── Tenants.tsx
│       │   │   ├── Resources.tsx
│       │   │   └── Agents.tsx
│       │   ├── stores/         # State management
│       │   └── styles/
│       │       └── globals.css
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       ├── electron-builder.yml
│       └── tsconfig.json
│
└── bdd/                         # BDD tests
```

---

## API Client Design

```typescript
// packages/desktop/src/api/client.ts
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

```typescript
// packages/desktop/src/api/tenants.ts
import { api } from "./client";
import type { Tenant, CreateTenantRequest } from "@agentvm/core";

export const tenantsApi = {
  list: () => api<Tenant[]>("/v1/tenants"),
  get: (id: string) => api<Tenant>(`/v1/tenants/${id}`),
  create: (data: CreateTenantRequest) =>
    api<Tenant>("/v1/tenants", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<CreateTenantRequest>) =>
    api<Tenant>(`/v1/tenants/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    api<{ deleted: boolean }>(`/v1/tenants/${id}`, {
      method: "DELETE",
    }),
};
```

---

## Main Process

```typescript
// packages/desktop/electron/main.ts
import { app, BrowserWindow } from "electron";
import { startEmbeddedServer } from "./server";

let mainWindow: BrowserWindow | null = null;
let serverHandle: { close: () => void } | null = null;

async function createWindow() {
  // Start embedded AgentVM server
  serverHandle = await startEmbeddedServer({ port: 8080 });

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  serverHandle?.close();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
```

```typescript
// packages/desktop/electron/server.ts
import { createServer } from "@agentvm/avm";

export async function startEmbeddedServer(config: { port: number }) {
  const server = await createServer({
    port: config.port,
    dataDir: app.getPath("userData"),
  });

  console.log(`Embedded AgentVM server started on port ${config.port}`);

  return server;
}
```

---

## UI Pages (MVP)

### 1. Tenants Page

```
┌─────────────────────────────────────────────────────────────────┐
│  AgentVM                                          [User] [⚙️]   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐                                                   │
│  │ Tenants  │ ←selected                                         │
│  │ Resources│                                                   │
│  │ Agents   │                                                   │
│  │ Settings │                                                   │
│  └──────────┘                                                   │
│                                                                  │
│  Tenants                                    [+ Create Tenant]    │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📦 Production Tenant                                       │  │
│  │ tenant_abc123 • Created 2 hours ago                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📦 Development Tenant                                      │  │
│  │ tenant_def456 • Created 1 day ago                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Resources Page

```
┌─────────────────────────────────────────────────────────────────┐
│  Resources                                   [+ Link Resource]   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Filter: [All Types ▼] [Search...]                               │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📝 sales-assistant.prompt@1.0.0                            │  │
│  │ AI assistant for sales scenarios                           │  │
│  │ agentvm.local/prompts/                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 🔧 web-search.tool@1.0.0                                   │  │
│  │ Search the web using DuckDuckGo                            │  │
│  │ agentvm.local/tools/                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Agents Page (Chat Interface)

```
┌─────────────────────────────────────────────────────────────────┐
│  Agents                                         [+ New Agent]    │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌─────────────┐  ┌─────────────────────────────────────────┐   │
│  │ Sales Agent │  │                                          │   │
│  │ Research    │  │  👤 What are the top sales strategies?   │   │
│  │ Translator  │  │                                          │   │
│  │             │  │  🤖 Here are the top sales strategies:   │   │
│  │             │  │     1. Consultative selling...           │   │
│  │             │  │     2. Solution selling...               │   │
│  │             │  │                                          │   │
│  │             │  │                                          │   │
│  │             │  ├─────────────────────────────────────────┤   │
│  │             │  │ [Type your message...]          [Send]   │   │
│  └─────────────┘  └─────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Web Migration Path

When ready for Web:

```
apps/
├── desktop/           # Electron app
│   ├── electron/      # Electron-specific (Main Process)
│   └── src/           # ← Shared with Web
│       ├── api/
│       ├── components/
│       ├── pages/
│       └── stores/
│
└── web/               # NEW: Web app
    ├── src/           # Symlink or copy from desktop/src
    └── vite.config.ts # Web-specific config
```

**Changes needed:**

1. Remove Electron-specific code (Main Process)
2. Change `API_BASE` to cloud URL
3. Add authentication (if needed)

**Frontend code: 100% reusable**

---

## Implementation Plan

### Phase 1: Project Setup

- [ ] Create packages/desktop
- [ ] Setup Vite + React + Electron
- [ ] Configure TailwindCSS + shadcn/ui
- [ ] Setup electron-builder

### Phase 2: Core UI

- [ ] Layout component (sidebar + main)
- [ ] API client setup
- [ ] Tenants page (CRUD)
- [ ] Basic routing

### Phase 3: Resources

- [ ] Resources page
- [ ] Resource detail view
- [ ] Link resource dialog

### Phase 4: Agents (Chat)

- [ ] Agent list
- [ ] Chat interface
- [ ] Streaming responses (SSE)

### Phase 5: Polish

- [ ] Error handling
- [ ] Loading states
- [ ] System tray
- [ ] Auto-update

---

## Development Workflow

```bash
# Development (with HMR)
cd apps/desktop
bun run dev

# Build for production
bun run build

# Package for distribution
bun run package
```

---

## Priority

**High** - Enables end-to-end experience and validates API design.

---

**Status**: Open
**Priority**: High
**Labels**: enhancement, desktop, electron
