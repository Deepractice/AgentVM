import { Package, Store, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type ResourceSection = "local" | "market" | "publish";

interface ResourceNavProps {
  activeSection: ResourceSection;
  onSectionChange: (section: ResourceSection) => void;
}

const sections: { id: ResourceSection; icon: typeof Package; labelKey: string }[] = [
  { id: "local", icon: Package, labelKey: "resources.local" },
  { id: "market", icon: Store, labelKey: "resources.market" },
  { id: "publish", icon: Upload, labelKey: "resources.publish" },
];

export function ResourceNav({ activeSection, onSectionChange }: ResourceNavProps) {
  const { t } = useTranslation();

  return (
    <div className="w-[260px] h-full bg-[var(--bg-secondary)] border-r border-[var(--border-light)] flex flex-col">
      {/* Header */}
      <div className="h-[60px] px-3 flex items-center border-b border-[var(--border-light)] drag-region">
        <h2 className="text-[15px] font-medium text-[var(--text-primary)]">{t("resources.title")}</h2>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto p-2">
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              "w-full px-3 py-2 rounded-lg flex items-center gap-3 transition-colors text-left",
              isActive
                ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{t(section.labelKey)}</span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
