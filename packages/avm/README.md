# @agentvm/avm

AgentVM HTTP Server - AI Agent Virtual Machine.

## Installation

```bash
bun add @agentvm/avm
```

## Usage

### CLI

```bash
# Start server
avm serve --port 8080

# With custom data directory
avm serve --data-dir ~/.my-agentvm
```

### Programmatic

```typescript
import { createServer } from "@agentvm/avm";

const server = await createServer({
  port: 8080,
  dataDir: "~/.agentvm",
});
```

## API

### Health Check

```bash
GET /health
```

### Agents

```bash
POST   /v1/agents              # Create agent
GET    /v1/agents              # List agents
GET    /v1/agents/:id          # Get agent
DELETE /v1/agents/:id          # Delete agent
POST   /v1/agents/:id/stop     # Stop agent
POST   /v1/agents/:id/resume   # Resume agent
POST   /v1/agents/:id/sessions # Create session
```

### Sessions

```bash
GET  /v1/sessions/:id          # Get session
POST /v1/sessions/:id/messages # Send message (SSE stream)
GET  /v1/sessions/:id/messages # Get message history
```

## License

MIT
