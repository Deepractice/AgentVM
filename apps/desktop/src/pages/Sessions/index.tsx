import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/app";
import { MessageSquare } from "lucide-react";
import { SessionList } from "./SessionList";
import { ChatArea } from "./ChatArea";

// 临时：获取 session 名称的 mock 函数
const getSessionName = (id: string): string => {
  const names: Record<string, string> = {
    "1": "项目讨论",
    "2": "AI 助手",
    "3": "产品需求分析",
    "4": "技术方案评审",
    "5": "周报总结",
  };
  return names[id] || "未知会话";
};

function SessionsPage() {
  const { t } = useTranslation();
  const { currentTenant } = useAppStore();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  if (!currentTenant) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--text-muted)] drag-region">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t("tenant.selectFirst")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Session List */}
      <SessionList selectedId={selectedSessionId} onSelect={setSelectedSessionId} />

      {/* Chat Area */}
      {selectedSessionId ? (
        <ChatArea sessionId={selectedSessionId} sessionName={getSessionName(selectedSessionId)} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)] drag-region">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <p className="text-lg text-[var(--text-primary)] mb-2">{t("sessions.selectOrCreate")}</p>
            <p className="text-sm text-[var(--text-muted)]">
              {t("tenant.current")}: {currentTenant.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionsPage;
