/**
 * Prefixes a root-relative asset path, such as "/images/recipes/gemista.jpg",
 * with the GitHub Pages base path. `next/link` adds the base path on its own,
 * but raw URLs like `<img src>` need this.
 *
 * NEXT_PUBLIC_BASE_PATH is set in next.config.mjs and inlined at build time.
 */
export function withBasePath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
}
