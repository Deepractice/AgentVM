import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Play, Copy, Check, Loader2, AlertCircle, FileText, Wrench, Package, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useResourceDetail, useResourceResolve, useResourceDelete } from "@/hooks/useResources";
import type { ResolveResponse } from "agentvm/client";

interface ResourceDetailProps {
  locator: string;
  onBack: () => void;
}

type TabType = "resolve" | "content" | "versions" | "config";

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

const typeConfig: Record<string, { icon: typeof FileText; color: string }> = {
  prompt: {
    icon: FileText,
    color: "text-amber-600 bg-amber-50",
  },
  tool: {
    icon: Wrench,
    color: "text-blue-600 bg-blue-50",
  },
  default: {
    icon: Package,
    color: "text-[var(--text-secondary)] bg-[var(--bg-tertiary)]",
  },
};

export function ResourceDetail({ locator, onBack }: ResourceDetailProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("resolve");
  const [args, setArgs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ResolveResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  // Load resource details
  const { data: resource, isLoading: loading, isError, error } = useResourceDetail(locator);
  const resolveMutation = useResourceResolve();
  const deleteMutation = useResourceDelete();

  const config = typeConfig[resource?.manifest.type || "default"] || typeConfig.default;
  const Icon = config.icon;

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
    { id: "config", labelKey: "resources.config" },
  ];

  const handleDelete = async () => {
    if (deleteConfirmInput !== locator) return;

    try {
      await deleteMutation.mutateAsync(locator);
      setShowDeleteConfirm(false);
      onBack();
    } catch (err) {
      // Error handled by mutation
    }
  };

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
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-[var(--accent-error)]" />
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          {error instanceof Error ? error.message : "Failed to load resource"}
        </p>
        <button
          onClick={onBack}
          className="text-sm text-[var(--accent-primary)] hover:underline"
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-[var(--bg-primary)] overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="shrink-0 px-6 pt-6 pb-4 drag-region">
          {/* Back & Title Row */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors no-drag"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Icon + Name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                config.color
              )}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-[var(--text-primary)] truncate">
                    {resource?.manifest.name}
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)] shrink-0">
                    v{resource?.manifest.version}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{locator}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-full transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-[var(--accent-primary)] text-white"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-light)]"
                )}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--border-light)] mx-6" />

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-2xl">
          {activeTab === "resolve" && (
            <div className="space-y-6">
              {/* Parameters Form */}
              {hasSchema && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    {t("resources.parameters")}
                  </h3>

                  <div className="space-y-3">
                    {Object.entries(schema!.properties!).map(([key, prop]) => {
                      const p = prop as JSONSchemaProperty;
                      return (
                        <div key={key}>
                          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">
                            {key}
                            {schema!.required?.includes(key) && (
                              <span className="text-[var(--accent-error)] ml-1">*</span>
                            )}
                          </label>
                          {p.description && (
                            <p className="text-xs text-[var(--text-muted)] mb-1.5">{p.description}</p>
                          )}
                          <input
                            type={p.type === "number" || p.type === "integer" ? "number" : "text"}
                            value={args[key] || ""}
                            onChange={(e) => setArgs({ ...args, [key]: e.target.value })}
                            placeholder={p.default !== undefined ? String(p.default) : ""}
                            className={cn(
                              "w-full h-10 px-3 rounded-lg",
                              "bg-[var(--bg-card)] border border-[var(--border-light)]",
                              "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                              "outline-none focus:border-[var(--border-medium)] transition-colors"
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Execute Button */}
              <button
                onClick={handleResolve}
                disabled={resolveMutation.isPending}
                className={cn(
                  "h-8 px-4 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors",
                  resolveMutation.isPending
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
                    : "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)]"
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
                <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
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
                          <Check className="w-3.5 h-3.5 text-[var(--accent-success)]" />
                          {t("common.copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          {t("common.copy")}
                        </>
                      )}
                    </button>
                  </div>
                  <pre
                    className={cn(
                      "p-4 rounded-lg overflow-x-auto",
                      "bg-[var(--bg-secondary)] border border-[var(--border-light)]",
                      "text-sm text-[var(--text-primary)] font-mono whitespace-pre-wrap leading-relaxed"
                    )}
                  >
                    {renderContent()}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === "content" && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                {t("common.developingFeature")}
              </p>
            </div>
          )}

          {activeTab === "versions" && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                {t("common.developingFeature")}
              </p>
            </div>
          )}

          {activeTab === "config" && (
            <div className="space-y-6">
              {/* Danger Zone */}
              <div className="rounded-lg border border-[var(--accent-error)]/30 overflow-hidden">
                <div className="px-4 py-3 bg-[var(--accent-error)]/5 border-b border-[var(--accent-error)]/30">
                  <h3 className="text-sm font-medium text-[var(--accent-error)]">
                    {t("resources.dangerZone")}
                  </h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {t("resources.deleteResource")}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {t("resources.deleteResourceDesc")}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="h-8 px-3 rounded-lg flex items-center gap-2 text-sm font-medium border border-[var(--accent-error)] text-[var(--accent-error)] hover:bg-[var(--accent-error)] hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t("common.delete")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* About Panel - 紧贴内容 */}
          <div className="w-52 shrink-0">
            <div className="sticky top-0 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)]">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">
                {t("resources.about")}
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">{t("resources.type")}</span>
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded capitalize",
                    resource?.manifest.type === "prompt" && "bg-amber-50 text-amber-700",
                    resource?.manifest.type === "tool" && "bg-blue-50 text-blue-700",
                    !["prompt", "tool"].includes(resource?.manifest.type || "") && "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                  )}>
                    {resource?.manifest.type}
                  </span>
                </div>

                <div className="h-px bg-[var(--border-light)]" />

                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">{t("resources.domain")}</span>
                  <span className="text-[var(--text-primary)]">{resource?.manifest.domain}</span>
                </div>

                <div className="h-px bg-[var(--border-light)]" />

                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">{t("resources.version")}</span>
                  <span className="text-[var(--text-primary)] font-mono text-xs">{resource?.manifest.version}</span>
                </div>

                {resource?.manifest.description && (
                  <>
                    <div className="h-px bg-[var(--border-light)]" />
                    <div>
                      <span className="text-[var(--text-muted)] block mb-1">{t("resources.description")}</span>
                      <p className="text-[var(--text-secondary)] leading-relaxed">{resource.manifest.description}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-card)] rounded-xl w-[480px] shadow-xl border border-[var(--border-light)]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border-light)]">
              <h2 className="text-base font-medium text-[var(--accent-error)]">
                {t("resources.deleteResource")}
              </h2>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">
                {t("resources.deleteConfirmMessage")}
              </p>

              <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                <code className="text-sm font-mono text-[var(--text-primary)] break-all">
                  {locator}
                </code>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  {t("resources.deleteConfirmLabel")}
                </label>
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder={locator}
                  className={cn(
                    "w-full h-10 px-3 rounded-lg",
                    "bg-[var(--bg-card)] border",
                    deleteConfirmInput === locator
                      ? "border-[var(--accent-error)]"
                      : "border-[var(--border-light)]",
                    "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                    "outline-none focus:border-[var(--border-medium)] transition-colors"
                  )}
                />
              </div>

              {deleteMutation.isError && (
                <div className="p-3 bg-red-50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">
                    {deleteMutation.error instanceof Error
                      ? deleteMutation.error.message
                      : t("common.error")}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--border-light)] p-3 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmInput("");
                }}
                className="h-8 px-4 rounded text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmInput !== locator || deleteMutation.isPending}
                className={cn(
                  "h-8 px-4 rounded text-sm font-medium transition-colors flex items-center gap-2",
                  deleteConfirmInput === locator && !deleteMutation.isPending
                    ? "bg-[var(--accent-error)] text-white hover:bg-[var(--accent-error)]/90"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
                )}
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("resources.confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
