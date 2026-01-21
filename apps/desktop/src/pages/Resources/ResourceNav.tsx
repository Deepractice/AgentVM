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
    <div className="w-[200px] h-full bg-[var(--bg-secondary)] border-r border-[var(--border-light)] flex flex-col pt-7 pb-4 drag-region">
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              "mx-2 px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-left",
              isActive
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{t(section.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
