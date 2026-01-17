# @agentvm/core

Core types and utilities for AgentVM.

## Installation

```bash
bun add @agentvm/core
```

## Usage

```typescript
import { AgentVMConfig } from "@agentvm/core";

const config: AgentVMConfig = {
  llm: {
    apiKey: "sk-xxx",
    model: "claude-sonnet-4-20250514",
  },
  port: 8080,
};
```

## License

MIT
