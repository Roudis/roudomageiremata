/**
 * Starts the real editor and asks it for the recipe list. Node runs the editor's
 * TypeScript, and the lib/ files it imports, by stripping the types, so a change
 * there that Node can't strip (an enum, or a type imported without `type`)
 * passes `npm run typecheck` but stops the editor; this test catches it.
 * Skipped on a Node that can't run TypeScript, such as CI's Node 20.
 */
import { spawn } from "node:child_process";
import { describe, expect, it } from "vitest";

const nodeRunsTypeScript = Boolean((process.features as { typescript?: unknown }).typescript);

describe("npm run editor", () => {
  it.skipIf(!nodeRunsTypeScript)("starts and lists the recipes in data/recipes", { timeout: 20_000 }, async () => {
    const port = 20_000 + Math.floor(Math.random() * 20_000);
    const editor = spawn(process.execPath, ["editor/index.mjs", "--no-open"], {
      env: { ...process.env, EDITOR_PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    try {
      await new Promise<void>((resolve, reject) => {
        const read = (chunk: Buffer) => {
          output += String(chunk);
          if (output.includes("Recipe editor:")) resolve();
        };
        editor.stdout.on("data", read);
        editor.stderr.on("data", read);
        editor.on("exit", (code) => reject(new Error(`the editor exited with ${code}:\n${output}`)));
      });

      const response = await fetch(`http://127.0.0.1:${port}/api/state`);
      const state = (await response.json()) as { recipes: { id: string }[]; tags: unknown[] };
      expect(response.status).toBe(200);
      expect(state.recipes.length).toBeGreaterThan(0);
      expect(state.tags.length).toBeGreaterThan(0);
      expect(output).not.toMatch(/warning/i);
    } finally {
      editor.kill();
    }
  });
});
