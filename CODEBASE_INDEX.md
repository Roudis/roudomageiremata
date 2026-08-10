# Codebase Index

Quick-reference map of the Roudomageirikes codebase. Use this to jump to the
right file instead of re-exploring the tree each time.

## Overview
- **Stack:** Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS.
- **Purpose:** A personal recipe journal — browse recipes, each optionally
  paired with a family "memory" (story + date).
- **Persistence:** Flat JSON file at [data/recipes.json](/Users/alkisroudis/Desktop/roudomageirikes/data/recipes.json) (no database).
  Currently seeded with 3 recipes (Gemista, Spanakopita, Chicken Avgolemono
  Soup). Read at **build time** only — see Deployment below.
- **Rendering:** Fully static export (`output: "export"` in
  [next.config.mjs](/Users/alkisroudis/Desktop/roudomageirikes/next.config.mjs)). All pages and every `/recipes/[id]` detail page are
  pre-rendered to static HTML at build time via `generateStaticParams`, so the
  site can be hosted on GitHub Pages (no server, no API routes).

## Deployment (GitHub Pages)
- [.github/workflows/deploy.yml](/Users/alkisroudis/Desktop/roudomageirikes/.github/workflows/deploy.yml) builds the site with `npm run build` and
  publishes the `out/` folder via `actions/deploy-pages` on every push to
  `main`. Enable **Settings → Pages → Source: GitHub Actions** once.
- `next.config.mjs` sets `basePath`/`assetPrefix` to `/roudomageirikes` only
  when `GITHUB_ACTIONS=true` (set automatically by GitHub-hosted runners), so
  local `npm run dev`/`npm run build` are unaffected.
- [public/.nojekyll](/Users/alkisroudis/Desktop/roudomageirikes/public/.nojekyll) prevents GitHub Pages' Jekyll processing from ignoring the
  `_next/` asset folder.
- **There are no add/edit/delete recipe features anymore** — the old
  `app/api/recipes` routes and the create/edit forms required a writable
  server, which GitHub Pages can't provide. To change recipes, edit
  [data/recipes.json](/Users/alkisroudis/Desktop/roudomageirikes/data/recipes.json) directly and push — the workflow rebuilds and redeploys.

## Directory Map
```
app/
  layout.tsx                 Root layout, fonts, global background/metadata
  page.tsx                   Home page — hero + recipe grid (RecipeCard list)
  not-found.tsx               Custom 404 page
  globals.css                 Tailwind base styles
  recipes/
    [id]/page.tsx              Recipe detail page (ingredients, steps, memory);
                                 statically generated for every recipe id
components/
  recipe-card.tsx              Card used in the home grid (gradient rotates per index)
lib/
  recipes.ts                    Read-only data-access layer: reads data/recipes.json
                                 at build time (getAllRecipes, getRecipeById)
types/
  recipe.ts                     `Recipe` and `Memory` TypeScript interfaces
data/
  recipes.json                  The actual recipe data store (source of truth)
```

## Data Model ([types/recipe.ts](/Users/alkisroudis/Desktop/roudomageirikes/types/recipe.ts))
```ts
interface Memory {
  title: string;
  story: string;
  date?: string;
}

interface Recipe {
  id: string;              // slug + short uuid, e.g. "gemista-summer-sundays"
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  memory?: Memory;
  imageUrl?: string;
  category?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

## Data Access Layer ([lib/recipes.ts](/Users/alkisroudis/Desktop/roudomageirikes/lib/recipes.ts))
Read-only; nothing writes to the JSON file anymore (no server at runtime).
- `getAllRecipes()` — reads file, sorts by `updatedAt` desc.
- `getRecipeById(id)` — finds one recipe.

## Pages / Routes
| Route | File | Description |
|---|---|---|
| `/` | [app/page.tsx](/Users/alkisroudis/Desktop/roudomageirikes/app/page.tsx) | Hero section + grid of `RecipeCard`s, recipe count |
| `/recipes/[id]` | [app/recipes/[id]/page.tsx](</Users/alkisroudis/Desktop/roudomageirikes/app/recipes/[id]/page.tsx>) | Full recipe detail: notes, ingredients, method, memory; statically generated |
| 404 | [app/not-found.tsx](/Users/alkisroudis/Desktop/roudomageirikes/app/not-found.tsx) | Custom not-found page |

## Components
- [components/recipe-card.tsx](/Users/alkisroudis/Desktop/roudomageirikes/components/recipe-card.tsx) — server-renderable card; rotates through 4
  gradient themes by `index % 4`; links to `/recipes/[id]`.

## Config Files
- [package.json](/Users/alkisroudis/Desktop/roudomageirikes/package.json) — scripts: `dev`, `build`, `start` (serves the built `out/` via `serve`),
  `lint` (`next lint`). Deps: `next@14.2.35`, `react@18`.
- [tsconfig.json](/Users/alkisroudis/Desktop/roudomageirikes/tsconfig.json) — path alias `@/*` → repo root; strict mode on.
- [.eslintrc.json](/Users/alkisroudis/Desktop/roudomageirikes/.eslintrc.json) — extends `next/core-web-vitals`, `next/typescript`.
- [tailwind.config.ts](/Users/alkisroudis/Desktop/roudomageirikes/tailwind.config.ts) — content scanned from `app/`, `components/`, `pages/`.
- [next.config.mjs](/Users/alkisroudis/Desktop/roudomageirikes/next.config.mjs) — `output: "export"`, GitHub Pages `basePath`/`assetPrefix`,
  unoptimized images (required for static export).
- [.github/workflows/deploy.yml](/Users/alkisroudis/Desktop/roudomageirikes/.github/workflows/deploy.yml) — builds and deploys to GitHub Pages on push to `main`.

## Common Tasks — Where to Look
- **Change recipe fields/shape:** [types/recipe.ts](/Users/alkisroudis/Desktop/roudomageirikes/types/recipe.ts) → [lib/recipes.ts](/Users/alkisroudis/Desktop/roudomageirikes/lib/recipes.ts) →
  detail/card display components.
- **Change styling/theme:** Tailwind utility classes inline in each
  component/page (no separate design-token file besides
  [app/globals.css](/Users/alkisroudis/Desktop/roudomageirikes/app/globals.css) and [tailwind.config.ts](/Users/alkisroudis/Desktop/roudomageirikes/tailwind.config.ts)).
- **Add/edit/remove a recipe:** edit [data/recipes.json](/Users/alkisroudis/Desktop/roudomageirikes/data/recipes.json) directly and push to `main` —
  the GitHub Pages workflow rebuilds and redeploys automatically.

## Notes / Gotchas
- There is no auth, no database, and no tests in this repo.
- No add/edit/delete UI or API routes — the site is a static export, so
  recipe changes are made by editing [data/recipes.json](/Users/alkisroudis/Desktop/roudomageirikes/data/recipes.json) and redeploying.
- `next start` does not work with `output: "export"`; use `npm run start`
  (which runs `serve` against `out/`) to preview a production build locally.
