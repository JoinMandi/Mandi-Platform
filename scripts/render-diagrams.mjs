#!/usr/bin/env node
// Re-render the SVGs in docs/diagrams/ from the Mermaid blocks in
// docs/ARCHITECTURE.md. docs/ARCHITECTURE.md is the single source of truth;
// the SVG siblings exist so the doc renders in viewers without Mermaid
// support (notably VS Code's stock Markdown preview).
//
// Usage: npm run docs:diagrams
// Requires: npx -p @mermaid-js/mermaid-cli (auto-fetched on demand).

import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const sourceMd = join(repoRoot, "docs", "ARCHITECTURE.md");
const outDir = join(repoRoot, "docs", "diagrams");

// Output filenames keyed by appearance order in ARCHITECTURE.md.
// Keep in sync with the image references in the markdown.
const names = [
  "1-layered-overview",
  "2-auth-mfa-flow",
  "3-mfa-state-machine",
  "4-translation-dual-path",
];

const md = readFileSync(sourceMd, "utf8");
const blocks = [...md.matchAll(/```mermaid\n([\s\S]*?)\n```/g)].map((m) => m[1]);

if (blocks.length !== names.length) {
  console.error(
    `Expected ${names.length} mermaid blocks in ARCHITECTURE.md, found ${blocks.length}. ` +
      `If you added or removed a diagram, update the 'names' array in this script.`,
  );
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), "mandi-diagrams-"));

try {
  for (let i = 0; i < blocks.length; i++) {
    const name = names[i];
    const input = join(tmp, `${name}.mmd`);
    const output = join(outDir, `${name}.svg`);
    writeFileSync(input, blocks[i]);

    console.log(`Rendering ${name}.svg ...`);
    const result = spawnSync(
      "npx",
      ["-y", "-p", "@mermaid-js/mermaid-cli", "mmdc", "-i", input, "-o", output, "-b", "transparent"],
      { stdio: "inherit", shell: process.platform === "win32" },
    );
    if (result.status !== 0) {
      console.error(`mmdc failed for ${name} (exit ${result.status})`);
      process.exit(result.status ?? 1);
    }
  }
  console.log(`\nDone. ${blocks.length} diagrams written to docs/diagrams/`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
