import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/app";
import { Bot, Plus } from "lucide-react";

function AgentsPage() {
  const { t } = useTranslation();
  const { currentTenant } = useAppStore();

  if (!currentTenant) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--text-muted)] drag-region">
        <div className="text-center">
          <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t("tenant.selectFirst")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Sidebar - Agent List */}
      <div className="w-[260px] bg-[var(--bg-secondary)] border-r border-[var(--border-light)] flex flex-col">
        <div className="p-3 border-b border-[var(--border-light)] drag-region">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">{t("agents.title")}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {/* Empty state */}
          <div className="text-[var(--text-muted)] text-center py-8">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("agents.empty")}</p>
          </div>
        </div>

        {/* New Agent Button */}
        <div className="p-2 border-t border-[var(--border-light)]">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm transition-colors">
            <Plus className="w-4 h-4" />
            {t("agents.create")}
          </button>
        </div>
      </div>

      {/* Main Content - Agent Detail */}
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)] drag-region">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
            <Bot className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <p className="text-lg text-[var(--text-primary)] mb-2">{t("agents.selectOrCreate")}</p>
          <p className="text-sm text-[var(--text-muted)]">
            {t("tenant.current")}: {currentTenant.name}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AgentsPage;
