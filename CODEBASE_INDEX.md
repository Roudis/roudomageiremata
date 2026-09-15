# Codebase Index

Quick-reference map of the Roudomageirikes codebase. Use this to jump to the
right file instead of re-exploring the tree each time. Rules and constraints
for working in the repo live in [CLAUDE.md](CLAUDE.md).

## Overview
- **Stack:** Next.js 14 (App Router) + React 18 + TypeScript (strict) + Tailwind CSS 3.
  Extra deps: `framer-motion` for animation, `lucide-react` for icons.
- **Purpose:** A personal Greek family-recipe journal. Browse and search recipes,
  each optionally paired with a family "memory" (story + date).
- **Persistence:** One JSON file per recipe in [data/recipes/](data/recipes)
  (no database). Currently 30 recipes. Read at **build time** only.
- **Rendering:** Fully static export (`output: "export"` in
  [next.config.mjs](next.config.mjs)). Every `/recipes/[id]` page is
  pre-rendered via `generateStaticParams`, so the site can be hosted on GitHub
  Pages (no server, no API routes).

## Deployment (GitHub Pages)
- Live at https://roudis.github.io/roudomageiremata/. The GitHub repo was
  renamed from `roudomageirikes` to `roudomageiremata`; the local folder name
  still uses the old name.
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) runs lint,
  typecheck, unit tests, data validation, and `npm run build`, then publishes `out/` via
  `actions/deploy-pages` on every push to `main`.
- [.github/workflows/ci.yml](.github/workflows/ci.yml) runs the same checks on
  pull requests and pushes to non-main branches.
- `next.config.mjs` sets `basePath`/`assetPrefix` to `/roudomageiremata` and
  exposes it as `NEXT_PUBLIC_BASE_PATH` only when `GITHUB_ACTIONS=true`, so
  local `npm run dev`/`npm run build` are unaffected.
- [public/.nojekyll](public/.nojekyll) prevents Jekyll from ignoring `_next/`.

## Directory Map
```
app/
  layout.tsx                 Root layout: Geist fonts, animated background, Navbar, Footer, lang="el"
  template.tsx               Client; framer-motion fade-in page transition
  page.tsx                   Home: hero, recipe count, <RecipeList> with all recipes
  not-found.tsx              Custom 404 page
  globals.css                Tailwind layers, CSS vars, .glass-panel / .glass-card utilities
  fonts/                     Local Geist variable fonts
  recipes/
    [id]/page.tsx            Recipe detail (image, notes, memory, ingredients, steps);
                             statically generated for every recipe id
components/
  navbar.tsx                 Client; fixed header, scroll-aware styling, home/search links
  footer.tsx                 Footer with copyright year
  recipe-list.tsx            Client; search box + category filter + animated grid of cards
  recipe-card.tsx            Card for the grid; gradient rotates by index % 4; links to /recipes/[id]
lib/
  recipes.ts                 Build-time data access: getAllRecipes(), getRecipeById(id)
  recipes.test.ts            Vitest characterization tests for recipes.ts
types/
  recipe.ts                  `Recipe` and `Memory` interfaces
data/
  recipes/<id>.json          Recipe data, one file per recipe (source of truth)
public/
  images/recipes/<id>.jpg    Recipe images
scripts/
  validate-recipes.mjs       Data validator used by `npm run validate:data` and CI
populate.js                  Legacy seeding script; overwrites data/recipes. Do not run.
download-images.js           Legacy image downloader. Do not run.
download-all-images.js       Legacy; rewrites imageUrl in every recipe. Do not run.
```

## Data Model ([types/recipe.ts](types/recipe.ts))
```ts
interface Memory {
  title: string;
  story: string;
  date?: string;
}

interface Recipe {
  id: string;              // lowercase Greeklish slug; must equal the filename, e.g. "tsilichoyda"
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  memory?: Memory;
  imageUrl?: string;       // "/images/recipes/<id>.jpg", prefixed with NEXT_PUBLIC_BASE_PATH when rendered
  category?: string;       // grouping used by the filter buttons; missing → "Άλλο"
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp; list is sorted by this, newest first
}
```

## Data Access Layer ([lib/recipes.ts](lib/recipes.ts))
Read-only; runs at build time.
- `getAllRecipes()` reads every `data/recipes/*.json`, sorts by `updatedAt` desc.
  **On any error it logs and returns `[]`**, so a broken file yields an empty
  site instead of a failed build. `npm run validate:data` guards against this.
- `getRecipeById(id)` reads `data/recipes/<id>.json`; returns `undefined` if
  missing or unparseable, which makes the detail page call `notFound()`.
  It does not sanitize `id` or check that the file's `id` matches.

## Pages / Routes
| Route | File | Description |
|---|---|---|
| `/` | [app/page.tsx](app/page.tsx) | Hero, recipe count, searchable/filterable recipe grid |
| `/recipes/[id]` | [app/recipes/[id]/page.tsx](<app/recipes/[id]/page.tsx>) | Full recipe detail; statically generated |
| 404 | [app/not-found.tsx](app/not-found.tsx) | Custom not-found page |

## Config Files
- [package.json](package.json): scripts `dev`, `build`, `start` (serves `out/`
  via `serve`), `lint`, `typecheck`, `test`, `test:watch`, `validate:data`, `check`.
- [vitest.config.mts](vitest.config.mts): Vitest in node environment with the `@/` alias.
- [tsconfig.json](tsconfig.json): strict mode; path alias `@/*` → repo root.
- [.eslintrc.json](.eslintrc.json): extends `next/core-web-vitals`, `next/typescript`.
- [tailwind.config.ts](tailwind.config.ts): content from `app/`, `components/`,
  `pages/`; custom `float`, `fade-in-up`, `mesh` animations and `hero-glow` background.
- [next.config.mjs](next.config.mjs): static export, Pages base path, unoptimized images.
- [.claude/settings.json](.claude/settings.json): shared Claude Code permissions.

## Common Tasks — Where to Look
- **Add/edit/remove a recipe:** edit `data/recipes/<id>.json` (+ image in
  `public/images/recipes/`), run `npm run validate:data`, open a PR into `main`.
- **Change recipe fields/shape:** [types/recipe.ts](types/recipe.ts) →
  [scripts/validate-recipes.mjs](scripts/validate-recipes.mjs) →
  [lib/recipes.ts](lib/recipes.ts) → card, list, and detail components.
- **Change search/filter behavior:** [components/recipe-list.tsx](components/recipe-list.tsx).
- **Change styling/theme:** inline Tailwind classes in each component, plus
  [app/globals.css](app/globals.css) and [tailwind.config.ts](tailwind.config.ts).

## Notes / Gotchas
- No auth, no database. `npm run check` is the verification step.
- Unit tests cover `lib/recipes.ts` only, as characterization tests that lock
  down current behavior. Components and pages have no tests.
- All real recipes currently share one `updatedAt` value, so the home page
  order is effectively the filesystem's directory listing order, which can
  differ between macOS and the Linux build machine.
- No add/edit/delete UI or API routes. The site is a static export.
- `next start` does not work with `output: "export"`; use `npm run start`.
