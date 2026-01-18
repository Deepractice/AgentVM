# 006 - Frontend Architecture (Desktop Client)

## Background

AgentVM Desktop 需要一个清晰、解耦的前端架构，支持：

- 多租户工作区管理
- API 数据获取与缓存
- UI 状态管理
- 可测试、可维护的代码结构

---

## 技术选型

| 层            | 技术           | 职责                                  |
| ------------- | -------------- | ------------------------------------- |
| 框架          | React 19       | UI 渲染                               |
| 状态 (UI)     | Zustand        | 客户端状态 (activeTab, currentTenant) |
| 状态 (Server) | TanStack Query | API 数据缓存、同步                    |
| UI 组件       | shadcn/ui      | 基础组件库                            |
| 样式          | Tailwind CSS   | 样式系统                              |
| 图标          | Lucide Icons   | 图标库                                |

---

## 目录结构

```
apps/desktop/src/
├── main.tsx                    # 入口
├── App.tsx                     # 根组件 (Providers + Layout)
│
├── api/                        # API 层 (纯 HTTP)
│   ├── client.ts               # HTTP 客户端封装
│   ├── types.ts                # API 请求/响应类型
│   └── endpoints.ts            # API 端点常量
│
├── services/                   # 业务逻辑层 (可独立测试)
│   ├── tenantService.ts        # 租户业务逻辑
│   ├── agentService.ts         # Agent 业务逻辑
│   └── sessionService.ts       # 会话业务逻辑
│
├── hooks/                      # React Query Hooks
│   ├── useTenants.ts           # 租户查询/变更
│   ├── useAgents.ts            # Agent 查询/变更
│   └── useSessions.ts          # 会话查询/变更
│
├── stores/                     # Zustand Stores (UI 状态)
│   ├── app.ts                  # 全局 UI 状态
│   └── ui.ts                   # 布局/侧边栏状态
│
├── components/
│   ├── layout/                 # 布局组件
│   │   ├── ActivityBar.tsx     # 左侧图标栏
│   │   ├── Sidebar.tsx         # 二级侧边栏容器
│   │   └── StatusBar.tsx       # 底部状态栏
│   │
│   ├── ui/                     # shadcn/ui 组件
│   │   └── ...
│   │
│   └── shared/                 # 共享业务组件
│       ├── TenantSwitcher.tsx  # 租户切换器
│       ├── AgentAvatar.tsx     # Agent 头像
│       └── ...
│
├── pages/                      # 页面组件 (Sidebar + Content)
│   ├── Sessions/
│   │   ├── index.tsx           # 会话页
│   │   ├── SessionList.tsx     # 会话列表 (Sidebar)
│   │   └── SessionChat.tsx     # 会话聊天 (Content)
│   │
│   ├── Agents/
│   │   ├── index.tsx           # 智能体页
│   │   ├── AgentList.tsx       # 智能体列表
│   │   └── AgentDetail.tsx     # 智能体详情
│   │
│   └── Settings/
│       ├── index.tsx           # 设置页
│       └── sections/           # 设置各部分
│
├── types/                      # 类型定义
│   └── index.ts                # 复用 agentvm/client 类型
│
├── lib/                        # 工具函数
│   └── utils.ts                # 通用工具
│
└── styles/
    └── globals.css             # Tailwind + 全局样式
```

---

## 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                        pages/                                │
│                  (组合层 - 不写业务逻辑)                       │
└───────────────────────────┬─────────────────────────────────┘
                            │ 调用
┌───────────────────────────▼─────────────────────────────────┐
│                        hooks/                                │
│               (React 绑定 - useQuery/useMutation)            │
└───────────────────────────┬─────────────────────────────────┘
                            │ 调用
┌───────────────────────────▼─────────────────────────────────┐
│                       services/                              │
│                (业务逻辑 - 可独立测试，不依赖 React)           │
└───────────────────────────┬─────────────────────────────────┘
                            │ 调用
┌───────────────────────────▼─────────────────────────────────┐
│                         api/                                 │
│                   (纯 HTTP - 可替换协议)                      │
└─────────────────────────────────────────────────────────────┘
```

### 各层职责

| 层            | 职责       | 依赖            | 规则                         |
| ------------- | ---------- | --------------- | ---------------------------- |
| `api/`        | HTTP 请求  | fetch           | 只做请求，返回原始数据       |
| `services/`   | 业务逻辑   | api/            | 纯函数，不依赖 React         |
| `hooks/`      | React 绑定 | services/       | 只包装 useQuery/useMutation  |
| `stores/`     | UI 状态    | -               | 只存 UI 状态，不存服务端数据 |
| `pages/`      | 页面组合   | hooks/, stores/ | 只组合，不写逻辑             |
| `components/` | UI 渲染    | props           | 纯 UI，只接收 props          |

---

## 代码示例

### api/client.ts

```typescript
const API_BASE = "http://localhost:8080";

