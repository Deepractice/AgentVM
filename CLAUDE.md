# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**AgentVM** - AI Agent Virtual Machine, an HTTP API server for agent lifecycle management. Built on AgentX.

## Tech Stack

| Layer            | Choice                  |
| ---------------- | ----------------------- |
| Runtime          | Bun 1.3.5               |
| HTTP Framework   | Hono                    |
| Agent Runtime    | AgentX                  |
| Resource Manager | ResourceX               |
| Build            | Turborepo               |
| Test             | Bun test + Cucumber BDD |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Desktop (Electron)                       │
│                   React + Vite + Zustand                    │
│                      (thin client)                          │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP API
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     AVM Server (Hono)                       │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Agents    │  │  Sessions   │  │  Resource Center    │  │
│  │  (AgentX)   │  │  (AgentX)   │  │    (ResourceX)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────────┐  ┌──────────────┐
    │  SQLite  │   │  ~/.agentvm  │  │ Remote Reg.  │
    │ (Tenants)│   │  (Resources) │  │   (future)   │
    └──────────┘   └──────────────┘  └──────────────┘
```

### Key Principle

- **Desktop is a thin client** - Just an Electron shell, all logic in AVM Server
- **AVM owns everything** - HTTP API is the single source of truth
- **Use upstream libs directly** - AgentX for agents, ResourceX for resources

### Resource Center

Resource Center = Local ResourceX Registry

```typescript
import { createRegistry, loadResource } from "resourcexjs";

// AVM uses ResourceX directly
const registry = createRegistry({ path: "~/.agentvm/resources" });

// Link: load from folder → store in local registry
const rxr = await loadResource(folderPath);
await registry.link(rxr);

// Resolve: get resource by locator
const rxr = await registry.resolve("localhost/my-prompt.prompt@1.0.0");
```

**API:**

- `link` = local resource → local registry
- `publish` = local resource → remote registry (future)
- `resolve` = locator → resource content

## Repository Structure

```text
AgentVM/
├── apps/
│   └── desktop/             # Electron desktop client (thin shell)
│       ├── electron/        # Main process
│       └── src/             # React renderer
├── packages/
│   ├── avm/                 # Main HTTP server and CLI
│   │   ├── src/
│   │   │   ├── cli/         # CLI entry point
│   │   │   └── http/        # HTTP routes
│   │   └── package.json
│   ├── core/                # Core types (Tenant, commands)
│   │   └── src/
│   └── resource-types/      # Custom ResourceX types (prompt, etc.)
│       └── src/
├── bdd/                     # BDD tests (Cucumber)
│   ├── features/
│   ├── steps/
│   └── support/
├── issues/                  # Requirements and design docs
└── package.json             # Root workspace
```

## Commands

```bash
bun install              # Install dependencies
bun run build            # Build all packages (fast)
bun run dev              # Start dev server
bun run dev:desktop      # Start desktop dev server
bun run dist:desktop     # Package desktop app (.dmg/.exe)
bun run test             # Run unit tests
bun run test:bdd         # Run BDD tests
bun run typecheck        # Type checking
bun run format           # Format code
bun run lint             # Run ESLint
```

## API Routes

```
GET  /health                      # Health check

# Agents (AgentX)
POST /v1/agents                   # Create agent
GET  /v1/agents                   # List agents
GET  /v1/agents/:id               # Get agent
DELETE /v1/agents/:id             # Delete agent
POST /v1/agents/:id/stop          # Stop agent
POST /v1/agents/:id/resume        # Resume agent

# Sessions (AgentX)
POST /v1/agents/:id/sessions      # Create session
GET  /v1/sessions/:id             # Get session
POST /v1/sessions/:id/messages    # Send message (SSE)
GET  /v1/sessions/:id/messages    # Get history

# Registry (ResourceX)
POST /v1/registry/link            # Link resource (folderPath → local registry)
POST /v1/registry/resolve         # Resolve resource by locator
GET  /v1/registry/exists          # Check if resource exists
POST /v1/registry/delete          # Delete resource from local registry
GET  /v1/registry/search          # Search resources
```

## Development Flow

1. Write issue in `issues/` directory
2. Write BDD feature file
3. Implement code
4. Run tests
5. Create changeset
6. Submit PR

## Coding Standards

- **Language**: English for code, comments, logs
- **Style**: Prettier + ESLint
- **Commits**: Conventional commits (commitlint)
