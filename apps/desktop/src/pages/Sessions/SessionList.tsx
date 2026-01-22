import { useTranslation } from "react-i18next";
import { Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// 模拟数据
const mockSessions = [
  {
    id: "1",
    name: "项目讨论",
    avatar: null,
    lastMessage: "好的，我们明天继续讨论这个方案",
    time: "14:30",
    unread: 2,
  },
  {
    id: "2",
    name: "AI 助手",
    avatar: null,
    lastMessage: "已经帮你完成代码生成了",
    time: "13:20",
    unread: 0,
  },
  {
    id: "3",
    name: "产品需求分析",
    avatar: null,
    lastMessage: "用户反馈已整理完毕",
    time: "昨天",
    unread: 0,
  },
  {
    id: "4",
    name: "技术方案评审",
    avatar: null,
    lastMessage: "这个架构设计看起来不错",
    time: "昨天",
    unread: 0,
  },
  {
    id: "5",
    name: "周报总结",
    avatar: null,
    lastMessage: "本周完成了 3 个功能模块",
    time: "周一",
    unread: 0,
  },
];

interface SessionListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function SessionList({ selectedId, onSelect }: SessionListProps) {
  const { t } = useTranslation();

  return (
    <div className="w-[260px] h-full bg-[var(--bg-secondary)] border-r border-[var(--border-light)] flex flex-col">
      {/* Search Bar */}
      <div className="h-[60px] px-3 flex items-center gap-2 border-b border-[var(--border-light)] drag-region">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-tertiary)] rounded-md">
          <Search className="w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder={t("common.search")}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
          />
        </div>
        <button className="w-7 h-7 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        {mockSessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelect(session.id)}
            className={cn(
              "h-[68px] px-3 flex items-center gap-3 cursor-pointer transition-colors",
              selectedId === session.id
                ? "bg-[var(--bg-tertiary)]"
                : "hover:bg-[var(--bg-tertiary)]"
            )}
          >
            {/* Avatar */}
            <div className="w-11 h-11 rounded-md bg-[var(--accent-primary)] flex items-center justify-center text-white text-[15px] font-medium shrink-0">
              {session.name.slice(0, 1)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 py-1">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-[var(--text-primary)] truncate">
                  {session.name}
                </span>
                <span className="text-[13px] text-[var(--text-muted)] shrink-0 ml-2">
                  {session.time}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[13px] text-[var(--text-muted)] truncate">
                  {session.lastMessage}
                </span>
                {session.unread > 0 && (
                  <span className="ml-2 px-1.5 min-w-[18px] h-[18px] bg-[var(--accent-error)] text-white text-xs rounded-full flex items-center justify-center shrink-0">
                    {session.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
