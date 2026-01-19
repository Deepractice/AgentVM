import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, Plus, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResourceCard } from "./ResourceCard";
import { LinkResourceModal } from "@/components/resources/LinkResourceModal";

type FilterType = "all" | "prompt" | "tool";

// Mock data
const mockLocalResources = [
  {
    id: "1",
    name: "system-prompt",
    description: "Default system prompt for AI assistants with comprehensive instructions",
    type: "prompt",
    version: "1.0.0",
    domain: "localhost",
    locator: "localhost/sean/system-prompt.prompt@1.0.0",
  },
  {
    id: "2",
    name: "file-reader",
    description: "Read and parse various file formats including PDF, DOCX, and more",
    type: "tool",
    version: "1.2.0",
    domain: "localhost",
    locator: "localhost/tools/file-reader.tool@1.2.0",
  },
];

export function LocalView() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showLinkModal, setShowLinkModal] = useState(false);

  const filteredResources = useMemo(() => {
    return mockLocalResources.filter((resource) => {
      if (activeFilter !== "all" && resource.type !== activeFilter) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          resource.name.toLowerCase().includes(query) ||
          resource.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [searchQuery, activeFilter]);

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
        {filteredResources.length > 0 ? (
          <div className="grid gap-3">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                name={resource.name}
                description={resource.description}
                type={resource.type}
                version={resource.version}
                domain={resource.domain}
                locator={resource.locator}
                onClick={() => console.log("clicked", resource.locator)}
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
