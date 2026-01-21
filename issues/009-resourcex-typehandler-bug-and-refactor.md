# 009 - ResourceX TypeHandlerChain Bug 修复与架构改造

## 状态：待处理

---

## 问题一：Bundle 后单例失效 (Bug)

### 现象

```typescript
import { createRegistry, globalTypeHandlerChain } from "resourcexjs";

const myType = { name: "prompt", ... };
const registry = createRegistry({ types: [myType] });

const rxr = await registry.resolve("localhost/test.prompt@1.0.0");
await globalTypeHandlerChain.resolve(rxr);
// ❌ 报错：Unsupported resource type: prompt
```

### 原因

Bundle 后 `TypeHandlerChain` 类出现了两次：

```javascript
// Bundle 后的代码
class TypeHandlerChain { static instance; ... }
var globalTypeHandlerChain = TypeHandlerChain.getInstance();  // 实例 A（导出）

class TypeHandlerChain2 { static instance; ... }  // 被 rename
var globalTypeHandlerChain2 = TypeHandlerChain2.getInstance();  // 实例 B

class ARPRegistry {
  constructor(config) {
    globalTypeHandlerChain2.register(type);  // 注册到实例 B
  }
}

export { globalTypeHandlerChain };  // 导出实例 A（没有注册的类型）
```

### 期望

`createRegistry({ types })` 注册的类型和 `globalTypeHandlerChain` 是同一个实例。

### 临时方案（AgentVM 侧）

在使用前手动注册类型到导出的 `globalTypeHandlerChain`。

---

## 问题二：架构设计问题

### 现状

`TypeHandlerChain` 是全局单例，独立于 `Registry` 存在。

```
┌─────────────┐     ┌─────────────────────┐
│  Registry   │     │  globalTypeHandler  │  ← 独立的全局单例
│             │     │  Chain              │
└─────────────┘     └─────────────────────┘
```

### 问题

1. 全局单例容易出现 Bundle 问题（如上）
2. 无法查询某个 Registry 支持哪些类型
3. 多个 Registry 实例共享同一个 TypeHandlerChain，可能冲突

### 建议架构

`TypeHandlerChain` 应该属于 `Registry`：

```
┌─────────────────────────────────────┐
│            Registry                  │
│  ┌───────────────────────────────┐  │
│  │       TypeHandlerChain        │  │
│  │  - builtinTypes               │  │
│  │  - customTypes (prompt, tool) │  │
│  └───────────────────────────────┘  │
│                                      │
│  - link()                            │
│  - resolve()                         │
│  - search()                          │
│  - delete()                          │
│  - getSupportedTypes() ← 新增        │
│  - resolveContent(rxr) ← 新增        │
└─────────────────────────────────────┘
```

### 建议改造

```typescript
class ARPRegistry {
  // TypeHandlerChain 属于 Registry
  public readonly typeHandler: TypeHandlerChain;

  constructor(config) {
    // 每个 Registry 有自己的 TypeHandlerChain
    this.typeHandler = new TypeHandlerChain();

    // 注册内置类型
    for (const type of builtinTypes) {
      this.typeHandler.register(type);
    }

    // 注册自定义类型
    if (config?.types) {
      for (const type of config.types) {
        this.typeHandler.register(type);
      }
    }
  }

  /**
   * 获取支持的类型列表
   */
  getSupportedTypes(): ResourceType[] {
    return this.typeHandler.getRegisteredTypes();
  }

  /**
   * 解析资源并执行 resolver 获取内容
   */
  async resolveContent<TArgs, TResult>(
    locator: string,
    args?: TArgs
  ): Promise<ResolvedContent<TResult>> {
    const rxr = await this.resolve(locator);
    const resolved = await this.typeHandler.resolve<TArgs, TResult>(rxr);
    const content = await resolved.execute(args);

    return {
      locator: rxr.locator.toString(),
      manifest: rxr.manifest,
      content,
      schema: resolved.schema,
    };
  }
}
```

### 好处

1. **解决 Bundle 问题**：不依赖全局单例
2. **支持查询类型**：`registry.getSupportedTypes()`
3. **API 更简洁**：`registry.resolveContent()` 一步到位
4. **隔离性更好**：多个 Registry 可以有不同的类型配置

---

## AgentVM 使用场景

### 当前（workaround）

```typescript
// 需要手动注册 + 分两步调用
import { createRegistry, globalTypeHandlerChain } from "resourcexjs";

globalTypeHandlerChain.register(promptType); // 手动注册
const registry = createRegistry({ path, types: [promptType] });

const rxr = await registry.resolve(locator);
const resolved = await globalTypeHandlerChain.resolve(rxr); // 分开调用
const content = await resolved.execute(args);
```

### 改造后

```typescript
// 一步到位
const registry = createRegistry({ path, types: [promptType] });

// 直接获取内容
const result = await registry.resolveContent(locator, args);
console.log(result.content);

// 查询支持的类型
const types = registry.getSupportedTypes();
// [{ name: "text", ... }, { name: "prompt", ... }]
```

### 新增 API（AgentVM HTTP）

```http
GET /v1/registry/types

Response:
{
  "types": [
    { "name": "text", "aliases": ["txt"], "description": "Plain text" },
    { "name": "json", "aliases": ["config"], "description": "JSON content" },
    { "name": "binary", "aliases": ["bin"], "description": "Binary content" },
    { "name": "prompt", "aliases": ["template"], "description": "AI prompt" }
  ]
}
```

---

## 期望输出

### 短期（Bug 修复）

- [ ] 修复 Bundle 配置，确保 `globalTypeHandlerChain` 只有一个实例

### 长期（架构改造）

- [ ] `TypeHandlerChain` 成为 `Registry` 的成员
- [ ] 新增 `Registry.getSupportedTypes()` 方法
- [ ] 新增 `Registry.resolveContent()` 方法
- [ ] 废弃全局 `globalTypeHandlerChain`（或保留向后兼容）

---

## 讨论

1. 是否保留 `globalTypeHandlerChain` 做向后兼容？
2. `resolveContent()` 的命名是否合适？
3. 是否需要支持不同 Registry 有不同的类型配置？
