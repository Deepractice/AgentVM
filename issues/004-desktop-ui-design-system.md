# Desktop UI Design System

本文档定义了 AgentVM Desktop 的 UI 开发规范，包括设计系统、组件规范、布局模式和技术实践。

## 1. 设计理念

### 1.1 核心原则

- **温暖专业**：暖色调背景 + 蓝色强调色，既舒适又企业级
- **简洁高效**：类微信布局，用户熟悉度高
- **一致性**：统一的间距、圆角、交互模式

### 1.2 设计参考

- 微信 Mac 客户端（布局、交互）
- Linear（简洁、专业感）
- Notion（温暖的色调）

---

## 2. 颜色系统

### 2.1 CSS 变量定义

```css
:root {
  /* Background - 暖白色系 */
  --bg-primary: #faf9f7; /* 主背景 */
  --bg-secondary: #f5f4f0; /* 侧边栏背景 */
  --bg-tertiary: #efeee8; /* 悬停/选中背景 */
  --bg-card: #ffffff; /* 卡片/输入区背景 */

  /* Border - 暖灰色 */
  --border-light: #e8e6e0; /* 轻边框 */
  --border-medium: #d9d6ce; /* 中等边框 */

  /* Text - 深暖灰 */
  --text-primary: #1a1915; /* 主文本 */
  --text-secondary: #6b6961; /* 次要文本 */
  --text-muted: #9b9990; /* 弱化文本 */

  /* Accent - 功能色 */
  --accent-primary: #d97757; /* 主强调色（橙红，用于头像等） */
  --accent-hover: #c4684a; /* 强调色悬停 */
  --accent-success: #10a37f; /* 成功（绿色） */
  --accent-error: #ef4444; /* 错误/未读（红色） */
}
```

### 2.2 蓝色强调色（对话气泡）

```css
/* 用户消息气泡 - 企业蓝 */
--message-user-bg: #4a7fd4;
--message-user-hover: #3d6bb3;

/* 助手消息气泡 */
--message-assistant-bg: #ffffff;
--message-assistant-border: var(--border-light);
```

### 2.3 使用规范

| 场景            | 颜色                    |
| --------------- | ----------------------- |
| 页面背景        | `--bg-primary`          |
| 侧边栏/列表背景 | `--bg-secondary`        |
| 悬停/选中状态   | `--bg-tertiary`         |
| 卡片/输入框背景 | `--bg-card`             |
| 用户头像        | `--accent-primary` 渐变 |
| 用户消息气泡    | `#4A7FD4`               |
| 未读徽章        | `--accent-error`        |

---

## 3. 排版系统

### 3.1 字体

