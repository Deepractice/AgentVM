# 005 - Resource Center (资源中心)

## 背景

AgentVM 需要集成 ResourceX，实现一个多租户的本地 Registry。

**"万物皆资源"** - 图片、提示词、工具、沙箱、智能体都是资源，资源可以互联互调，形成 AI 互联网。

资源中心是 ResourceX Registry 协议在 AgentVM 的本地实现，未来会有远程实现。

---

## 架构定位

```
┌─────────────────────────────────────────────────────────────────┐
│                         AgentVM                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               Resource Center (资源中心)                  │   │
│  │                                                          │   │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │   │  Tenant A    │  │  Tenant B    │  │  Tenant C    │  │   │
│  │   │  Registry    │  │  Registry    │  │  Registry    │  │   │
│  │   └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │                                                          │   │
│  │   ┌──────────────────────────────────────────────────┐  │   │
│  │   │          Storage Layer (SQLite + FileSystem)      │  │   │
│  │   └──────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │  Agent Runtime  │  │  Tenant Mgmt    │                      │
│  └─────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 核心概念回顾 (from ResourceX)

| 缩写    | 全称                         | 职责                                  |
| ------- | ---------------------------- | ------------------------------------- |
| **RXL** | Resource eXtensible Locator  | 定位：`domain/path/name.type@version` |
| **RXM** | Resource eXtensible Manifest | 描述：元数据、依赖                    |
| **RXC** | Resource eXtensible Content  | 内容：流式、一次性消费                |
| **RXR** | Resource eXtensible Resource | 完整资源：RXL + RXM + RXC             |

---

## 存储设计

### 设计原则

1. **模块各自管理自己的数据**，先硬编码，跑起来再说
2. **不按租户隔离**，RXL 本身的 `domain/path` 就是归属标识
3. **本地资源用 `localhost/{username}/...`** 区分不同用户

```
~/.agentvm/
├── tenants/                    # Tenant 模块（已有）
│   └── tenants.db
└── registry/                   # Registry 模块（新增）
    ├── registry.db
    └── {domain}/{path}/{name}.{type}@{version}/
        ├── manifest.json
        └── content
```

### 示例

```
~/.agentvm/registry/
├── registry.db
├── localhost/
│   ├── sean/
│   │   └── my-prompt.text@1.0.0/
│   │       ├── manifest.json
│   │       └── content
│   └── alice/
│       └── helper.prompt@1.0.0/
│           ├── manifest.json
│           └── content
└── deepractice.ai/
    └── official/
        └── assistant.agent@1.0.0/
            ├── manifest.json
            └── content
