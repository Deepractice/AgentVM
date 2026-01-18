import { useAppStore } from "@/stores/app";
import { Bot, Plus } from "lucide-react";

function AgentsPage() {
  const { currentTenant } = useAppStore();

  if (!currentTenant) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
        <div className="text-center">
          <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>请先选择一个租户</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Sidebar - Agent List */}
      <div className="w-[260px] bg-[var(--bg-secondary)] border-r border-[var(--border-light)] flex flex-col">
        <div className="p-3 border-b border-[var(--border-light)]">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">智能体</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {/* Empty state */}
          <div className="text-[var(--text-muted)] text-center py-8">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无智能体</p>
          </div>
        </div>

        {/* New Agent Button */}
        <div className="p-2 border-t border-[var(--border-light)]">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm transition-colors">
            <Plus className="w-4 h-4" />
            创建智能体
          </button>
        </div>
      </div>

      {/* Main Content - Agent Detail */}
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
            <Bot className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <p className="text-lg text-[var(--text-primary)] mb-2">选择或创建一个智能体</p>
          <p className="text-sm text-[var(--text-muted)]">当前租户: {currentTenant.name}</p>
        </div>
      </div>
    </div>
  );
}

export default AgentsPage;
