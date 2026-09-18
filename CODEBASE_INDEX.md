# Codebase Index

Quick-reference map of the Roudomageirikes codebase. Use this to jump to the
right file instead of re-exploring the tree each time. Rules and constraints
for working in the repo live in [CLAUDE.md](CLAUDE.md).

## Overview
- **Stack:** Next.js 14 (App Router) + React 18 + TypeScript (strict) + Tailwind CSS 3.
  Extra deps: `framer-motion` for animation, `lucide-react` for icons, `server-only`
  to keep the data loader out of client bundles.
- **Purpose:** A personal Greek family-recipe journal. Browse and search recipes,
  each optionally paired with a family "memory" (story + date), and filter them by
  category or by tag (vegan, beef, pasta, …).
- **Languages:** Greek (the original, unprefixed URLs) plus English, Dutch, French,
  Swedish, Spanish, Italian, Romanian, Czech, Ukrainian, and Japanese under `/en`,
  `/nl`, `/fr`, `/sv`, `/es`, `/it`, `/ro`, `/cs`, `/uk`, `/ja`. A
  language menu at the right of the navbar switches between them on the same page.
- **Persistence:** One JSON file per recipe in [data/recipes/](data/recipes)
  (no database at build time). Currently 30 recipes. Read at **build time** only.
- **Editing:** Recipes are edited in a Strapi 5 CMS, a separate project in
  `../roudomageiremata-cms`, and pulled into the JSON files and images with
  `npm run sync:strapi`. The build and deploy never contact Strapi.
- **Rendering:** Fully static export (`output: "export"` in
  [next.config.mjs](next.config.mjs)). Every recipe page is pre-rendered in every
  language via `generateStaticParams` (7 homes, 7 × 30 recipe pages), so the site
  can be hosted on GitHub Pages (no server, no API routes).

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
- Open Graph image and alternate-language URLs are absolute: `metadataBase` (the
  origin) in [app/_shared/root-layout.tsx](app/_shared/root-layout.tsx) plus
  `withBasePath` on the path.
- The export writes `en.html` next to an `en/` folder. GitHub Pages serves
  `en.html` for `/en` in that case, so no trailing-slash setting is needed.

