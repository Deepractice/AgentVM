import { CircleUser, MessageSquare, Bot, Building2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type ActiveTab } from "@/stores/app";

interface ActivityItem {
  id: ActiveTab | "tenant";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  position?: "top" | "bottom";
}

const activities: ActivityItem[] = [
  { id: "sessions", icon: MessageSquare, label: "对话", position: "top" },
  { id: "agents", icon: Bot, label: "智能体", position: "top" },
  { id: "tenant", icon: Building2, label: "切换租户", position: "bottom" },
  { id: "settings", icon: Settings, label: "设置", position: "bottom" },
];

export function ActivityBar() {
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

    return (
      <button
        key={item.id}
        onClick={() => handleClick(item)}
        className={cn(
          "w-12 h-12 flex items-center justify-center rounded-lg transition-colors group relative",
          isActive
            ? "bg-[#37373D] text-white"
            : "text-[#858585] hover:text-[#CCCCCC] hover:bg-[#2A2D2E]"
        )}
        title={item.label}
      >
        <Icon className="w-6 h-6" />

        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {item.label}
        </div>
      </button>
    );
  };

  return (
    <div className="h-full w-14 bg-[#2C2C2C] flex flex-col items-center py-2">
      {/* Avatar */}
      <button
        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mb-4 group relative"
        title="用户"
      >
        <CircleUser className="w-6 h-6" />
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          用户
        </div>
      </button>

      {/* Top activities */}
      <div className="flex flex-col gap-1">
        {topActivities.map(renderButton)}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Current tenant indicator */}
      {currentTenant && (
        <div className="mb-2 px-1">
          <div className="w-10 h-6 bg-[#37373D] rounded text-[10px] text-gray-400 flex items-center justify-center truncate">
            {currentTenant.name.slice(0, 4)}
          </div>
        </div>
      )}

      {/* Bottom activities */}
      <div className="flex flex-col gap-1">
        {bottomActivities.map(renderButton)}
      </div>
    </div>
  );
}