```css
font-family:
  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### 3.2 字号规范

| 用途      | 大小 | 类名          |
| --------- | ---- | ------------- |
| 标题      | 16px | `text-base`   |
| 正文      | 14px | `text-sm`     |
| 辅助文本  | 12px | `text-xs`     |
| 徽章/标签 | 10px | `text-[10px]` |

### 3.3 字重

| 用途      | 字重 | 类名          |
| --------- | ---- | ------------- |
| 标题/名称 | 500  | `font-medium` |
| 正文      | 400  | `font-normal` |

---

## 4. 间距系统

基于 4px 网格系统。

### 4.1 常用间距

| 用途       | 大小 | 类名           |
| ---------- | ---- | -------------- |
| 元素内紧凑 | 4px  | `p-1`, `gap-1` |
| 元素内标准 | 8px  | `p-2`, `gap-2` |
| 元素内宽松 | 12px | `p-3`, `gap-3` |
| 区块间距   | 16px | `p-4`, `gap-4` |

### 4.2 组件尺寸

| 组件              | 尺寸             |
| ----------------- | ---------------- |
| Activity Bar 宽度 | 76px             |
| Session List 宽度 | 260px            |
| 列表项高度        | 64px (h-16)      |
| 头像大小          | 40px (w-10 h-10) |
| 按钮高度          | 32px (h-8)       |
| 输入框高度        | 40px (h-10)      |
| 聊天输入区高度    | 250px            |

---

## 5. 圆角规范

| 用途                     | 大小   | 类名           |
| ------------------------ | ------ | -------------- |
| 小元素（徽章、标签）     | 9999px | `rounded-full` |
| 中等元素（按钮、输入框） | 6px    | `rounded-md`   |
| 大元素（卡片、对话框）   | 8px    | `rounded-lg`   |
| 特大元素（模态框）       | 12px   | `rounded-xl`   |

---

## 6. 布局模式

### 6.1 主布局结构

```
┌──────────────────────────────────────────────────┐
│                    Title Bar (macOS)              │
├────────┬─────────────────────────────────────────┤
│        │                                          │
│ Activity│              Main Content               │
│   Bar  │                                          │
│  76px  │                                          │
│        │                                          │
└────────┴─────────────────────────────────────────┘
```

### 6.2 Sessions 页面布局（微信风格）

```
┌────────┬──────────┬───────────────────────────────┐
│        │ Session  │         Chat Header           │
│        │   List   ├───────────────────────────────┤
│Activity│  260px   │                               │
│  Bar   │          │       Message Area            │
│  76px  │ - Search │                               │
│        │ - Items  ├───────────────────────────────┤
│        │          │      Input Area (250px)       │
│        │          │  - Toolbar                    │
│        │          │  - Textarea                   │
│        │          │  - Send Button                │
└────────┴──────────┴───────────────────────────────┘
```

### 6.3 列表项布局

```
┌─────────────────────────────────────────┐
│ ┌────┐                                  │
│ │头像│  名称              时间          │  h-16 (64px)
│ │40px│  最后一条消息      [未读徽章]    │
│ └────┘                                  │
└─────────────────────────────────────────┘
     ↑
   px-3 (12px padding)
```

---

## 7. 交互规范

### 7.1 悬停效果

```tsx
// 标准悬停
className = "hover:bg-[var(--bg-tertiary)]";

// 图标悬停
className = "text-[var(--text-muted)] hover:text-[var(--text-primary)]";
```

### 7.2 选中状态

```tsx
// 列表项选中
className={cn(
  "transition-colors",
  isSelected
    ? "bg-[var(--bg-tertiary)]"
    : "hover:bg-[var(--bg-tertiary)]/50"
)}
```

### 7.3 禁用状态

```tsx
className={cn(
  isDisabled
    ? "bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
    : "bg-[#4A7FD4] text-white hover:bg-[#3D6BB3]"
)}
```

### 7.4 过渡动画

```tsx
// 标准过渡
className = "transition-colors";

// 带透明度过渡
className = "transition-all";
```

---

## 8. 组件规范

### 8.1 按钮

```tsx
// Primary Button
<button className="h-8 px-4 rounded text-sm font-medium bg-[#4A7FD4] text-white hover:bg-[#3D6BB3] transition-colors">
  发送
</button>

// Ghost Button
<button className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors">
  <Icon className="w-5 h-5" />
</button>
```

### 8.2 输入框

```tsx
// Search Input
<div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-tertiary)] rounded-md">
  <Search className="w-4 h-4 text-[var(--text-muted)]" />
  <input
    type="text"
    placeholder="搜索"
    className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
  />
</div>

// Textarea
<textarea
  className="flex-1 py-2 px-3 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none"
/>
```

### 8.3 消息气泡

```tsx
// User Message
<div className="max-w-[70%] px-3 py-2 rounded-lg text-sm bg-[#4A7FD4] text-white">
  {content}
</div>

// Assistant Message
<div className="max-w-[70%] px-3 py-2 rounded-lg text-sm bg-white text-[var(--text-primary)] border border-[var(--border-light)]">
  {content}
</div>
```

### 8.4 头像

```tsx
// 文字头像
<div className="w-10 h-10 rounded-md bg-[var(--accent-primary)] flex items-center justify-center text-white text-sm font-medium">
  {name.slice(0, 1)}
</div>

// 用户头像（渐变）
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-orange-400 flex items-center justify-center text-white">
  <UserIcon className="w-6 h-6" />
