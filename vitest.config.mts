import path from "node:path";
import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      // Mirror the "@/*" path alias from tsconfig.json.
      { find: /^@\//, replacement: `${rootDir}/` },
      // The real "server-only" throws unless bundled for React Server Components, so tests use its no-op variant.
      { find: /^server-only$/, replacement: `${rootDir}/node_modules/server-only/empty.js` },
    ],
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: [...configDefaults.exclude, ".next/**", "out/**", "graphify-out/**"],
  },
});
