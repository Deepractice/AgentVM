import { MessageSquare, Users, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Activity = "chat" | "contacts" | "settings";

const activities = [
  { id: "chat" as Activity, icon: MessageSquare, label: "消息" },
  { id: "contacts" as Activity, icon: Users, label: "通讯录" },
  { id: "settings" as Activity, icon: Settings, label: "设置" },
];

export function ActivityBar() {
  const [active, setActive] = useState<Activity>("chat");

  return (
    <div className="h-full bg-[#2C2C2C] flex flex-col items-center py-2 gap-2">
      {activities.map((activity) => {
        const Icon = activity.icon;
        const isActive = active === activity.id;

        return (
          <button
            key={activity.id}
            onClick={() => setActive(activity.id)}
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-md transition-colors group relative",
              isActive
                ? "bg-[#37373D] text-white"
                : "text-[#858585] hover:text-[#CCCCCC] hover:bg-[#2A2D2E]"
            )}
            title={activity.label}
          >
            <Icon className="w-6 h-6" />

            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {activity.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
