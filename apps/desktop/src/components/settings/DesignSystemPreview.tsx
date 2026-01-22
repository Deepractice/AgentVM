import { cn } from "@/lib/utils";
import {
  Play,
  Plus,
  FileText,
  MoreHorizontal,
  MessageSquare,
  Bot,
  Package,
  Settings,
  Wrench,
  Search,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

/**
 * Design System Preview
 * UI 布局保持原有设计，配色参考 Claude
 */

// Claude 风格的色彩系统（应用到我们的 UI）
const colors = {
  // 布局背景
  layout: {
    activityBar: { color: "#f5f5f3", name: "Activity Bar", desc: "左侧导航栏" },
    sidebar: { color: "#f5f5f3", name: "Sidebar", desc: "侧边栏" },
    main: { color: "#ffffff", name: "Main", desc: "主内容区" },
    card: { color: "#ffffff", name: "Card", desc: "卡片背景" },
    codeBlock: { color: "#f7f7f7", name: "Code Block", desc: "代码块背景" },
    hover: { color: "#ebebeb", name: "Hover", desc: "悬停状态" },
    selected: { color: "#e5e5e3", name: "Selected", desc: "选中状态" },
  },
  // 文字
  text: {
    primary: { color: "#1a1a1a", name: "Primary", desc: "主要文字" },
    secondary: { color: "#666666", name: "Secondary", desc: "次要文字" },
    muted: { color: "#999999", name: "Muted", desc: "弱化/占位符" },
    inverse: { color: "#ffffff", name: "Inverse", desc: "反色文字" },
  },
  // 边框
  border: {
    light: { color: "#e5e5e5", name: "Light", desc: "默认边框" },
    medium: { color: "#d0d0d0", name: "Medium", desc: "Focus 边框" },
  },
  // 强调色（柔和橙，和红色区分度更大）
  accent: {
    primary: { color: "#e8956d", name: "Primary", desc: "主强调色（按钮等）" },
    hover: { color: "#d9845c", name: "Hover", desc: "悬停状态" },
    light: { color: "#fef6f3", name: "Light", desc: "浅色背景" },
  },
  // 用户消息（和选中态一样）
  userMessage: {
    bg: { color: "#e5e5e3", name: "User Bubble", desc: "用户消息背景（=选中态）" },
    text: { color: "#1a1a1a", name: "User Text", desc: "用户消息文字" },
  },
  // 语义色
  semantic: {
    success: { color: "#2e7d32", name: "Success", desc: "成功" },
    error: { color: "#d32f2f", name: "Error", desc: "错误" },
    warning: { color: "#ed6c02", name: "Warning", desc: "警告" },
    info: { color: "#0288d1", name: "Info", desc: "信息" },
  },
  // 代码高亮
  code: {
    keyword: { color: "#2e7d32", name: "Keyword", desc: "关键字" },
    string: { color: "#c17f59", name: "String", desc: "字符串" },
    comment: { color: "#999999", name: "Comment", desc: "注释" },
  },
};

export function DesignSystemPreview() {
  return (
    <div className="space-y-8">
      {/* ========== 设计原则 ========== */}
      <section className="p-4 rounded-lg bg-[#fdf4f1] border border-[#f5e6e0]">
        <h2 className="text-sm font-medium text-[#e8956d] mb-2">设计原则（Claude 配色）</h2>
        <ul className="text-sm text-[#666] space-y-1">
          <li>• <strong>无阴影</strong> - 扁平设计，用边框和背景色区分层级</li>
          <li>• <strong>高对比度</strong> - Sidebar 灰色 vs 主区域白色</li>
          <li>• <strong>单一强调色</strong> - 橙红 #e8956d</li>
          <li>• <strong>简洁状态</strong> - 选中态只用背景色区分</li>
        </ul>
      </section>

      {/* ========== 完整 UI 预览（保持原有布局）========== */}
      <section>
        <SectionTitle>界面预览（原有布局 + Claude 配色）</SectionTitle>
        <div className="rounded-lg border border-[#e5e5e5] overflow-hidden">
          <div className="flex h-[420px]">
            {/* Activity Bar */}
            <div className="w-[54px] bg-[#f5f5f3] border-r border-[#e5e5e5] flex flex-col items-center py-3 gap-1">
              {/* Logo */}
              <div className="w-8 h-8 rounded-lg bg-[#e8956d] flex items-center justify-center text-white text-xs font-bold mb-3">
                A
              </div>

              <ActivityIcon icon={MessageSquare} active />
              <ActivityIcon icon={Bot} />
              <ActivityIcon icon={Package} />

              <div className="flex-1" />

              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-[#e8956d] flex items-center justify-center text-white text-xs font-medium mb-1">
                S
              </div>
              <ActivityIcon icon={Settings} />
            </div>

            {/* Sidebar */}
            <div className="w-[200px] bg-[#f5f5f3] border-r border-[#e5e5e5] flex flex-col">
              <div className="h-10 px-3 flex items-center border-b border-[#e5e5e5]">
                <span className="text-xs font-medium text-[#666]">对话列表</span>
              </div>
              <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                <SidebarItem name="项目讨论" subtitle="选中状态" selected />
                <SidebarItem name="AI 助手" subtitle="默认状态" />
                <SidebarItem name="产品需求" subtitle="默认状态" />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-white">
              {/* Header */}
              <div className="h-10 px-4 flex items-center justify-between border-b border-[#e5e5e5]">
                <span className="text-sm font-medium text-[#1a1a1a]">项目讨论</span>
                <MoreHorizontal className="w-4 h-4 text-[#999]" />
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                <ChatBubble role="ai">您好！项目进展顺利。</ChatBubble>
                <ChatBubble role="user">测试需要多长时间？</ChatBubble>
                <ChatBubble role="ai">预计还需要一周左右。</ChatBubble>
                <ChatBubble role="user">好的，辛苦了</ChatBubble>
              </div>

              {/* Input */}
              <div className="h-20 border-t border-[#e5e5e5] bg-white p-3 flex flex-col">
                <div className="flex-1 px-2 text-sm text-[#999]">输入消息...</div>
                <div className="flex justify-end">
                  <button className="h-7 px-3 rounded-lg text-xs font-medium text-white bg-[#e8956d]">
                    发送
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-[180px] border-l border-[#e5e5e5] bg-[#f5f5f3] flex flex-col">
              <div className="h-10 px-3 flex items-center border-b border-[#e5e5e5]">
                <span className="text-xs font-medium text-[#666]">资源详情</span>
              </div>
              <div className="flex-1 p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#fdf4f1] flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#e8956d]" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#1a1a1a]">test-prompt</div>
                    <div className="text-[10px] text-[#999]">v1.0.0</div>
                  </div>
                </div>
                <button className="w-full h-7 rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-[#e8956d]">
                  <Play className="w-3 h-3" />
                  Execute
                </button>
                <div className="p-2 rounded-lg bg-white border border-[#e5e5e5]">
                  <div className="text-[10px] text-[#999] mb-1">Result</div>
                  <div className="text-[11px] text-[#1a1a1a] font-mono">
                    You are a helpful...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 布局色彩 ========== */}
      <section>
        <SectionTitle>布局色彩</SectionTitle>
        <div className="grid grid-cols-4 gap-3">
          {Object.values(colors.layout).map((c) => (
            <ColorCard key={c.name} {...c} />
          ))}
        </div>
      </section>

      {/* ========== 文字色彩 ========== */}
      <section>
        <SectionTitle>文字色彩</SectionTitle>
        <div className="grid grid-cols-4 gap-3">
          {Object.values(colors.text).map((c) => (
            <ColorCard key={c.name} {...c} />
          ))}
        </div>
      </section>

      {/* ========== 边框色彩 ========== */}
      <section>
        <SectionTitle>边框色彩</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(colors.border).map((c) => (
            <ColorCard key={c.name} {...c} />
          ))}
        </div>
      </section>

      {/* ========== 强调色 ========== */}
      <section>
        <SectionTitle>强调色</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {Object.values(colors.accent).map((c) => (
            <ColorCard key={c.name} {...c} />
          ))}
        </div>
      </section>

      {/* ========== 语义色彩 ========== */}
      <section>
        <SectionTitle>语义色彩</SectionTitle>
        <div className="grid grid-cols-4 gap-3">
          {Object.values(colors.semantic).map((c) => (
            <ColorCard key={c.name} {...c} />
          ))}
        </div>
      </section>

      {/* ========== 代码高亮 ========== */}
      <section>
        <SectionTitle>代码高亮</SectionTitle>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {Object.values(colors.code).map((c) => (
            <ColorCard key={c.name} {...c} />
          ))}
        </div>
        <div className="rounded-lg border border-[#e5e5e5] overflow-hidden">
          <div className="px-3 py-1.5 bg-[#f5f5f3] border-b border-[#e5e5e5]">
            <span className="text-xs text-[#666]">typescript</span>
          </div>
          <pre className="p-4 bg-[#f7f7f7] text-sm font-mono leading-relaxed">
            <code>
              <span className="text-[#999]">// 配置</span>{"\n"}
              <span className="text-[#2e7d32]">const</span> config = {"{"}{"\n"}
              {"  "}name: <span className="text-[#c17f59]">"AgentVM"</span>{"\n"}
              {"}"}
            </code>
          </pre>
        </div>
      </section>

      {/* ========== 按钮样式 ========== */}
      <section>
        <SectionTitle>按钮样式</SectionTitle>
        <div className="p-4 rounded-lg border border-[#e5e5e5] bg-white">
          <div className="flex flex-wrap gap-3 items-center">
            <button className="h-8 px-4 rounded-lg flex items-center gap-2 text-sm font-medium bg-[#e8956d] text-white">
              <Plus className="w-4 h-4" />
              主要按钮
            </button>
            <button className="h-8 px-4 rounded-lg text-sm font-medium bg-[#f5f5f3] text-[#666]">
              次要按钮
            </button>
            <button className="h-8 px-4 rounded-lg text-sm font-medium border border-[#e5e5e5] text-[#666]">
              幽灵按钮
            </button>
            <button className="h-8 px-4 rounded-lg text-sm font-medium bg-[#d32f2f] text-white">
              危险按钮
            </button>
            <button className="h-8 px-4 rounded-lg text-sm font-medium bg-[#f5f5f3] text-[#999] cursor-not-allowed">
              禁用状态
            </button>
          </div>
        </div>
      </section>

      {/* ========== 输入框 ========== */}
      <section>
        <SectionTitle>输入框</SectionTitle>
        <div className="p-4 rounded-lg border border-[#e5e5e5] bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-[#666]">标准输入框</label>
              <input
                type="text"
                placeholder="Placeholder..."
                className="w-full h-10 px-3 rounded-lg bg-white border border-[#e5e5e5] text-sm text-[#1a1a1a] placeholder:text-[#999] outline-none focus:border-[#d0d0d0]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#666]">搜索框</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-10 pl-10 pr-3 rounded-lg bg-white border border-[#e5e5e5] text-sm text-[#1a1a1a] placeholder:text-[#999] outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 徽章/标签 ========== */}
      <section>
        <SectionTitle>徽章 / 标签</SectionTitle>
        <div className="p-4 rounded-lg border border-[#e5e5e5] bg-white space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-[#666]">资源类型</label>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-[#fdf4f1] text-[#e8956d]">
                <FileText className="w-3.5 h-3.5" />
                Prompt
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-[#e8f4fd] text-[#0288d1]">
                <Wrench className="w-3.5 h-3.5" />
                Tool
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[#666]">来源</label>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#f5f5f3] text-[#666]">本地</span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#e8f5e9] text-[#2e7d32]">官方</span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#f3e8fd] text-[#6f42c1]">社区</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 状态指示 ========== */}
      <section>
        <SectionTitle>状态指示</SectionTitle>
        <div className="p-4 rounded-lg border border-[#e5e5e5] bg-white">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-[#e8f5e9] flex items-center gap-2">
              <Check className="w-4 h-4 text-[#2e7d32]" />
              <span className="text-sm text-[#2e7d32]">操作成功</span>
            </div>
            <div className="p-3 rounded-lg bg-[#ffebee] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#d32f2f]" />
              <span className="text-sm text-[#d32f2f]">操作失败</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-xs text-[#999]">
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
              <span className="text-[#999]">→</span>
              <button className="flex items-center gap-1 text-xs text-[#2e7d32]">
                <Check className="w-3.5 h-3.5" />
                Copied
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 尺寸规范 ========== */}
      <section>
        <SectionTitle>布局尺寸</SectionTitle>
        <div className="p-4 rounded-lg border border-[#e5e5e5] bg-white">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#666]">Activity Bar</span>
                <span className="font-mono text-[#1a1a1a]">54px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Sidebar</span>
                <span className="font-mono text-[#1a1a1a]">260px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Right Panel</span>
                <span className="font-mono text-[#1a1a1a]">240px</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#666]">Header 高度</span>
                <span className="font-mono text-[#1a1a1a]">48px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">按钮高度</span>
                <span className="font-mono text-[#1a1a1a]">32px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">输入框高度</span>
                <span className="font-mono text-[#1a1a1a]">40px</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ========== 辅助组件 ========== */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-medium text-[#999] uppercase tracking-wider mb-3">
      {children}
    </h2>
  );
}

function ColorCard({ color, name, desc }: { color: string; name: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-[#f5f5f3]">
      <div
        className="w-10 h-10 rounded-lg border border-[#e5e5e5] shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0">
        <div className="text-xs font-medium text-[#1a1a1a]">{name}</div>
        <div className="text-[10px] text-[#999]">{desc}</div>
        <div className="text-[10px] font-mono text-[#666]">{color}</div>
      </div>
    </div>
  );
}

function ActivityIcon({ icon: Icon, active }: { icon: typeof MessageSquare; active?: boolean }) {
  return (
    <div
      className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
        active ? "bg-[#e5e5e3]" : "hover:bg-[#ebebeb]"
      )}
    >
      <Icon className="w-5 h-5" style={{ color: active ? "#e8956d" : "#666" }} />
    </div>
  );
}

function SidebarItem({
  name,
  subtitle,
  selected,
}: {
  name: string;
  subtitle: string;
  selected?: boolean;
}) {
  return (
    <div
      className={cn(
        "h-14 px-2 flex items-center gap-2 rounded-lg transition-colors cursor-pointer",
        selected ? "bg-[#e5e5e3]" : "hover:bg-[#ebebeb]"
      )}
    >
      <div
        className="w-9 h-9 rounded-md flex items-center justify-center text-xs font-medium shrink-0"
        style={{
          backgroundColor: selected ? "#e8956d" : "#ebebeb",
          color: selected ? "#fff" : "#666",
        }}
      >
        {name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-[#1a1a1a] truncate">{name}</div>
        <div className="text-[10px] text-[#999] truncate">{subtitle}</div>
      </div>
    </div>
  );
}

function ChatBubble({ role, children }: { role: "user" | "ai"; children: React.ReactNode }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] px-3 py-2 rounded-2xl text-xs bg-[#e5e5e3] text-[#1a1a1a]">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[75%] text-xs text-[#1a1a1a]">
        {children}
      </div>
    </div>
  );
}
