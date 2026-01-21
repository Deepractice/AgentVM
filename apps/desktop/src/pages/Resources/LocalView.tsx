import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, Plus, Package, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResourceCard } from "./ResourceCard";
import { LinkResourceModal } from "@/components/resources/LinkResourceModal";
import { useResourceSearch } from "@/hooks/useResources";

type FilterType = "all" | "prompt" | "tool";

interface LocalViewProps {
  onResourceSelect?: (locator: string) => void;
}

export function LocalView({ onResourceSelect }: LocalViewProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Fetch resources from API
  const { data, isLoading, isError } = useResourceSearch({
    query: searchQuery || undefined,
  });

  // Filter by type (done client-side)
  const filteredResources = useMemo(() => {
    if (!data?.results) return [];

    return data.results.filter((resource) => {
      if (activeFilter !== "all" && resource.type !== activeFilter) return false;
      return true;
    });
  }, [data?.results, activeFilter]);

  const filters: { id: FilterType; labelKey: string }[] = [
    { id: "all", labelKey: "resources.all" },
    { id: "prompt", labelKey: "resources.prompts" },
    { id: "tool", labelKey: "resources.tools" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="shrink-0 px-6 pt-6 pb-4 drag-region">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            {t("resources.local")}
          </h1>
          <button
            onClick={() => setShowLinkModal(true)}
            className={cn(
              "h-8 px-3 rounded-lg flex items-center gap-2",
              "bg-[#4A7FD4] text-white text-sm font-medium",
              "hover:bg-[#3D6BB3] transition-colors"
            )}
          >
            <Plus className="w-4 h-4" />
            {t("resources.linkResource")}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("resources.searchPlaceholder")}
            className={cn(
              "w-full h-10 pl-10 pr-4 rounded-lg",
              "bg-[var(--bg-card)] border border-[var(--border-light)]",
              "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
              "outline-none focus:border-[var(--border-medium)] transition-colors"
            )}
          />
        </div>

        {/* Type Filters */}
        <div className="flex gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full transition-all duration-200",
                activeFilter === filter.id
                  ? "bg-[var(--text-primary)] text-white"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-light)]"
              )}
            >
              {t(filter.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Resource List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[var(--text-muted)] animate-spin" />
          </div>
        ) : isError ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)]">{t("common.error")}</p>
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid gap-3">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.locator}
                name={resource.name}
                type={resource.type}
                version={resource.version}
                domain={resource.domain}
                locator={resource.locator}
                onClick={() => onResourceSelect?.(resource.locator)}
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)]">{t("resources.empty")}</p>
          </div>
        )}
      </div>

      {/* Link Resource Modal */}
      {showLinkModal && <LinkResourceModal onClose={() => setShowLinkModal(false)} />}
    </div>
  );
}
