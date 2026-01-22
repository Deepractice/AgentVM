import { MessageSquare, Bot, Package, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAppStore, type ActiveTab } from "@/stores/app";

interface ActivityItem {
  id: ActiveTab | "tenant";
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  position?: "top" | "bottom";
}

const activities: ActivityItem[] = [
  { id: "sessions", icon: MessageSquare, labelKey: "nav.sessions", position: "top" },
  { id: "agents", icon: Bot, labelKey: "nav.agents", position: "top" },
  { id: "resources", icon: Package, labelKey: "nav.resources", position: "top" },
  { id: "settings", icon: Settings, labelKey: "nav.settings", position: "bottom" },
];

export function ActivityBar() {
  const { t } = useTranslation();
  const { activeTab, setActiveTab } = useAppStore();

  const topActivities = activities.filter((a) => a.position === "top");
  const bottomActivities = activities.filter((a) => a.position === "bottom");

  const handleClick = (item: ActivityItem) => {
    setActiveTab(item.id as ActiveTab);
  };

  const renderButton = (item: ActivityItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const label = t(item.labelKey);

    return (
      <button
        key={item.id}
        onClick={() => handleClick(item)}
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-lg transition-colors group relative no-drag",
          isActive
            ? "bg-[var(--bg-tertiary)] text-[var(--accent-primary)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
        )}
        title={label}
      >
        <Icon className="w-6 h-6" />

        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--text-primary)] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {label}
        </div>
      </button>
    );
  };

  return (
    <div
      className="h-full w-[76px] bg-[var(--bg-secondary)] border-r border-[var(--border-light)] flex flex-col items-center pb-3 drag-region"
      style={{ paddingTop: 50 }}
    >
      {/* Top activities */}
      <div className="flex flex-col gap-1">{topActivities.map(renderButton)}</div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Avatar */}
      <button
        className="w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-sm font-medium group relative no-drag"
        title={t("nav.user")}
      >
        S
        <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--text-primary)] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {t("nav.user")}
        </div>
      </button>

      {/* Bottom activities */}
      <div className="flex flex-col gap-1 mt-3">{bottomActivities.map(renderButton)}</div>
    </div>
  );
}
