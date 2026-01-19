import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, FolderOpen, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseResourceFolder } from "@/utils/resourceFolder";
import { useResourcePublish } from "@/hooks/useResources";

interface LinkResourceModalProps {
  onClose: () => void;
}

type ModalState = "idle" | "selecting" | "validating" | "linking" | "success" | "error";

export function LinkResourceModal({ onClose }: LinkResourceModalProps) {
  const { t } = useTranslation();
  const linkMutation = useResourcePublish();

  const [state, setState] = useState<ModalState>("idle");
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [resourceInfo, setResourceInfo] = useState<{
    name: string;
    type: string;
    version: string;
    description?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectFolder = async () => {
    setState("selecting");
    setError(null);

    try {
      const path = await window.electronAPI.selectFolder();
      if (!path) {
        setState("idle");
        return;
      }

      setFolderPath(path);
      setState("validating");

      // Parse resource folder
      const parsed = await parseResourceFolder(path);

      // Extract info from locator for preview
      const locatorParts = parsed.locator.split("/");
      const lastPart = locatorParts[locatorParts.length - 1];
      const [nameTypePart, version] = lastPart.split("@");
      const [name, type] = nameTypePart.split(".");

      setResourceInfo({
        name,
        type,
        version,
        description: parsed.description,
      });

      setState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState("error");
    }
  };

  const handleLink = async () => {
    if (!folderPath) return;

    setState("linking");
    setError(null);

    try {
      const parsed = await parseResourceFolder(folderPath);

      await linkMutation.mutateAsync({
        locator: parsed.locator,
        content: parsed.content,
        description: parsed.description,
        tags: parsed.tags,
      });

      setState("success");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] rounded-xl w-[500px] max-h-[80vh] flex flex-col shadow-xl border border-[var(--border-light)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-light)]">
          <h2 className="text-base font-medium text-[var(--text-primary)]">
            {t("resources.linkResource")}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Select Folder */}
          <button
            onClick={handleSelectFolder}
            disabled={state === "selecting" || state === "validating" || state === "linking"}
            className={cn(
              "w-full h-32 rounded-lg border-2 border-dashed transition-colors",
              "flex flex-col items-center justify-center gap-2",
              folderPath
                ? "border-[var(--border-medium)] bg-[var(--bg-secondary)]"
                : "border-[var(--border-light)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-secondary)]"
            )}
          >
            <FolderOpen className="w-8 h-8 text-[var(--text-muted)]" />
            <span className="text-sm text-[var(--text-secondary)]">
              {folderPath ? folderPath : t("resources.selectFolder")}
            </span>
          </button>

          {/* Validation Status */}
          {state === "validating" && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-700">Validating resource...</span>
            </div>
          )}

          {resourceInfo && state !== "error" && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Valid Resource</span>
              </div>
              <div className="space-y-1 text-xs text-green-700">
                <div>
                  <span className="font-medium">Name:</span> {resourceInfo.name}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {resourceInfo.type}
                </div>
                <div>
                  <span className="font-medium">Version:</span> {resourceInfo.version}
                </div>
                {resourceInfo.description && (
                  <div>
                    <span className="font-medium">Description:</span> {resourceInfo.description}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {state === "error" && error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 mb-1">Error</p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Success */}
          {state === "success" && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Resource linked successfully!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-light)] p-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleLink}
            disabled={!resourceInfo || state === "linking" || state === "success"}
            className={cn(
              "h-8 px-4 rounded text-sm font-medium transition-colors flex items-center gap-2",
              resourceInfo && state !== "linking" && state !== "success"
                ? "bg-[#4A7FD4] text-white hover:bg-[#3D6BB3]"
                : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
            )}
          >
            {state === "linking" && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("resources.linkResource")}
          </button>
        </div>
      </div>
    </div>
  );
}
