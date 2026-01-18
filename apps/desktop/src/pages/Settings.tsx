import { useState } from "react";
import { Settings, Database, Key, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsSection = "general" | "storage" | "api" | "about";

const settingsSections = [
  { id: "general" as SettingsSection, icon: Settings, label: "通用设置" },
  { id: "storage" as SettingsSection, icon: Database, label: "数据存储" },
  { id: "api" as SettingsSection, icon: Key, label: "API 密钥" },
  { id: "about" as SettingsSection, icon: Info, label: "关于" },
];

function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");

  return (
    <div className="h-full flex">
      {/* Sidebar - Settings Nav */}
      <div className="w-[260px] bg-[var(--bg-secondary)] border-r border-[var(--border-light)] flex flex-col">
        <div className="p-3 border-b border-[var(--border-light)]">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">设置</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[var(--bg-primary)] p-6">
        <div className="max-w-2xl">
          <h1 className="text-xl font-medium text-[var(--text-primary)] mb-6">
            {settingsSections.find((s) => s.id === activeSection)?.label}
          </h1>

          <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)] p-4">
            <p className="text-[var(--text-muted)]">设置内容开发中...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
