import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Database, Key, Info, Palette, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DesignSystemPreview } from "@/components/settings/DesignSystemPreview";

type SettingsSection = "general" | "storage" | "api" | "about" | "design";

const languages = [
  { code: "zh-CN", label: "简体中文" },
  { code: "en", label: "English" },
];

function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");
  const [languageOpen, setLanguageOpen] = useState(false);

  const settingsSections = [
    { id: "general" as SettingsSection, icon: Settings, label: t("settings.general") },
    { id: "storage" as SettingsSection, icon: Database, label: t("settings.storage", "数据存储") },
    { id: "api" as SettingsSection, icon: Key, label: t("settings.apiKeys", "API 密钥") },
    { id: "about" as SettingsSection, icon: Info, label: t("settings.about") },
    { id: "design" as SettingsSection, icon: Palette, label: "设计系统" },
  ];

  const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setLanguageOpen(false);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Language Setting */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {t("settings.language")}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">
            {t("settings.languageDesc", "选择界面显示语言")}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setLanguageOpen(!languageOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-tertiary)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--border-light)] transition-colors"
          >
            {currentLanguage.label}
            <ChevronDown
              className={cn("w-4 h-4 transition-transform", languageOpen && "rotate-180")}
            />
          </button>
          {languageOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg shadow-lg overflow-hidden z-10">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "w-full px-3 py-2 text-sm text-left hover:bg-[var(--bg-tertiary)] transition-colors",
                    lang.code === i18n.language
                      ? "text-[var(--accent-primary)] bg-[var(--bg-tertiary)]"
                      : "text-[var(--text-primary)]"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAboutSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">{t("settings.version")}</span>
        <span className="text-sm text-[var(--text-primary)]">0.1.0</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">Electron</span>
        <span className="text-sm text-[var(--text-primary)]">35.x</span>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return renderGeneralSettings();
      case "about":
        return renderAboutSettings();
      case "design":
        return <DesignSystemPreview />;
      default:
        return (
          <p className="text-[var(--text-muted)]">
            {t("common.developingFeature", "功能开发中...")}
          </p>
        );
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar - Settings Nav */}
      <div className="w-[260px] bg-[var(--bg-secondary)] border-r border-[var(--border-light)] flex flex-col">
        <div className="h-[60px] px-3 flex items-center border-b border-[var(--border-light)] drag-region">
          <h2 className="text-[15px] font-medium text-[var(--text-primary)]">{t("settings.title")}</h2>
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
      <div className="flex-1 bg-[var(--bg-primary)] overflow-y-auto">
        {activeSection === "design" ? (
          <div className="p-6">
            <h1 className="text-xl font-medium text-[var(--text-primary)] mb-6 drag-region">
              设计系统
            </h1>
            {renderContent()}
          </div>
        ) : (
          <div className="p-6">
            <div className="max-w-2xl">
              <h1 className="text-xl font-medium text-[var(--text-primary)] mb-6 drag-region">
                {settingsSections.find((s) => s.id === activeSection)?.label}
              </h1>
              <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)] p-4">
                {renderContent()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