## Directory Map
```
app/
  layout.tsx                 Pass-through top layout (no <html>) with the Greek site metadata; needed so
                             Next builds not-found.tsx as the 404 page
  not-found.tsx              Custom 404 page (Greek); renders its own RootLayout, language menu links to each home
  globals.css                Theme tokens (HSL CSS vars, light + prefers-color-scheme dark), .page-container
  (el)/                      Greek pages at the unprefixed URLs
    layout.tsx               <RootLayout locale="el">
    template.tsx             Re-exports _shared/page-transition
    page.tsx                 /  → <HomePage locale="el">
    recipes/[id]/page.tsx    /recipes/[id]  → <RecipePage locale="el">
  [locale]/                  The other ten languages under their code
    layout.tsx               generateStaticParams → TRANSLATED_LOCALES; <RootLayout locale={locale}>, per-language metadata
    template.tsx             Re-exports _shared/page-transition
    page.tsx                 /en etc.
    recipes/[id]/page.tsx    /en/recipes/[id] etc.
  _shared/                   Private folder (not a route): what both trees render
    root-layout.tsx          RootLayout: fonts (Greek, Latin, Latin Extended, and Cyrillic subsets; Japanese from system fonts), <html lang>, Navbar, Footer; rootMetadata(locale)
    home-page.tsx            HomePage: hero with a three-photo mosaic, quote and stats band, <RecipeList>; homeMetadata
    recipe-page.tsx          RecipePage: composes components/recipe-detail/*, shows a notice for an untranslated
                             recipe, and links each tag to the list filtered by it (/?tag=<id>);
                             recipeMetadata, recipeStaticParams
    metadata.ts              languageAlternates(path, locale): canonical + hreflang links for every language
    page-transition.tsx      Client; framer-motion fade-in page transition; MotionConfig respects reduced motion
components/
  navbar.tsx                 Sticky header: monogram and wordmark, link to the recipe grid, language menu
  language-switcher.tsx      Client; disclosure button + list of plain <a> links to the same page in each language
  footer.tsx                 Footer with copyright year
  recipe-list.tsx            Client; search box with clear button + category chips + tag chips + animated grid of
                             cards; takes RecipeSummary[], locale, category names, and its message sections;
                             reads ?tag= on mount and writes it back when the tag changes
  recipe-card.tsx            Photo-first card for the grid, with the recipe's tags; takes a RecipeSummary; links to
                             the recipe in the page's language
  category-badge.tsx         CategoryBadge (green label + dot, variant prop) and CategoryDot, whose colour
                             list lives here; used by the card, the filter chips, and the detail page
  recipe-detail/             Sections of the recipe page, all server components taking `locale`
    recipe-hero.tsx          Recipe photo beside the title; renders nothing when the recipe has no image
    recipe-stats.tsx         StatTile + RecipeStats: prep, cook, servings, updated date, as a <dl>
    recipe-memory.tsx        The family story attached to a recipe, on the purple feature band
    ingredient-list.tsx      Ingredients as native checkboxes (no client JS) with the count badge;
                             sticky beside the steps on large screens
    step-list.tsx            Numbered steps with the step count
lib/
  i18n/
    config.ts                Pure: LOCALES, DEFAULT_LOCALE, TRANSLATED_LOCALES, LOCALE_DETAILS (name, Intl tag,
                             og:locale), SITE_NAME, isLocale, localizePath, splitLocalePath
    format.ts                Pure: formatCount(locale, { one, few?, other }, n) with Intl.PluralRules
    messages/el.ts           Greek interface text; defines the Messages type every other language must match
    messages/<locale>.ts     en, nl, fr, sv, es, it, ro, cs, uk, ja
    messages/index.ts        getMessages(locale)
  tags.ts                    Pure: TAG_NAMES (the tag list, named in every language), TagId, TAG_IMPLIES,
                             NOT_VEGETARIAN, isTagId, tagName, expandTags
  recipes.ts                 Server-only build-time data access: createRecipeStore(dir),
                             getRecipeIds(), getAllRecipes(), getRecipeById(id); recipes include their translations
  categories.ts              Server-only: getCategoryNames(locale) from data/categories.json, plus the fallback name
  recipes.test.ts            Vitest characterization tests for recipes.ts, using temp folders
  recipes.data.test.ts       Validates the real data/recipes files and data/categories.json;
                             the only file `npm run validate:data` runs
  recipe-view.ts             Pure: CATEGORY_FALLBACK, categoryLabel, categoryDisplayName, categoryColorIndex,
                             formatRecipeDate, formatMemoryDate, recipeOrder(locale), compareRecipes (Greek order),
                             localizeRecipe, toRecipeSummary
  recipe-search.ts           Pure: normalizeSearchText, getCategories, getTags, filterRecipes (query, category,
                             tag, locale) for the home page list
  recipe-schema.ts           Pure: parseRecipe(value, source, { expectedId }) including tags and translations,
                             parseCategoryTranslations, RecipeDataError, isRecipeId; used by the loaders and the data test
  base-path.ts               Pure: withBasePath(path) for raw URLs such as <img src> or <a href>
  *.test.ts                  Vitest unit tests next to each module above
types/
  recipe.ts                  `Recipe`, `Memory`, and `RecipeTranslation`; the view types `LocalizedRecipe` and
                             `RecipeSummary`; `CategoryNames`
data/
  recipes/<id>.json          Recipe data, one file per recipe with its translations (source of truth)
  categories.json            Category names in the other languages, keyed by Greek category name
public/
  images/recipes/<id>.jpg    Recipe images
scripts/
  sync-from-strapi.mjs       `npm run sync:strapi`: published Strapi recipes → data/recipes + images
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
  tags?: TagId[];          // ids from TAG_NAMES in lib/tags.ts, most specific only ("vegan", not also "vegetarian")
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp; list is sorted by this, newest first, then title, then id
  translations?: {         // optional; a missing language shows the Greek text with a notice
    [locale in "en" | "nl" | "fr" | "sv" | "es" | "it" | "ro" | "cs" | "uk" | "ja"]?: RecipeTranslation;
  };
}

interface RecipeTranslation {
  title: string;
  description: string;
  ingredients: string[];   // same count as the Greek
  steps: string[];         // same count as the Greek
  memory?: { title: string; story: string };   // exactly when the Greek has one; date comes from the Greek
  prepTime?: string;       // exactly when the Greek has one
  cookTime?: string;       // exactly when the Greek has one
}
```

