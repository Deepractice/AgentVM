import { Settings, Database, Key, Info } from "lucide-react";

const settingsSections = [
  { id: "general", icon: Settings, label: "通用设置" },
  { id: "storage", icon: Database, label: "数据存储" },
  { id: "api", icon: Key, label: "API 密钥" },
  { id: "about", icon: Info, label: "关于" },
];

function SettingsPage() {
  return (
    <div className="h-full flex">
      {/* Sidebar - Settings Nav */}
      <div className="w-64 border-r border-[#3C3C3C] flex flex-col">
        <div className="p-3 border-b border-[#3C3C3C]">
          <h2 className="text-sm font-medium text-gray-300">设置</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-[#2A2D2E] rounded-md text-sm"
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <Settings className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">选择一个设置项</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
