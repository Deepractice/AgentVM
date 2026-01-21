# 007 - Resource Search API

## Background

当前 LocalView 使用 mock 数据展示本地资源列表，需要接入真实的 search API 来获取已 link 的资源。

## 状态：已完成 ✅

ResourceX 已实现 ARP list 操作和 Registry.search()，AgentVM 已接入。

## 架构分析

### 协议层次

```text
┌─────────────────────────────────────────────────────────┐
│                      Registry                            │
│        link / resolve / search / delete                  │
│                    (统一接口)                             │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                        ARP                               │
│     resolve / deposit / exists / delete / list           │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   file://           https://          s3://
   本地仓库          远程仓库          云存储
```

### 不同 Transport 的实现

| Transport  | list 实现                                     |
| ---------- | --------------------------------------------- |
| `file://`  | `fs.readdir` + 分页                           |
| `https://` | `GET /api/search?query=...&limit=20&offset=0` |
| `s3://`    | `ListObjectsV2` + pagination                  |

通过分页参数解决性能问题，避免一次性加载所有资源。

## API 设计

### Request

```http
GET /v1/registry/search?query=prompt&limit=20&offset=0
```

### Response

```json
{
  "results": [
    {
      "locator": "localhost/sean/system-prompt.prompt@1.0.0",
      "domain": "localhost",
      "path": "sean",
      "name": "system-prompt",
      "type": "prompt",
      "version": "1.0.0"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

## 完成记录

- [x] **[ResourceX]** ARP 添加 list 操作
- [x] **[ResourceX]** file transport handler 实现 list
- [x] **[ResourceX]** ARPRegistry.search() 实现
- [x] **[AgentVM]** 升级 resourcexjs (1.2.0)
- [x] **[AgentVM]** 添加 search API 路由 (`packages/avm/src/http/registry.ts`)
- [x] **[AgentVM]** 添加 search schema (`packages/core/src/resource/schemas.ts`)
- [x] **[AgentVM]** 添加客户端 search 方法 (`packages/avm/src/client/index.ts`)
- [x] **[AgentVM]** 前端 hook (`apps/desktop/src/hooks/useResources.ts`)
- [x] **[AgentVM]** LocalView 接入真实数据，移除 mock 数据
