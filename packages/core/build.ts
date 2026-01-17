import { $ } from "bun";

// Clean dist directory
await $`rm -rf dist`;

// Build with bun
await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "node",
  format: "esm",
});

// Generate type declarations
await $`tsc --emitDeclarationOnly --declaration --declarationMap`;

console.log("✅ Build complete");
