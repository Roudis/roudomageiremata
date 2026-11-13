#!/usr/bin/env node
// Starts the recipe editor: `npm run editor`. Options: --no-open (don't open
// the browser). Env: EDITOR_PORT (default 3210), SITE_URL (the `npm run dev`
// site its "view" links open, default http://localhost:3000).
//
// Node runs the editor's TypeScript, and the lib/ modules it shares with the
// site, without a build step. This file is plain JavaScript because it adds
// the two things Node doesn't do on its own: the "@/" import alias from
// tsconfig.json, and imports written without the ".ts" extension.

import { existsSync } from "node:fs";
import * as nodeModule from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

if (!process.features.typescript || typeof nodeModule.registerHooks !== "function") {
  console.error(`✖ The recipe editor needs Node.js 22.18 or newer, which runs TypeScript; this is Node ${process.versions.node}.`);
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inRepo = (file) => file.startsWith(root + path.sep) && !file.includes(`${path.sep}node_modules${path.sep}`);

/** The .ts file an import means: as written, or with ".ts" or "/index.ts" added. */
function typescriptFile(target) {
  for (const candidate of [target, `${target}.ts`, path.join(target, "index.ts")]) {
    if (candidate.endsWith(".ts") && existsSync(candidate)) return candidate;
  }
  return undefined;
}

nodeModule.registerHooks({
  resolve(specifier, context, nextResolve) {
    let target;
    if (specifier.startsWith("@/")) {
      target = path.join(root, specifier.slice(2));
    } else if (/^\.\.?\//.test(specifier) && context.parentURL?.startsWith("file:")) {
      target = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
    }
    const file = target !== undefined && inRepo(target) ? typescriptFile(target) : undefined;
    // The package.json has no "type", so say these are ES modules rather than let Node guess and warn.
    if (file !== undefined) return { url: pathToFileURL(file).href, format: "module-typescript", shortCircuit: true };
    return nextResolve(specifier, context);
  },
});

await import("./server.ts");
