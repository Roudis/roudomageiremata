# Codebase Index

Quick-reference map of the Roudomageirikes codebase. Use this to jump to the
right file instead of re-exploring the tree each time. Rules and constraints
for working in the repo live in [CLAUDE.md](CLAUDE.md).

## Overview
- **Stack:** Next.js 14 (App Router) + React 18 + TypeScript (strict) + Tailwind CSS 3.
  Extra deps: `framer-motion` for animation, `lucide-react` for icons, `server-only`
  to keep the data loader out of client bundles.
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
- [.github/workflows/changelog.yml](.github/workflows/changelog.yml) regenerates
  and commits [CHANGELOG.md](CHANGELOG.md) after every push.
- `next.config.mjs` sets `basePath`/`assetPrefix` to `/roudomageiremata` and
  exposes it as `NEXT_PUBLIC_BASE_PATH` only when `GITHUB_ACTIONS=true`, so
  local `npm run dev`/`npm run build` are unaffected.
- [public/.nojekyll](public/.nojekyll) prevents Jekyll from ignoring `_next/`.
- Open Graph image URLs are absolute: `metadataBase` (the origin) in
  [app/layout.tsx](app/layout.tsx) plus `withBasePath` on the image path.

## Directory Map
```
app/
  layout.tsx                 Root layout: Geist fonts, animated background, Navbar, Footer, lang="el";
                             site metadata: metadataBase, title template, description
  template.tsx               Client; framer-motion fade-in page transition
  page.tsx                   Home: hero, recipe count, <RecipeList> with all recipes
  not-found.tsx              Custom 404 page
  globals.css                Tailwind layers, CSS vars, .glass-panel / .glass-card utilities
  fonts/                     Local Geist variable fonts
  recipes/
    [id]/page.tsx            Recipe detail; loads the recipe and composes components/recipe-detail/*;
                             statically generated for every recipe id
components/
  navbar.tsx                 Client; fixed header, scroll-aware styling, home/search links
  footer.tsx                 Footer with copyright year
  recipe-list.tsx            Client; search box + category filter + animated grid of cards;
                             takes RecipeSummary[], announces the result count to screen readers
  recipe-card.tsx            Card for the grid; takes a RecipeSummary; one gradient per category;
                             links to /recipes/[id]
  category-badge.tsx         Category pill shared by the card and the detail page (variant prop)
  recipe-detail/             Sections of the recipe page, all server components
    recipe-hero.tsx          Full-width image; renders nothing when the recipe has no image
    recipe-stats.tsx         StatTile + RecipeStats: prep, cook, servings, updated date
    recipe-memory.tsx        The family story attached to a recipe
    ingredient-list.tsx      Ingredient list with the count badge
    step-list.tsx            Numbered steps
lib/
  recipes.ts                 Server-only build-time data access: createRecipeStore(dir),
                             getRecipeIds(), getAllRecipes(), getRecipeById(id)
  recipes.test.ts            Vitest characterization tests for recipes.ts, using temp folders
  recipes.data.test.ts       Validates the real data/recipes files; the only file `npm run validate:data` runs
  recipe-view.ts             Pure: CATEGORY_FALLBACK, categoryLabel, categoryColorIndex,
                             formatIngredientCount, formatRecipeDate, compareRecipes, toRecipeSummary
  recipe-search.ts           Pure: normalizeSearchText, getCategories, filterRecipes for the home page list
  recipe-schema.ts           Pure: parseRecipe(value, source, { expectedId }), RecipeDataError, isRecipeId;
                             the single recipe schema, used by the loader and the data test
  base-path.ts               Pure: withBasePath(path) for raw asset URLs such as <img src>
  *.test.ts                  Vitest unit tests next to each module above
types/
  recipe.ts                  `Recipe` and `Memory` interfaces, plus the `RecipeSummary` view type
data/
  recipes/<id>.json          Recipe data, one file per recipe (source of truth)
public/
  images/recipes/<id>.jpg    Recipe images
scripts/
  generate-changelog.mjs     Generates CHANGELOG.md from the Git commit history
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
  imageUrl?: string;       // "/images/recipes/<id>.jpg", prefixed via withBasePath when rendered
  category?: string;       // grouping used by the filter buttons and the card colour;
                           // missing → "Άλλο" everywhere (categoryLabel in lib/recipe-view.ts)
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp; list is sorted by this, newest first, then title, then id
}
```

## Data Access Layer ([lib/recipes.ts](lib/recipes.ts))
Read-only; runs at build time. Imports `server-only`, so client components
cannot import it.
- `createRecipeStore(dir)` returns the three functions below for any folder;
  tests use a temp folder. The exported functions use `data/recipes` under
  `process.cwd()`, resolved on each call.
