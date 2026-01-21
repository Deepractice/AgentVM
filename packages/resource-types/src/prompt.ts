/**
 * Prompt Resource Type
 *
 * Defines the prompt type for storing AI system prompts and templates.
 * Content is stored as plain text.
 */

import type { ResourceType, ResourceSerializer, ResourceResolver, RXR, RXM } from "resourcexjs";
import { createRXC, parseRXL } from "resourcexjs";

/**
 * Prompt serializer - stores content as UTF-8 text
 */
const promptSerializer: ResourceSerializer = {
  async serialize(rxr: RXR): Promise<Buffer> {
    const buffer = await rxr.content.file("content");
    return buffer;
  },

  async deserialize(data: Buffer, manifest: RXM): Promise<RXR> {
    const text = data.toString("utf-8");
    return {
      locator: parseRXL(manifest.toLocator()),
      manifest,
      content: await createRXC({ content: text }),
    };
  },
};

/**
 * Prompt resolver - returns content as string (no parameters)
 */
const promptResolver: ResourceResolver<void, string> = {
  schema: undefined,
  async resolve(rxr: RXR) {
    return {
      resource: rxr,
      schema: undefined,
      execute: async () => {
        const buffer = await rxr.content.file("content");
        return buffer.toString("utf-8");
      },
    };
  },
};

/**
 * Prompt resource type
 *
 * Used for storing AI system prompts, templates, and instructions.
 */
export const promptType: ResourceType<void, string> = {
  name: "prompt",
  aliases: ["template", "system-prompt"],
  description: "AI prompt template",
  serializer: promptSerializer,
  resolver: promptResolver,
};