`localizeRecipe(recipe, locale)` returns a `LocalizedRecipe`: the translation laid
over the Greek (without `translations`), plus `contentLocale`, the language the
text is actually in. `category` stays the Greek name; pages show it through
`getCategoryNames(locale)` and `categoryDisplayName`.

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
- A translation whose ingredient or step count differs from the Greek makes the
  whole file invalid, like any other schema problem.
- `getCategoryNames(locale)` in [lib/categories.ts](lib/categories.ts) reads
  `data/categories.json`. A missing file means Greek names; an invalid one is
  ignored with a warning.

## Pages / Routes
| Route | File | Description |
|---|---|---|
| `/` | [app/(el)/page.tsx](<app/(el)/page.tsx>) | Greek home: hero, recipe count, searchable/filterable recipe grid; sends `RecipeSummary` objects to the client |
| `/recipes/[id]` | [app/(el)/recipes/[id]/page.tsx](<app/(el)/recipes/[id]/page.tsx>) | Greek recipe detail; generated for each id from `getRecipeIds()` (no `dynamicParams = false`: it breaks `npm run dev` with static export on Next 14); metadata adds title, description, Open Graph image, and hreflang alternates |
| `/[locale]` | [app/[locale]/page.tsx](<app/[locale]/page.tsx>) | The same home in en, nl, fr, sv, es, it, ro, cs, uk, ja, sorted by that language's titles |
| `/[locale]/recipes/[id]` | [app/[locale]/recipes/[id]/page.tsx](<app/[locale]/recipes/[id]/page.tsx>) | The same recipe page in that language, or the Greek text with a notice when untranslated |
| 404 | [app/not-found.tsx](app/not-found.tsx) | Custom not-found page (Greek), served by GitHub Pages for any unknown path |

## Config Files
- [package.json](package.json): scripts `dev`, `build`, `start` (serves `out/`
  via `serve`), `lint`, `typecheck`, `test`, `test:watch`, `validate:data`,
  `sync:strapi`, `changelog`, `changelog:check`, `check`.
- [vitest.config.mts](vitest.config.mts): Vitest in node environment with the `@/` alias;
  aliases `server-only` to its no-op `empty.js` so the loader can be imported in tests.
- [tsconfig.json](tsconfig.json): strict mode; path alias `@/*` → repo root.
- [.eslintrc.json](.eslintrc.json): extends `next/core-web-vitals`, `next/typescript`.
- [tailwind.config.ts](tailwind.config.ts): content from `app/`, `components/`,
  `pages/`; theme colours mapped to the CSS variables in `app/globals.css`, and the
  `font-sans` / `font-serif` families.
- [next.config.mjs](next.config.mjs): static export, Pages base path, unoptimized images.
- [.claude/settings.json](.claude/settings.json): shared Claude Code permissions.

## Common Tasks — Where to Look
- **Add/edit/remove a recipe:** edit and publish its Greek text and image in
  Strapi (`npm run develop` in `../roudomageiremata-cms`), run
  `npm run sync:strapi` (add `-- --prune` after deleting one), then add or
  update its `tags` and `translations` in `data/recipes/<id>.json`, which
  Strapi doesn't hold yet and the sync keeps. Review the diff, open a PR into
  `main`. Direct edits to Strapi-managed fields in the JSON are overwritten
  by the next sync.