- Every file is validated with `parseRecipe`, and its `id` must equal its
  filename. **A file that is unreadable, invalid JSON, or invalid is skipped
  with a `console.warn` naming the file and each problem; the build still
  succeeds without it.** `npm run validate:data` fails on such files, and CI
  runs it before building.
- `getAllRecipes()` returns the valid recipes sorted by `compareRecipes` from
  `lib/recipe-view.ts`: `updatedAt` newest first, then title in Greek
  alphabetical order, then id. If `data/recipes` itself cannot be read it logs
  an error and returns `[]`.
- `getRecipeIds()` returns the ids of those same recipes, so skipped files get
  no page.
- `getRecipeById(id)` returns `undefined` for a non-slug id without touching the
  filesystem, for a missing file, and (with a warning) for an invalid file,
  which makes the detail page call `notFound()`.

## Pages / Routes
| Route | File | Description |
|---|---|---|
| `/` | [app/page.tsx](app/page.tsx) | Hero, recipe count, searchable/filterable recipe grid; sends `RecipeSummary` objects to the client |
| `/recipes/[id]` | [app/recipes/[id]/page.tsx](<app/recipes/[id]/page.tsx>) | Full recipe detail; generated for each id from `getRecipeIds()` with `dynamicParams = false`; `generateMetadata` adds a per-recipe title, description, and Open Graph image |
| 404 | [app/not-found.tsx](app/not-found.tsx) | Custom not-found page |

## Config Files
- [package.json](package.json): scripts `dev`, `build`, `start` (serves `out/`
  via `serve`), `lint`, `typecheck`, `test`, `test:watch`, `validate:data`,
  `changelog`, `changelog:check`, `check`.
- [vitest.config.mts](vitest.config.mts): Vitest in node environment with the `@/` alias;
  aliases `server-only` to its no-op `empty.js` so the loader can be imported in tests.
- [tsconfig.json](tsconfig.json): strict mode; path alias `@/*` → repo root.
- [.eslintrc.json](.eslintrc.json): extends `next/core-web-vitals`, `next/typescript`.
- [tailwind.config.ts](tailwind.config.ts): content from `app/`, `components/`,
  `pages/`; custom `float`, `fade-in-up`, `mesh` animations and `hero-glow` background.
- [next.config.mjs](next.config.mjs): static export, Pages base path, unoptimized images.
- [.claude/settings.json](.claude/settings.json): shared Claude Code permissions.

## Common Tasks — Where to Look
- **Add/edit/remove a recipe:** edit `data/recipes/<id>.json` (+ image in
  `public/images/recipes/`), run `npm run validate:data`, open a PR into `main`.
- **Regenerate the changelog:** run `npm run changelog`. The push workflow also
  performs this automatically; never edit [CHANGELOG.md](CHANGELOG.md) manually.
- **Change recipe fields/shape:** [types/recipe.ts](types/recipe.ts) →
  [lib/recipe-schema.ts](lib/recipe-schema.ts) →
  [lib/recipes.ts](lib/recipes.ts) → card, list, and detail components.
- **Change search/filter behavior:** matching and category logic in
  [lib/recipe-search.ts](lib/recipe-search.ts); UI state in
  [components/recipe-list.tsx](components/recipe-list.tsx).
- **Change styling/theme:** inline Tailwind classes in each component, plus
  [app/globals.css](app/globals.css) and [tailwind.config.ts](tailwind.config.ts).

## Notes / Gotchas
- No auth, no database. `npm run check` is the verification step.
- Unit tests cover `lib/`: characterization tests for `recipes.ts` and unit
  tests for the pure helpers. Tests named "(current behavior)" lock down quirks
  that a later refactor step changes. Components and pages have no tests.
- All real recipes currently share one `updatedAt` value, so the home page
  order comes from the title and id tie-breaks in `compareRecipes`.
- Search ignores case, accents, and final sigma (`normalizeSearchText`), so
  "καρμπονάρα" finds "Η ΚΑΡΜΠΟΝΑΡΑ".
- The "updated" date is formatted with `formatRecipeDate`: `el-GR` in
  `Europe/Athens`, for example "10 Αυγ 2026".
- Card colours come from the category, through `categoryColorIndex` and the
  gradient list in `recipe-card.tsx`. Colours are stable per category but not
  guaranteed unique; today's six categories happen to get six different ones.
- Tailwind's `content` globs cover `app/` and `components/` only, so class
  strings in `lib/` would be dropped from the CSS.
- No add/edit/delete UI or API routes. The site is a static export.
- `next start` does not work with `output: "export"`; use `npm run start`.
