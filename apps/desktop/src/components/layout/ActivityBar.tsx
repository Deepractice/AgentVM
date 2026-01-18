import { CircleUser, MessageSquare, Bot, Building2, Settings } from "lucide-react";
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
  { id: "tenant", icon: Building2, labelKey: "nav.switchTenant", position: "bottom" },
  { id: "settings", icon: Settings, labelKey: "nav.settings", position: "bottom" },
];

export function ActivityBar() {
  const { t } = useTranslation();
  const { activeTab, setActiveTab, currentTenant, openTenantSwitcher } = useAppStore();

  const topActivities = activities.filter((a) => a.position === "top");
  const bottomActivities = activities.filter((a) => a.position === "bottom");

  const handleClick = (item: ActivityItem) => {
    if (item.id === "tenant") {
      openTenantSwitcher();
    } else {
      setActiveTab(item.id as ActiveTab);
    }
  };

  const renderButton = (item: ActivityItem) => {
    const Icon = item.icon;
    const isActive = item.id !== "tenant" && activeTab === item.id;
    const label = t(item.labelKey);

    return (
      <button
        key={item.id}
        onClick={() => handleClick(item)}
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-lg transition-colors group relative no-drag",
          isActive
            ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
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
      {/* Avatar */}
      <button
        className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-orange-400 flex items-center justify-center text-white mb-4 group relative no-drag"
        title={t("nav.user")}
      >
        <CircleUser className="w-6 h-6" />
        <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--text-primary)] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {t("nav.user")}
        </div>
      </button>

      {/* Top activities */}
      <div className="flex flex-col gap-1">{topActivities.map(renderButton)}</div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Current tenant indicator */}
      {currentTenant && (
        <div className="mb-2 px-1">
          <div className="w-9 h-5 bg-[var(--bg-tertiary)] rounded text-[10px] text-[var(--text-secondary)] flex items-center justify-center truncate">
            {currentTenant.name.slice(0, 3)}
          </div>
        </div>
      )}

      {/* Bottom activities */}
      <div className="flex flex-col gap-1">{bottomActivities.map(renderButton)}</div>
    </div>
  );
}