- **Add a tag:** add its id and its name in every language to `TAG_NAMES` in
  [lib/tags.ts](lib/tags.ts), and to `TAG_IMPLIES` if it is a kind of an existing
  tag (as beef is of meat). Then list it in the recipes' `tags`.
- **Add or rename a category:** set `category` in the recipes and add its names
  to [data/categories.json](data/categories.json).
- **Change interface text:** edit the key in every file in
  [lib/i18n/messages/](lib/i18n/messages); `el.ts` defines the keys.
- **Add a language:** add its code to `LOCALES` and `LOCALE_DETAILS` in
  [lib/i18n/config.ts](lib/i18n/config.ts), a messages file registered in
  `messages/index.ts`, its names in `data/categories.json`, and translations in
  the recipe files. Check the font subsets in `app/_shared/root-layout.tsx`.
- **Regenerate the changelog:** run `npm run changelog`. The push workflow also
  performs this automatically; never edit [CHANGELOG.md](CHANGELOG.md) manually.
- **Change recipe fields/shape:** [types/recipe.ts](types/recipe.ts) →
  [lib/recipe-schema.ts](lib/recipe-schema.ts) →
  [lib/recipes.ts](lib/recipes.ts) → card, list, and detail components.
- **Change search/filter behavior:** matching and category logic in
  [lib/recipe-search.ts](lib/recipe-search.ts); UI state in
  [components/recipe-list.tsx](components/recipe-list.tsx).
- **Change styling/theme:** inline Tailwind classes in each component. Colours are
  tokens: change a value once in [app/globals.css](app/globals.css) (light and dark),
  and add a new token to [tailwind.config.ts](tailwind.config.ts).

## Notes / Gotchas
- No auth, and no database at build time. `npm run check` is the verification step.
- Unit tests cover `lib/`: characterization tests for `recipes.ts` and unit
  tests for the pure helpers. Tests named "(current behavior)" lock down quirks
  that a later refactor step changes. Components and pages have no tests.
- All real recipes currently share one `updatedAt` value, so the home page
  order comes from the title and id tie-breaks in `compareRecipes`.
- Search ignores case, accents, and final sigma (`normalizeSearchText`), so
  "καρμπονάρα" finds "Η ΚΑΡΜΠΟΝΑΡΑ". It searches the page's language only, and
  covers tag names, implied ones included: "κρέας" finds a recipe tagged beef.
- Selecting a vegetarian or meat tag also shows recipes whose tags imply it
  (vegan, or beef/pork/lamb/chicken). Cards and recipe pages show only the
  listed tags.
- Most recipes still have placeholder ingredients that don't match their titles,
  so their tags follow the title where it names the dish (carbonara → pork,
  pasta) and the listed ingredients where it doesn't (the "Έλα μου ντε" recipes).
- The "updated" date is formatted with `formatRecipeDate(iso, locale)` in
  `Europe/Athens`, for example "10 Αυγ 2026" or "10 Aug 2026". A memory's "YYYY-MM"
  date goes through `formatMemoryDate`, for example "Νοέμβριος 2023"; other values show as written.
- Category dot colours key on the Greek category name, so a category keeps its
  colour in every language.
- The recipe translations were machine-translated when the languages were added;
  titles with family wordplay are approximations for the family to adjust.
- Category dot colours come from the category, through `categoryColorIndex` and the
  colour list in `category-badge.tsx`. Colours are stable per category but not
  guaranteed unique; today's six categories happen to get six different ones.
- Tailwind's `content` globs cover `app/` and `components/` only, so class
  strings in `lib/` would be dropped from the CSS.
- No add/edit/delete UI or API routes. The site is a static export.
- `next start` does not work with `output: "export"`; use `npm run start`.
