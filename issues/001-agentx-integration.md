# 001 - AgentX 集成

## 背景

AgentVM 的定位是 AI 智能体运行时，托管 AgentX 服务。

**核心决策**：

1. 直接暴露 AgentX 的 WebSocket 协议，复用 AgentX 同构 API
2. 以 **Container 级别** 为用户分配隔离边界，共享 AgentX 实例
3. AgentVM 管理层通过 HTTP 提供资源中心、配置中心等能力
4. 用户进入 AgentX 域后，全部通过 WebSocket 交互

---

## 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                          AgentVM                                 │
│                                                                  │
│   ┌────────────────────────────────────────────────────────┐    │
│   │                    管理层 (HTTP)                        │    │
│   │                                                         │    │
│   │   /health           → 健康检查                          │    │
│   │   /v1/resources     → 资源中心（后续）                   │    │
│   │   /v1/config        → 配置中心（后续）                   │    │
│   │   /v1/metrics       → 可观测（后续）                     │    │
│   │   /v1/auth          → 认证（后续）                       │    │
│   │                                                         │    │
│   │                  ↓ 分配 Container                       │    │
│   └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│   ┌────────────────────────────────────────────────────────┐    │
│   │                 AgentX 域 (WebSocket)                   │    │
│   │                                                         │    │
│   │   AgentX 实例（共享）                                    │    │
│   │   ┌──────────┐ ┌──────────┐ ┌──────────┐              │    │
│   │   │Container │ │Container │ │Container │ ...          │    │
│   │   │  User A  │ │  User B  │ │  User C  │              │    │
│   │   └──────────┘ └──────────┘ └──────────┘              │    │
│   │                                                         │    │
│   │   /ws → AgentX WebSocket（完整协议）                    │    │
│   └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 为什么是 Container 级别隔离

| 粒度               | 说明                              | 成本                                      |
| ------------------ | --------------------------------- | ----------------------------------------- |
| 实例级别           | 每用户一个 AgentX 进程            | 高（1000 用户 = 1000 进程）               |
| **Container 级别** | 共享 AgentX，每用户一个 Container | 低（1000 用户 = 1 进程 + 1000 Container） |

Container 是 AgentX 设计的隔离边界：

- 每个 Container 有独立的 Images、Sessions、Agents
- 数据完全隔离
- 共享连接池、内存，资源效率高

---

## 目标（v0.1）

1. 创建 AgentVM 服务器
2. 集成 AgentX，暴露 WebSocket 端点
3. 用户可以用 AgentX 客户端直接连接
4. 支持 Container 级别隔离

---

## 期望用法

### 启动服务

```bash
# 启动 AgentVM
avm serve --port 8080

# 通过环境变量配置
LLM_API_KEY=sk-xxx avm serve
```

### 客户端连接

```typescript
import { createAgentX } from "agentxjs";

// 连接 AgentVM
const agentx = await createAgentX({
  serverUrl: "ws://localhost:8080/ws",
});

// 创建/获取用户的 Container
await agentx.request("container_create_request", {
  containerId: "user-alice", // 用户级别的 Container
});

// 在 Container 内创建 Image（对话）
const res = await agentx.request("image_create_request", {
  containerId: "user-alice",
  config: {
    name: "My Assistant",
    systemPrompt: "You are a helpful assistant.",
  },
});

// 发送消息
await agentx.request("message_send_request", {
  imageId: res.data.record.imageId,
  content: "Hello!",
});

// 监听事件
agentx.on("text_delta", (e) => {
  process.stdout.write(e.data.text);
});
```

### 健康检查

```bash
curl http://localhost:8080/health
# → { "status": "ok", "version": "0.1.0" }
```

---

## 技术方案

### 核心实现

```typescript
import { createAgentX } from "agentxjs";
import { Hono } from "hono";
import { serve } from "@hono/node-server";

export async function startServer(config: ServerConfig) {
  const app = new Hono();

  // 健康检查
  app.get("/health", (c) =>
    c.json({
      status: "ok",
      version: "0.1.0",
    })
  );

  // 创建 HTTP Server
  const server = serve({ fetch: app.fetch, port: config.port });

  // 初始化 AgentX 并绑定到 HTTP Server
  const agentx = await createAgentX({
    llm: {
      apiKey: config.llmApiKey,
      model: config.llmModel || "claude-sonnet-4-20250514",
    },
    agentxDir: config.dataDir || "~/.agentvm",
    server: server, // AgentX 自动处理 /ws
  });

  console.log(`AgentVM listening on http://0.0.0.0:${config.port}`);
  console.log(`WebSocket: ws://0.0.0.0:${config.port}/ws`);

  return { app, agentx, server };
}
```

### 依赖

```json
{
  "dependencies": {
    "agentxjs": "^1.x",
    "hono": "^4.x",
    "@hono/node-server": "^1.x",
    "commander": "^12.x"
  }
}
```

---

## 验收标准

### 功能验收

- [ ] `avm serve` 能启动服务器
- [ ] `/health` 返回正常
- [ ] AgentX 客户端能通过 WebSocket 连接
- [ ] 能创建 Container（用户隔离）
- [ ] 能在 Container 内创建 Image
- [ ] 能发送消息并收到流式回复
- [ ] 不同 Container 数据隔离

### 技术验收

- [ ] TypeScript 类型完整
- [ ] 错误处理规范
- [ ] 日志输出

---

## 不包含（后续迭代）

- 认证（WebSocket 握手时验证）
- 资源中心
- 配置中心
- 可观测
- 用户管理（userId ↔ containerId 映射）
