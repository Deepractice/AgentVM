import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Play, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useResourceDetail, useResourceResolve } from "@/hooks/useResources";
import type { ResolveResponse } from "agentvm/client";

interface ResourceDetailProps {
  locator: string;
  onBack: () => void;
}

type TabType = "resolve" | "content" | "versions";

/** JSON Schema property definition */
interface JSONSchemaProperty {
  type: "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";
  description?: string;
  default?: unknown;
}

/** JSON Schema definition */
interface JSONSchema {
  type: "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export function ResourceDetail({ locator, onBack }: ResourceDetailProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("resolve");
  const [args, setArgs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ResolveResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);

  // Load resource details
  const { data: resource, isLoading: loading, isError, error } = useResourceDetail(locator);
  const resolveMutation = useResourceResolve();

  // Initialize args with defaults from schema
  useEffect(() => {
    if (resource?.schema?.properties) {
      const initialArgs: Record<string, string> = {};
      for (const [key, prop] of Object.entries(resource.schema.properties)) {
        if ((prop as JSONSchemaProperty).default !== undefined) {
          initialArgs[key] = String((prop as JSONSchemaProperty).default);
        } else {
          initialArgs[key] = "";
        }
      }
      setArgs(initialArgs);
    }
  }, [resource?.schema]);

  const handleResolve = async () => {
    setExecuteError(null);

    try {
      // Convert string args to proper types based on schema
      const typedArgs: Record<string, unknown> = {};
      const schema = resource?.schema as JSONSchema | undefined;
      if (schema?.properties) {
        for (const [key, value] of Object.entries(args)) {
          const prop = schema.properties[key] as JSONSchemaProperty;
          if (prop?.type === "number" || prop?.type === "integer") {
            typedArgs[key] = value ? Number(value) : undefined;
          } else if (prop?.type === "boolean") {
            typedArgs[key] = value === "true";
          } else {
            typedArgs[key] = value || undefined;
          }
        }
      }

      const response = await resolveMutation.mutateAsync({
        locator,
        args: Object.keys(typedArgs).length > 0 ? typedArgs : undefined,
      });
      setResult(response);
    } catch (err) {
      setExecuteError(err instanceof Error ? err.message : "Failed to resolve resource");
    }
  };

  const handleCopy = async () => {
    if (!result?.content) return;
    const text =
      typeof result.content === "string" ? result.content : JSON.stringify(result.content, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    if (typeof result?.content === "string") {
      return result.content;
    }
    return JSON.stringify(result?.content, null, 2);
  };

  const tabs: { id: TabType; labelKey: string }[] = [
    { id: "resolve", labelKey: "resources.resolve" },
    { id: "content", labelKey: "resources.content" },
    { id: "versions", labelKey: "resources.versions" },
  ];

  const schema = resource?.schema as JSONSchema | undefined;
  const hasSchema = schema?.properties && Object.keys(schema.properties).length > 0;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-6 h-6 text-[var(--text-muted)] animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-primary)]">
        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-sm text-[var(--text-muted)]">
          {error instanceof Error ? error.message : "Failed to load resource"}
        </p>
        <button
          onClick={onBack}
          className="mt-4 text-sm text-[#4A7FD4] hover:underline"
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-[var(--bg-primary)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-[var(--border-light)] drag-region">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onBack}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors no-drag"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              {resource?.manifest.name}
            </h1>
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
              v{resource?.manifest.version}
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)] ml-8">{locator}</p>
        </div>

        {/* Tabs */}
        <div className="shrink-0 px-6 pt-4 border-b border-[var(--border-light)]">
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "text-[var(--text-primary)] border-[#4A7FD4]"
                    : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]"
                )}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "resolve" && (
            <div className="space-y-6">
              {/* Parameters Form */}
              {hasSchema && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    {t("resources.parameters")}
                  </h3>
                  {Object.entries(schema!.properties!).map(([key, prop]) => {
                    const p = prop as JSONSchemaProperty;
                    return (
                      <div key={key}>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                          {key}
                          {schema!.required?.includes(key) && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        {p.description && (
                          <p className="text-xs text-[var(--text-muted)] mb-1">{p.description}</p>
                        )}
                        <input
                          type={p.type === "number" || p.type === "integer" ? "number" : "text"}
                          value={args[key] || ""}
                          onChange={(e) => setArgs({ ...args, [key]: e.target.value })}
                          placeholder={p.default !== undefined ? String(p.default) : ""}
                          className={cn(
                            "w-full max-w-md h-9 px-3 rounded-lg",
                            "bg-[var(--bg-secondary)] border border-[var(--border-light)]",
                            "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                            "outline-none focus:border-[var(--border-medium)] transition-colors"
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Execute Button */}
              <button
                onClick={handleResolve}
                disabled={resolveMutation.isPending}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  resolveMutation.isPending
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
                    : "bg-[#4A7FD4] text-white hover:bg-[#3D6BB3]"
                )}
              >
                {resolveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {t("resources.execute")}
              </button>

              {/* Error */}
              {executeError && (
                <div className="p-3 bg-red-50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{executeError}</p>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">
                      {t("resources.resolveResult")}
                    </h3>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          {t("common.copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          {t("common.copy")}
                        </>
                      )}
                    </button>
                  </div>
                  <pre
                    className={cn(
                      "p-4 rounded-lg overflow-x-auto",
                      "bg-[var(--bg-secondary)] border border-[var(--border-light)]",
                      "text-sm text-[var(--text-primary)] font-mono whitespace-pre-wrap"
                    )}
                  >
                    {renderContent()}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === "content" && (
            <div className="text-sm text-[var(--text-muted)]">
              {t("common.developingFeature")}
            </div>
          )}

          {activeTab === "versions" && (
            <div className="text-sm text-[var(--text-muted)]">
              {t("common.developingFeature")}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - About */}
      <div className="w-64 shrink-0 border-l border-[var(--border-light)] bg-[var(--bg-secondary)] p-4 overflow-y-auto">
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">
          {t("resources.about")}
        </h3>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-[var(--text-muted)]">{t("resources.type")}: </span>
            <span className="text-[var(--text-primary)]">{resource?.manifest.type}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">{t("resources.domain")}: </span>
            <span className="text-[var(--text-primary)]">{resource?.manifest.domain}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">{t("resources.version")}: </span>
            <span className="text-[var(--text-primary)]">{resource?.manifest.version}</span>
          </div>
          {resource?.manifest.description && (
            <div className="pt-2 border-t border-[var(--border-light)]">
              <span className="text-[var(--text-muted)] block mb-1">{t("resources.description")}: </span>
              <span className="text-[var(--text-primary)]">{resource.manifest.description}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
