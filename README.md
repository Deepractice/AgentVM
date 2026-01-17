# AgentVM

AI Agent Virtual Machine - HTTP API for agent lifecycle management.

## Overview

AgentVM is a runtime environment for AI agents, exposing capabilities through HTTP RESTful API. It integrates with AgentX to provide:

- Agent creation and lifecycle management
- Session management
- Streaming responses (SSE)
- Resource management (coming soon)
- Configuration management (coming soon)

## Quick Start

```bash
# Install
bun add @agentvm/avm

# Start server
avm serve --port 8080
```

## API

### Create Agent

```bash
curl -X POST http://localhost:8080/v1/agents \
  -H "Content-Type: application/json" \
  -d '{"name": "assistant", "systemPrompt": "You are helpful"}'
```

### Create Session

```bash
curl -X POST http://localhost:8080/v1/agents/agt_xxx/sessions
```

### Send Message (Streaming)

```bash
curl -N http://localhost:8080/v1/sessions/sess_xxx/messages \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"content": "Hello!"}'
```

## Development

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun run test

# Run BDD tests
bun run test:bdd

# Start dev server
bun run dev
```

## Packages

| Package         | Description              |
| --------------- | ------------------------ |
| `@agentvm/avm`  | Main HTTP server and CLI |
| `@agentvm/core` | Core types and utilities |

## License

MIT
