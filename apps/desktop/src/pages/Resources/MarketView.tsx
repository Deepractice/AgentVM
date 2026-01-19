import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, Package, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResourceCard } from "./ResourceCard";

type FilterType = "all" | "prompt" | "tool";

// Mock data
const mockMarketResources = [
  {
    id: "3",
    name: "code-review",
    description: "Professional code review assistant with detailed analysis capabilities",
    type: "prompt",
    version: "2.1.0",
    domain: "deepractice.ai",
    locator: "deepractice.ai/prompts/code-review.prompt@2.1.0",
  },
  {
    id: "4",
    name: "web-search",
    description: "Search the web and retrieve relevant information",
    type: "tool",
    version: "0.9.0",
    domain: "github.com",
    locator: "github.com/community/web-search.tool@0.9.0",
  },
  {
    id: "5",
    name: "translation-helper",
    description: "Multi-language translation with context awareness",
    type: "prompt",
    version: "1.5.0",
    domain: "deepractice.ai",
    locator: "deepractice.ai/prompts/translation-helper.prompt@1.5.0",
  },
];

export function MarketView() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredResources = useMemo(() => {
    return mockMarketResources.filter((resource) => {
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
            {t("resources.market")}
          </h1>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("resources.searchMarket")}
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
              <div key={resource.id} className="relative">
                <ResourceCard
                  name={resource.name}
                  description={resource.description}
                  type={resource.type}
                  version={resource.version}
                  domain={resource.domain}
                  locator={resource.locator}
                  onClick={() => console.log("view detail", resource.locator)}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("install", resource.locator);
                  }}
                  className={cn(
                    "absolute top-4 right-4 h-7 px-3 rounded-md flex items-center gap-1.5",
                    "bg-[#4A7FD4] text-white text-xs font-medium",
                    "hover:bg-[#3D6BB3] transition-colors"
                  )}
                >
                  <Download className="w-3.5 h-3.5" />
                  {t("resources.install")}
                </button>
              </div>
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
    </div>
  );
}
