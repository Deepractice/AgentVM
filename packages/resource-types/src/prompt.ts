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
    const text = await rxr.content.text();
    return Buffer.from(text, "utf-8");
  },

  async deserialize(data: Buffer, manifest: RXM): Promise<RXR> {
    const text = data.toString("utf-8");
    return {
      locator: parseRXL(manifest.toLocator()),
      manifest,
      content: createRXC(text),
    };
  },
};

/**
 * Prompt resolver - returns content as string
 */
const promptResolver: ResourceResolver<string> = {
  async resolve(rxr: RXR): Promise<string> {
    return rxr.content.text();
  },
};

/**
 * Prompt resource type
 *
 * Used for storing AI system prompts, templates, and instructions.
 */
export const promptType: ResourceType<string> = {
  name: "prompt",
  aliases: ["template", "system-prompt"],
  description: "AI prompt template",
  serializer: promptSerializer,
  resolver: promptResolver,
};
