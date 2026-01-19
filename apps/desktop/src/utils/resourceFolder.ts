/* global window */
/**
 * Resource Folder Parser
 *
 * Parse a resource folder containing resource.json and content file.
 * Temporary implementation until ResourceX provides loadResource() in browser context.
 */

interface ResourceManifest {
  name: string;
  type: string;
  version: string;
  domain?: string;
  path?: string;
  description?: string;
  tags?: string[];
}

interface ParsedResource {
  locator: string;
  content: string;
  description?: string;
  tags?: string[];
}

/**
 * Parse a resource folder
 *
 * @param folderPath - Absolute path to the resource folder
 * @returns Parsed resource data ready for client.registry.link()
 */
export async function parseResourceFolder(folderPath: string): Promise<ParsedResource> {
  // 1. Read resource.json
  const manifestPath = `${folderPath}/resource.json`;
  const manifestContent = await window.electronAPI.readFile(manifestPath);
  const manifest: ResourceManifest = JSON.parse(manifestContent);

  // 2. Validate required fields
  if (!manifest.name || !manifest.type || !manifest.version) {
    throw new Error("Invalid resource.json: missing required fields (name, type, version)");
  }

  // 3. Read content file
  const contentPath = `${folderPath}/content`;
  const content = await window.electronAPI.readFile(contentPath);

  // 4. Build locator
  const domain = manifest.domain || "localhost";
  const pathPart = manifest.path ? `${manifest.path}/` : "";
  const locator = `${domain}/${pathPart}${manifest.name}.${manifest.type}@${manifest.version}`;

  return {
    locator,
    content,
    description: manifest.description,
    tags: manifest.tags,
  };
}
