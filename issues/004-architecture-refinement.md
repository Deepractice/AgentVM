# 004 - 架构精简：职责分离

## 背景

在 ResourceX 开发过程中，讨论了系统架构分层问题。发现当前 AgentX 包含了太多网络层实现（WebSocket Server/Client），导致职责不清晰。

**核心问题：**

- AgentX 既提供 Runtime（Agent 执行引擎），又提供网络层（WebSocket）
- 前端可以直接用 AgentX Client，也可以用 AgentVM Client，混乱
- AgentVM 应该是"唯一的运行时环境"，但现在职责模糊

**解决方案：** 收紧职责，AgentX 只保留 Runtime 核心，AgentVM 提供完整环境。

---

## 架构调整

### 调整前（职责重叠）

```
┌─────────────────────────────────────────────────────────┐
│                    AgentX                                │
│                                                         │
│  ✅ 事件定义                                            │
│  ✅ Agent Runtime                                       │
│  ✅ WebSocket Server     ← 应该由 AgentVM 提供          │
│  ✅ WebSocket Client     ← 应该由 AgentVM 提供          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  AgentVM                                 │
│                                                         │
│  ✅ 集成 AgentX                                         │
│  ❓ 自己实现 WebSocket？还是用 AgentX 的？               │
│  ✅ HTTP Server                                         │
│  ✅ ResourceX 集成                                      │
└─────────────────────────────────────────────────────────┘
```

### 调整后（职责清晰）

```
┌─────────────────────────────────────────────────────────┐
│             AgentX Runtime（纯核心）                      │
│                                                         │
│  ✅ 事件定义和类型系统 (SystemEvent, AgentEvent, etc.)   │
│  ✅ Agent 执行引擎                                      │
│  ✅ 状态管理 (AgentState, Message)                      │
│  ✅ 消息处理逻辑                                         │
│  ❌ 不包含网络层                                         │
└─────────────────────────────────────────────────────────┘
                     │
                     │ 被集成
                     ▼
┌─────────────────────────────────────────────────────────┐
│              AgentVM（完整运行时）                        │
│                                                         │
│  ✅ 自己的 WebSocket Server（基于 AgentX 事件协议）      │
│  ✅ 自己的 HTTP Server                                  │
│  ✅ 自己的客户端 SDK（统一入口）                         │
│  ✅ Kafka 集成                                          │
│  ✅ 集成 AgentX Runtime（调用执行引擎）                  │
│  ✅ 集成 ResourceX（资源管理）                           │
│  ✅ 认证/授权                                           │
│  ✅ 租户管理                                            │
└────────────────┬────────────────────────────────────────┘
                 │ 提供 SDK
                 ▼
┌─────────────────────────────────────────────────────────┐
│          Frontend/Browser/Mobile                         │
│                                                         │
│  使用 AgentVM SDK（唯一客户端）                         │
│  - import { createAgentVMClient } from "@agentvm/sdk"   │
└─────────────────────────────────────────────────────────┘
```

---

## 类比

| 协议/Runtime | 完整环境    | 说明                                       |
| ------------ | ----------- | ------------------------------------------ |
| V8           | Node.js     | V8 是 JS 引擎，Node.js 提供完整环境        |
| AMQP         | RabbitMQ    | AMQP 是协议，RabbitMQ 是实现               |
| HTTP         | Nginx       | HTTP 是协议，Nginx 是 Server               |
| **AgentX**   | **AgentVM** | AgentX 是 Agent 运行时，AgentVM 是完整环境 |

---

## 调整内容

### AgentX 需要调整

**保留：**

- ✅ `@agentxjs/types` - 事件和类型定义
- ✅ `@agentxjs/core` - Agent 执行引擎
- ✅ `@agentxjs/common` - 公共工具（Logger 等）

**移除/弃用：**

- ❌ `@agentxjs/network` 中的 WebSocketServer → 移到 AgentVM
- ❌ `@agentxjs/network` 中的 WebSocketClient → 移到 AgentVM SDK
- ⚠️ 可保留协议定义（ReliableWrapper, AckMessage），供 AgentVM 实现参考

**重命名建议：**

- `agentxjs` → `@agentx/runtime`（更准确反映职责）

### AgentVM 需要实现

1. **WebSocket Server** - 基于 AgentX 事件协议自己实现

   ```typescript
   // packages/server/src/websocket.ts
   class AgentVMWebSocketServer {
     constructor(private runtime: AgentXRuntime) {}

     handleMessage(event: SystemEvent) {
       return this.runtime.execute(event);
     }
   }
   ```

2. **客户端 SDK** - 统一入口

   ```typescript
   // packages/sdk/src/index.ts
   export function createAgentVMClient(url: string) {
     // WebSocket 封装
     // 实现 AgentX 协议
   }
   ```

3. **HTTP Server** - 管理层
   - `/health`
   - `/v1/containers`
   - `/v1/resources`（集成 ResourceX）

---

## 包结构建议

### AgentX（收紧）

```
packages/
├── types/        # 事件和类型定义
├── core/         # Agent 执行引擎
└── common/       # 工具类
```

### AgentVM（完整）

```
packages/
├── server/       # WebSocket + HTTP Server
├── sdk/          # 客户端 SDK（给前端）
├── cli/          # avm 命令行
└── agentvm/      # 主包（组合所有）
```

### ResourceX（独立）

```
packages/
├── arp/          # ARP 协议
├── core/         # RXL/RXM/RXC/RXR
├── registry/     # Registry
└── cli/          # rxm 命令行
```

---

## 迁移路径

1. **Phase 1: AgentX 收紧**
   - 标记 `@agentxjs/network` 为 deprecated
   - 提取核心到 `@agentx/runtime`

2. **Phase 2: AgentVM 实现网络层**
   - 实现自己的 WebSocketServer
   - 实现 AgentVM SDK
   - 参考 AgentX 的 reliable message 协议

3. **Phase 3: 切换**
   - 前端从 `agentxjs` 切换到 `@agentvm/sdk`
   - AgentX `@agentxjs/network` 标记为 legacy

---

## 开放问题

1. AgentX 已有的 WebSocket Client 用户怎么办？
   - 建议：保持兼容一段时间，提供迁移指南

2. AgentX 的 reliable message 协议要保留吗？
   - 建议：作为协议规范保留在 types 包

3. 时间表？
   - 建议：AgentVM v0.1 先实现，AgentX 暂不调整

---

## 验收标准

- [ ] AgentVM 有自己的 WebSocketServer
- [ ] AgentVM 有自己的客户端 SDK
- [ ] 前端只需要 `@agentvm/sdk`，不需要 `agentxjs`
- [ ] AgentX 角色明确：纯 Runtime，无网络层
- [ ] 文档更新，清晰说明各包职责

---

## 相关

- AgentX 项目：https://github.com/Deepractice/AgentX
- ResourceX 项目：https://github.com/Deepractice/ResourceX
- 参考 issue-001: AgentX 集成
