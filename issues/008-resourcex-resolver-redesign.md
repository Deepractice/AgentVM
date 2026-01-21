# 008 - ResourceX Resolver Schema 支持

## 状态：已完成 ✅

- [x] Resolver 返回函数式对象（resourcexjs@1.3.0）
- [x] Resolver 支持参数 Schema 定义（resourcexjs@1.4.0）
- [x] AgentVM 接入新的 Resolver 接口
- [x] 前端实现 Resolve 功能

---

## 实现记录

### ResourceX 更新

1. **1.3.0**: Resolver 返回函数式对象 `ResolvedResource`
2. **1.4.0**: Resolver 支持参数 Schema 定义

```typescript
interface ResolvedResource<TArgs, TResult> {
  execute: (args?: TArgs) => TResult | Promise<TResult>;
  schema: TArgs extends void ? undefined : JSONSchema;
}

interface ResourceResolver<TArgs = void, TResult = unknown> {
  schema: TArgs extends void ? undefined : JSONSchema;
  resolve(rxr: RXR): Promise<ResolvedResource<TArgs, TResult>>;
}
```

### AgentVM 更新

1. **packages/resource-types/src/prompt.ts** - 更新 promptType resolver
2. **packages/core/src/resource/schemas.ts** - 更新 ResolveResponse 类型
3. **packages/avm/src/http/registry.ts** - 更新 resolve 路由
4. **packages/avm/src/client/index.ts** - 更新 client resolve 方法

### 前端实现

1. **apps/desktop/src/hooks/useResources.ts** - 更新 useResourceResolve hook
2. **apps/desktop/src/pages/Resources/ResourceCard.tsx** - 添加 Resolve 按钮
3. **apps/desktop/src/components/resources/ResolveResourceModal.tsx** - 新增 Resolve 弹窗
4. **apps/desktop/src/pages/Resources/LocalView.tsx** - 集成 Resolve 功能

---

## API 设计

### Request

```http
POST /v1/registry/resolve

{
  "locator": "localhost/test-prompt.prompt@1.0.0",
  "args": { ... }  // 可选，有参数的资源才需要
}
```

### Response

```json
{
  "locator": "localhost/test-prompt.prompt@1.0.0",
  "manifest": {
    "domain": "localhost",
    "name": "test-prompt",
    "type": "prompt",
    "version": "1.0.0"
  },
  "content": "You are a helpful assistant...",
  "schema": null
}
```

---

## UI 流程

```
1. 点击资源卡片的 Resolve 按钮
   ↓
2. 打开 ResolveResourceModal
   ↓
3. 调用 resolve API（不传 args）
   ↓
4. 检查 response.schema
   - schema 为空 → 直接显示 content
   - schema 有值 → 显示参数表单
   ↓
5. 用户填参数 → 点击 Execute → 调用 resolve API（传 args）
   ↓
6. 显示执行结果
```
