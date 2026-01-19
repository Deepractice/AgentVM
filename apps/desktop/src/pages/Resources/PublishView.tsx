import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublishView() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock: empty for now
  const publishedResources: never[] = [];

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="shrink-0 px-6 pt-6 pb-4 drag-region">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            {t("resources.publish")}
          </h1>
          <button
            className={cn(
              "h-8 px-3 rounded-lg flex items-center gap-2",
              "bg-[#4A7FD4] text-white text-sm font-medium",
              "hover:bg-[#3D6BB3] transition-colors"
            )}
          >
            <Plus className="w-4 h-4" />
            {t("resources.publishResource")}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("resources.searchPublished")}
            className={cn(
              "w-full h-10 pl-10 pr-4 rounded-lg",
              "bg-[var(--bg-card)] border border-[var(--border-light)]",
              "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
              "outline-none focus:border-[var(--border-medium)] transition-colors"
            )}
          />
        </div>
      </div>

      {/* Empty State */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {publishedResources.length > 0 ? (
          <div className="grid gap-3">
            {/* TODO: Render published resources */}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-primary)] mb-1">
              {t("resources.noPublished")}
            </p>
            <p className="text-xs text-[var(--text-muted)]">{t("resources.publishHint")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
