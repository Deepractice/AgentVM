import { FileText, Wrench, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  name: string;
  description?: string;
  type: string;
  version: string;
  domain: string;
  locator: string;
  onClick?: () => void;
}

const typeConfig: Record<string, { icon: typeof FileText; label: string; color: string }> = {
  prompt: {
    icon: FileText,
    label: "Prompt",
    color: "text-amber-600 bg-amber-50",
  },
  tool: {
    icon: Wrench,
    label: "Tool",
    color: "text-blue-600 bg-blue-50",
  },
  default: {
    icon: Package,
    label: "Resource",
    color: "text-[var(--text-secondary)] bg-[var(--bg-tertiary)]",
  },
};

function getSourceLabel(domain: string): { label: string; style: string } {
  if (domain === "localhost") {
    return { label: "本地", style: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]" };
  }
  if (domain === "deepractice.ai") {
    return { label: "官方", style: "bg-emerald-50 text-emerald-700" };
  }
  return { label: "社区", style: "bg-violet-50 text-violet-700" };
}

export function ResourceCard({
  name,
  description,
  type,
  version,
  domain,
  locator,
  onClick,
}: ResourceCardProps) {
  const config = typeConfig[type] || typeConfig.default;
  const Icon = config.icon;
  const source = getSourceLabel(domain);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)]",
        "p-4 cursor-pointer transition-all duration-200",
        "hover:border-[var(--border-medium)] hover:shadow-sm",
        "active:scale-[0.99]"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            "transition-transform duration-200 group-hover:scale-105",
            config.color
          )}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{name}</h3>
            <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
              v{version}
            </span>
          </div>

          {description && (
            <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2">{description}</p>
          )}

          <div className="flex items-center gap-2">
            <span
              className={cn("px-1.5 py-0.5 text-[10px] font-medium rounded", source.style)}
            >
              {source.label}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] truncate">{locator}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
