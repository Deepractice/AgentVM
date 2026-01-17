import { $ } from "bun";

// Clean dist directory
await $`rm -rf dist`;

// Build with bun
await Bun.build({
  entrypoints: ["./src/index.ts", "./src/cli/index.ts"],
  outdir: "./dist",
  target: "node",
  format: "esm",
  splitting: true,
});

// Generate type declarations
await $`tsc --emitDeclarationOnly --declaration --declarationMap`;

// Make CLI executable
await $`chmod +x ./dist/cli/index.js`;

console.log("✅ Build complete");
