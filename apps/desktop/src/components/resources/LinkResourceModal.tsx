import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, FolderOpen, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useResourceLink } from "@/hooks/useResources";

interface LinkResourceModalProps {
  onClose: () => void;
}

type ModalState = "idle" | "selecting" | "linking" | "success" | "error";

export function LinkResourceModal({ onClose }: LinkResourceModalProps) {
  const { t } = useTranslation();
  const linkMutation = useResourceLink();

  const [state, setState] = useState<ModalState>("idle");
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [linkedLocator, setLinkedLocator] = useState<string | null>(null);
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
      const result = await linkMutation.mutateAsync(folderPath);
      setLinkedLocator(result.locator);
      setState("success");
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
            disabled={state === "selecting" || state === "linking"}
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

          {/* Linking Status */}
          {state === "linking" && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-700">Linking resource...</span>
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
          {state === "success" && linkedLocator && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Resource linked successfully!
                </span>
              </div>
              <p className="text-xs text-green-600 font-mono">{linkedLocator}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-light)] p-3 flex justify-end gap-2">
          {state === "success" ? (
            <button
              onClick={onClose}
              className="h-8 px-4 rounded text-sm font-medium bg-[#4A7FD4] text-white hover:bg-[#3D6BB3] transition-colors"
            >
              {t("common.done")}
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="h-8 px-4 rounded text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleLink}
                disabled={!folderPath || state === "linking"}
                className={cn(
                  "h-8 px-4 rounded text-sm font-medium transition-colors flex items-center gap-2",
                  folderPath && state !== "linking"
                    ? "bg-[#4A7FD4] text-white hover:bg-[#3D6BB3]"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
                )}
              >
                {state === "linking" && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("resources.linkResource")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