</div>
```

---

## 9. 国际化规范

### 9.1 技术栈

- react-i18next
- i18next-browser-languagedetector

### 9.2 文件结构

```
src/locales/
├── en/
│   └── common.json
└── zh-CN/
    └── common.json
```

### 9.3 命名规范

```json
{
  "namespace": {
    "key": "value"
  }
}
```

示例：

```json
{
  "sessions": {
    "title": "对话",
    "new": "新建对话",
    "inputPlaceholder": "输入消息..."
  }
}
```

### 9.4 使用方式

```tsx
import { useTranslation } from "react-i18next";

function Component() {
  const { t } = useTranslation();
  return <span>{t("sessions.title")}</span>;
}
```

### 9.5 禁止硬编码

- 所有用户可见文本必须使用 i18n
- 包括：按钮文本、占位符、提示信息、错误消息

---

## 10. 文件结构

```
src/
├── components/
│   ├── layout/          # 布局组件
│   │   └── ActivityBar.tsx
│   ├── shared/          # 共享组件
│   │   └── TenantSwitcher.tsx
│   └── ui/              # 基础 UI 组件
│       ├── button.tsx
│       └── input.tsx
├── pages/
│   ├── Sessions/
│   │   ├── index.tsx    # 页面入口
│   │   ├── SessionList.tsx
│   │   └── ChatArea.tsx
│   ├── Agents/
│   └── Settings/
├── hooks/
│   ├── agentx/          # AgentX 相关 hooks
│   └── useTenants.ts
├── stores/
│   └── app.ts           # Zustand store
├── locales/
│   ├── en/
│   └── zh-CN/
├── styles/
│   └── globals.css      # 全局样式和 CSS 变量
└── lib/
    └── utils.ts         # 工具函数 (cn)
```

---

## 11. 技术栈

| 类别     | 技术                 |
| -------- | -------------------- |
| 框架     | React 18             |
| 桌面     | Electron 35          |
| 构建     | Vite                 |
| 样式     | Tailwind CSS         |
| 状态管理 | Zustand              |
| 数据请求 | TanStack Query       |
| 国际化   | react-i18next        |
| 图标     | Lucide React         |
| 工具类   | clsx, tailwind-merge |

---

## 12. macOS 适配

### 12.1 标题栏拖拽

```tsx
// 可拖拽区域
<div className="drag-region">...</div>

// 不可拖拽（按钮等交互元素）
<button className="no-drag">...</button>
```

```css
.drag-region {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}
```

### 12.2 标题栏高度

- macOS 标题栏区域：约 28px
- Activity Bar 顶部 padding：50px（为标题栏和头像留空间）

---

## 13. 代码规范

### 13.1 组件命名

- 文件名：PascalCase（`SessionList.tsx`）
- 组件名：PascalCase（`export function SessionList`）
- 导出方式：具名导出（非 default）

### 13.2 样式写法

```tsx
// 推荐：使用 cn 合并类名
import { cn } from "@/lib/utils";

className={cn(
  "base-classes",
  isActive && "active-classes",
  isDisabled && "disabled-classes"
)}

// 推荐：CSS 变量
className="bg-[var(--bg-primary)]"

// 避免：硬编码颜色值（除非是设计系统外的特殊颜色）
className="bg-[#faf9f7]"  // ❌
```

### 13.3 Props 类型

```tsx
interface ComponentProps {
  required: string;
  optional?: number;
  callback: (value: string) => void;
}

export function Component({ required, optional, callback }: ComponentProps) {
  // ...
}
```

---

## 14. 检查清单

新增组件时，确保：

- [ ] 使用 CSS 变量定义颜色
- [ ] 遵循间距系统（4px 网格）
- [ ] 添加过渡动画（`transition-colors`）
- [ ] 文本使用 i18n
- [ ] 响应悬停/选中/禁用状态
- [ ] macOS 拖拽区域正确标记
- [ ] 组件有明确的 Props 类型定义

---

## 更新日志

- 2026-01-18: 初始版本，定义基础设计系统
