import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResourceCard } from "./ResourceCard";

type TabType = "installed" | "market";
type FilterType = "all" | "prompt" | "tool";

// Mock data for development
const mockResources = [
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

function ResourcesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("installed");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter resources based on tab, type filter, and search
  const filteredResources = useMemo(() => {
    return mockResources.filter((resource) => {
      // Tab filter: installed = localhost, market = other domains
      if (activeTab === "installed" && resource.domain !== "localhost") return false;
      if (activeTab === "market" && resource.domain === "localhost") return false;

      // Type filter
      if (activeFilter !== "all" && resource.type !== activeFilter) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          resource.name.toLowerCase().includes(query) ||
          resource.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [activeTab, activeFilter, searchQuery]);

  const tabs: { id: TabType; labelKey: string }[] = [
    { id: "installed", labelKey: "resources.installed" },
    { id: "market", labelKey: "resources.market" },
  ];

  const filters: { id: FilterType; labelKey: string }[] = [
    { id: "all", labelKey: "resources.all" },
    { id: "prompt", labelKey: "resources.prompts" },
    { id: "tool", labelKey: "resources.tools" },
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            {t("resources.title")}
          </h1>
        </div>

        {/* Search */}
        <div className="relative">
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
      </div>

      {/* Tabs */}
      <div className="shrink-0 px-6 mb-3">
        <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                activeTab === tab.id
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filters */}
      <div className="shrink-0 px-6 mb-4">
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
          /* Empty State */
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

export default ResourcesPage;
