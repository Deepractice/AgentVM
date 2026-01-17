# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**AgentVM** - AI Agent Virtual Machine, an HTTP API server for agent lifecycle management. Built on AgentX.

## Tech Stack

| Layer          | Choice                  |
| -------------- | ----------------------- |
| Runtime        | Bun 1.3.5               |
| HTTP Framework | Hono                    |
| Agent Runtime  | AgentX                  |
| Build          | Turborepo               |
| Test           | Bun test + Cucumber BDD |

## Repository Structure

```text
AgentVM/
├── packages/
│   ├── avm/                 # Main HTTP server and CLI
│   │   ├── src/
│   │   │   ├── cli/         # CLI entry point
│   │   │   └── server/      # HTTP server
│   │   │       └── routes/  # API routes
│   │   └── package.json
│   └── core/                # Core types and utilities
│       ├── src/
│       └── package.json
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
bun run build            # Build all packages
bun run dev              # Start dev server
bun run test             # Run unit tests
bun run test:bdd         # Run BDD tests
bun run typecheck        # Type checking
bun run format           # Format code
bun run lint             # Run ESLint
```

## API Routes

```
GET  /health                    # Health check
POST /v1/agents                 # Create agent
GET  /v1/agents                 # List agents
GET  /v1/agents/:id             # Get agent
DELETE /v1/agents/:id           # Delete agent
POST /v1/agents/:id/stop        # Stop agent
POST /v1/agents/:id/resume      # Resume agent
POST /v1/agents/:id/sessions    # Create session
GET  /v1/sessions/:id           # Get session
POST /v1/sessions/:id/messages  # Send message (SSE)
GET  /v1/sessions/:id/messages  # Get history
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