```

### SQLite Schema

`~/.agentvm/registry/registry.db`

```sql
CREATE TABLE resources (
    id TEXT PRIMARY KEY,

    -- RXL 字段
    domain TEXT NOT NULL,
    path TEXT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    version TEXT NOT NULL,
    locator TEXT NOT NULL UNIQUE,   -- 全局唯一

    -- 元数据
    description TEXT,
    tags TEXT,                      -- JSON array

    -- 时间戳
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX idx_resources_domain ON resources(domain);
CREATE INDEX idx_resources_type ON resources(type);
```

---

## API 设计

### 设计原则

使用 **RPC 风格**，操作语义清晰，与 ResourceX Registry 接口一一对应。

### 端点列表

```
POST /v1/registry/publish     # 发布资源
POST /v1/registry/link        # 链接到本地（开发/缓存）
POST /v1/registry/resolve     # 解析资源（获取内容）
POST /v1/registry/delete      # 删除资源
GET  /v1/registry/search      # 搜索资源
GET  /v1/registry/exists      # 检查是否存在
```

### 请求/响应示例

#### publish - 发布资源

```http
POST /v1/registry/publish
Content-Type: multipart/form-data

locator: localhost/sean/my-prompt.text@1.0.0
description: A helpful assistant prompt
tags: ai,chat
content: <file>
```

```json
// Response 201 Created
{
  "id": "res-xxx",
  "locator": "localhost/sean/my-prompt.text@1.0.0",
  "domain": "localhost",
  "path": "sean",
  "name": "my-prompt",
  "type": "text",
  "version": "1.0.0",
  "description": "A helpful assistant prompt",
  "tags": ["ai", "chat"],
  "createdAt": 1705555200000,
  "updatedAt": 1705555200000
}
```

#### link - 链接到本地

```http
POST /v1/registry/link
Content-Type: multipart/form-data

locator: localhost/sean/my-prompt.text@1.0.0
content: <file>
```

```json
// Response 201 Created
{
  "locator": "localhost/sean/my-prompt.text@1.0.0",
  "linked": true
}
```

#### resolve - 解析资源

```http
POST /v1/registry/resolve
Content-Type: application/json

{ "locator": "localhost/sean/my-prompt.text@1.0.0" }
```

```json
// Response 200 OK
{
  "locator": "localhost/sean/my-prompt.text@1.0.0",
  "manifest": {
    "domain": "localhost",
    "path": "sean",
    "name": "my-prompt",
    "type": "text",
    "version": "1.0.0",
    "description": "A helpful assistant prompt"
  },
  "content": "<base64 encoded or stream>"
}
```

#### delete - 删除资源

```http
POST /v1/registry/delete
Content-Type: application/json

{ "locator": "localhost/sean/my-prompt.text@1.0.0" }
```

```json
// Response 200 OK
{ "deleted": true }
```

#### search - 搜索资源

```http
GET /v1/registry/search?type=text&domain=localhost&limit=20&offset=0
```

```json
{
  "items": [
    {
      "locator": "localhost/sean/my-prompt.text@1.0.0",
      "type": "text",
      "description": "A helpful assistant prompt"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

#### exists - 检查存在

```http
GET /v1/registry/exists?locator=localhost/sean/my-prompt.text@1.0.0
```

```json
{ "exists": true }
```

---

## 模块设计

### packages/core

```typescript
// 资源实体
interface Resource {
  id: string;

  // RXL 分解
  domain: string;
  path?: string;
  name: string;
  type: string;
  version: string;

  // 完整定位符
  locator: string;

  // 元数据
  description?: string;
  tags?: string[];

  // 时间戳
  createdAt: number;
  updatedAt: number;
}

// 请求类型
interface CreateResourceRequest {
  locator: string;
  description?: string;
  tags?: string[];
  content: Buffer | ReadableStream;
}

interface ResourceQuery {
  domain?: string;
  type?: string;
  name?: string;
  limit?: number;
  offset?: number;
}

// Repository 接口
interface ResourceRepository {
  create(request: CreateResourceRequest): Promise<Resource>;
  findByLocator(locator: string): Promise<Resource | null>;
  list(query?: ResourceQuery): Promise<{ items: Resource[]; total: number }>;
  delete(locator: string): Promise<boolean>;

  // 内容操作
  getContent(locator: string): Promise<ReadableStream>;
}
```

### packages/avm

```typescript
// SQLite + FileSystem 实现
class LocalResourceRepository implements ResourceRepository {
  private db: Database;
  private baseDir: string; // ~/.agentvm/registry

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.db = openDatabase(`${baseDir}/registry.db`);
    this.initSchema();
  }

  // 元数据 → SQLite
  // 内容 → 文件系统 (manifest.json + content)
}
```

---

## 与 ResourceX 的关系

ResourceX 定义了：

- RXL/RXM/RXC/RXR 类型
- Registry 接口
- ARP 协议

AgentVM Registry：

- **实现** ResourceX Registry 接口
- **本地实现**，未来可有远程实现
- **为 Agent 提供资源访问能力**

```typescript
// AgentVM 实现 ResourceX Registry 接口
import { Registry, RXR } from "@resourcexjs/core";

class LocalRegistry implements Registry {
  constructor(private repository: ResourceRepository) {}

  async resolve(locator: string): Promise<RXR> {
    const resource = await this.repository.findByLocator(locator);
    const content = await this.repository.getContent(locator);
    // 组装为 RXR
  }

  async publish(rxr: RXR): Promise<void> {
    await this.repository.create({
      locator: rxr.locator.toString(),
      content: rxr.content.stream,
    });
  }
}
```

---

## 实现计划

### Phase 1: Core Types

```
packages/core/src/
├── resource/
│   ├── types.ts              # Resource, CreateResourceRequest, ResourceQuery
│   └── ResourceRepository.ts # interface ResourceRepository
└── index.ts
```

### Phase 2: Local Implementation

```
packages/avm/src/
├── registry/
│   └── LocalResourceRepository.ts  # SQLite + FileSystem
└── index.ts
```

### Phase 3: HTTP API

```
packages/avm/src/
├── server/
│   └── routes/
│       └── resources.ts      # PUT/GET/DELETE /v1/resources/:locator
└── index.ts
```

### Phase 4: ResourceX Integration (可选)

```
packages/avm/src/
├── registry/
│   └── LocalRegistry.ts      # implements ResourceX Registry 接口
└── index.ts
```

---

## 开放问题

1. **版本语义**：是否支持 `latest`、`^1.0.0` 等语义化版本匹配？
   - MVP: 只支持精确版本
   - 后续: 支持版本范围

2. **内容类型**：如何处理不同类型的内容？
   - MVP: 简单的 MIME 类型映射
   - 后续: 依赖 ResourceX TypeSystem

3. **大文件**：内容存储是否需要分块？
   - MVP: 不分块，限制文件大小
   - 后续: 支持分块存储

---

## 验收标准

- [ ] Resource 类型定义在 core
- [ ] ResourceRepository 接口定义在 core
- [ ] LocalResourceRepository 实现在 avm
- [ ] HTTP API 支持 PUT/GET/DELETE
- [ ] 支持按 type/domain 查询
- [ ] BDD 测试通过

---

## 相关

- [003-tenant-management.md](./003-tenant-management.md) - 租户管理
- [004-architecture-refinement.md](./004-architecture-refinement.md) - 架构精简
- ResourceX: https://github.com/Deepractice/ResourceX