export const http = {
  get: async <T>(url: string): Promise<T> => {
    const res = await fetch(`${API_BASE}${url}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  post: async <T>(url: string, data: unknown): Promise<T> => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  put: async <T>(url: string, data: unknown): Promise<T> => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  delete: async (url: string): Promise<void> => {
    const res = await fetch(`${API_BASE}${url}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
};
```

### services/tenantService.ts

```typescript
import { http } from "../api/client";
import type { Tenant, CreateTenantRequest } from "../types";

export const tenantService = {
  list: (): Promise<Tenant[]> => http.get("/v1/tenants"),

  get: (id: string): Promise<Tenant> => http.get(`/v1/tenants/${id}`),

  create: (data: CreateTenantRequest): Promise<Tenant> => http.post("/v1/tenants", data),

  update: (id: string, data: Partial<Tenant>): Promise<Tenant> =>
    http.put(`/v1/tenants/${id}`, data),

  delete: (id: string): Promise<void> => http.delete(`/v1/tenants/${id}`),
};
```

### hooks/useTenants.ts

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantService } from "../services/tenantService";

export const useTenants = () => {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: tenantService.list,
  });
};

export const useTenant = (id: string) => {
  return useQuery({
    queryKey: ["tenants", id],
    queryFn: () => tenantService.get(id),
    enabled: !!id,
  });
};

export const useCreateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tenantService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tenantService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
};
```

### stores/app.ts

```typescript
import { create } from "zustand";
import type { Tenant } from "../types";

type ActiveTab = "sessions" | "agents" | "settings";

interface AppState {
  // 当前 Tab
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // 当前租户
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;

  // 租户切换弹窗
  tenantSwitcherOpen: boolean;
  openTenantSwitcher: () => void;
  closeTenantSwitcher: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "sessions",
  setActiveTab: (tab) => set({ activeTab: tab }),

  currentTenant: null,
  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),

  tenantSwitcherOpen: false,
  openTenantSwitcher: () => set({ tenantSwitcherOpen: true }),
  closeTenantSwitcher: () => set({ tenantSwitcherOpen: false }),
}));
```

### pages/Agents/index.tsx

```typescript
import { useAgents } from '../../hooks/useAgents';
import { useAppStore } from '../../stores/app';
import { AgentList } from './AgentList';
import { AgentDetail } from './AgentDetail';

export function AgentsPage() {
  const { currentTenant } = useAppStore();
  const { data: agents, isLoading } = useAgents(currentTenant?.tenantId);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  if (!currentTenant) {
    return <div>请先选择租户</div>;
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r">
        <AgentList
          agents={agents ?? []}
          loading={isLoading}
          selectedId={selectedAgentId}
          onSelect={setSelectedAgentId}
        />
      </div>

      {/* Content */}
      <div className="flex-1">
        {selectedAgentId ? (
          <AgentDetail agentId={selectedAgentId} />
        ) : (
          <div>选择一个智能体</div>
        )}
      </div>
    </div>
  );
}
```

---

## 多租户数据存储

```
~/.agentvm/
├── tenants.db                  # 租户元信息
└── app_data/
    ├── tenant_abc123/
    │   ├── agents.db           # 该租户的 Agent
    │   ├── sessions.db         # 该租户的会话
    │   └── resources.db        # 该租户的资源
    └── tenant_def456/
        └── ...
```

---

## ActivityBar 布局

```
┌────┐
│ 👤 │  ← 头像 (CircleUser)
├────┤
│ 💬 │  ← 对话 (MessageSquare)
├────┤
│ 🤖 │  ← 智能体 (Bot)
│    │
│    │  (弹性空白)
│    │
├────┤
│ 🏢 │  ← 租户切换 (Building2)
├────┤
│ ⚙️ │  ← 设置 (Settings)
└────┘
```

---

## 解耦收益

| 变更场景                       | 影响范围           |
| ------------------------------ | ------------------ |
| 换 API 协议 (REST → GraphQL)   | 只改 `api/`        |
| 换状态库 (React Query → SWR)   | 只改 `hooks/`      |
| 换 UI 库 (shadcn → Ant Design) | 只改 `components/` |
| 写单元测试                     | 直接测 `services/` |
| 重构页面                       | 只改 `pages/`      |

---

## 实现优先级

### Phase 1: 基础架构

- [ ] 安装依赖 (zustand, @tanstack/react-query)
- [ ] 搭建目录结构
- [ ] 实现 api/client.ts
- [ ] 实现 stores/app.ts
- [ ] 配置 QueryClientProvider

### Phase 2: 租户管理

- [ ] tenantService.ts
- [ ] useTenants.ts hooks
- [ ] TenantSwitcher 组件
- [ ] ActivityBar 集成租户切换

### Phase 3: 智能体管理

- [ ] agentService.ts
- [ ] useAgents.ts hooks
- [ ] Agents 页面

### Phase 4: 会话管理

- [ ] sessionService.ts
- [ ] useSessions.ts hooks
- [ ] Sessions 页面
- [ ] 聊天界面

---

## Acceptance Criteria

- [ ] 分层清晰，各层职责明确
- [ ] services 层可独立单元测试
- [ ] API 层可替换
- [ ] 状态管理不混用 (UI 用 Zustand，服务端数据用 React Query)
- [ ] 类型安全，复用后端类型
- [ ] 租户切换不丢失状态

---

**Status**: Open
**Priority**: High
**Labels**: architecture, frontend, desktop
