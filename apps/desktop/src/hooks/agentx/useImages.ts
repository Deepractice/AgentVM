/**
 * useImages - React hook for Image (conversation) management
 *
 * In the Image-First model:
 * - Image is the persistent entity (conversation)
 * - Agent is a transient runtime instance
 *
 * Copied from @agentxjs/ui with minimal dependencies.
 */

import { useState, useEffect, useCallback } from "react";
import type { AgentX, ImageListItem } from "agentxjs";

// Helper to check if response is an error
function isErrorResponse(data: unknown): data is { error: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  );
}

export interface UseImagesResult {
  images: ImageListItem[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createImage: (config?: {
    name?: string;
    description?: string;
    systemPrompt?: string;
  }) => Promise<ImageListItem>;
  runImage: (imageId: string) => Promise<{ agentId: string; reused: boolean }>;
  stopImage: (imageId: string) => Promise<void>;
  updateImage: (
    imageId: string,
    updates: { name?: string; description?: string }
  ) => Promise<ImageListItem>;
  deleteImage: (imageId: string) => Promise<void>;
}

export interface UseImagesOptions {
  containerId?: string;
  autoLoad?: boolean;
  onRun?: (imageId: string, agentId: string, reused: boolean) => void;
  onImagesChange?: (images: ImageListItem[]) => void;
}

export function useImages(agentx: AgentX | null, options: UseImagesOptions = {}): UseImagesResult {
  const { containerId, autoLoad = true, onRun, onImagesChange } = options;

  const [images, setImages] = useState<ImageListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadImages = useCallback(async () => {
    if (!agentx) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await agentx.request("image_list_request", { containerId });
      if (isErrorResponse(response.data)) {
        throw new Error(response.data.error);
      }
      const records = response.data.records ?? [];
      setImages(records);
      onImagesChange?.(records);
      console.debug("[useImages] Loaded images", records.length, containerId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("[useImages] Failed to load images", error);
    } finally {
      setIsLoading(false);
    }
  }, [agentx, containerId, onImagesChange]);

  useEffect(() => {
    if (autoLoad && agentx) {
      loadImages();
    }
  }, [autoLoad, agentx, loadImages]);

  const createImage = useCallback(
    async (
      config: { name?: string; description?: string; systemPrompt?: string } = {}
    ): Promise<ImageListItem> => {
      if (!agentx) {
        throw new Error("AgentX not available");
      }

      setIsLoading(true);
      setError(null);

      try {
        const targetContainerId = containerId ?? "default";
        const response = await agentx.request("image_create_request", {
          containerId: targetContainerId,
          config,
        });
        if (response.data.error) {
          throw new Error(response.data.error);
        }

        const record = response.data.record as ImageListItem;
        if (!record) {
          throw new Error("No image record returned");
        }

        setImages((prev) => [record, ...prev]);
        onImagesChange?.([record, ...images]);
        console.info("[useImages] Created image", record.imageId, record.name);

        return record;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error("[useImages] Failed to create image", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [agentx, containerId, images, onImagesChange]
  );

  const runImage = useCallback(
    async (imageId: string): Promise<{ agentId: string; reused: boolean }> => {
      if (!agentx) {
        throw new Error("AgentX not available");
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await agentx.request("image_run_request", { imageId });
        if (response.data.error) {
          throw new Error(response.data.error);
        }

        const { agentId, reused } = response.data;
        if (!agentId) {
          throw new Error("Invalid run response");
        }

        setImages((prev) =>
          prev.map((img) => (img.imageId === imageId ? { ...img, online: true, agentId } : img))
        );

        console.info("[useImages] Image running", imageId, agentId, reused);
        onRun?.(imageId, agentId, reused);

        return { agentId, reused };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error("[useImages] Failed to run image", imageId, error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [agentx, onRun]
  );

  const stopImage = useCallback(
    async (imageId: string): Promise<void> => {
      if (!agentx) {
        throw new Error("AgentX not available");
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await agentx.request("image_stop_request", { imageId });
        if (response.data.error) {
          throw new Error(response.data.error);
        }

        setImages((prev) =>
          prev.map((img) =>
            img.imageId === imageId ? { ...img, online: false, agentId: undefined } : img
          )
        );

        console.info("[useImages] Image stopped", imageId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error("[useImages] Failed to stop image", imageId, error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [agentx]
  );

  const updateImage = useCallback(
    async (
      imageId: string,
      updates: { name?: string; description?: string }
    ): Promise<ImageListItem> => {
      if (!agentx) {
        throw new Error("AgentX not available");
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await agentx.request("image_update_request", { imageId, updates });
        if (response.data.error) {
          throw new Error(response.data.error);
        }

        const record = response.data.record as ImageListItem;
        if (!record) {
          throw new Error("No image record returned");
        }

        setImages((prev) => prev.map((img) => (img.imageId === imageId ? record : img)));

        console.info("[useImages] Image updated", imageId, updates);
        return record;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error("[useImages] Failed to update image", imageId, error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [agentx]
  );

  const deleteImage = useCallback(
    async (imageId: string): Promise<void> => {
      if (!agentx) {
        throw new Error("AgentX not available");
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await agentx.request("image_delete_request", { imageId });
        if (response.data.error) {
          throw new Error(response.data.error);
        }

        const newImages = images.filter((img) => img.imageId !== imageId);
        setImages(newImages);
        onImagesChange?.(newImages);
        console.info("[useImages] Deleted image", imageId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error("[useImages] Failed to delete image", imageId, error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [agentx, images, onImagesChange]
  );

  return {
    images,
    isLoading,
    error,
    refresh: loadImages,
    createImage,
    runImage,
    stopImage,
    updateImage,
    deleteImage,
  };
}
