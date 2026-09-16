# Refactor Plan: Recipe Loading and Rendering

**Status:** In progress. Completed steps are ticked in section 7. Decisions
1, 2, 5, and 10 are made (see section 6); the others are still open.
**Date:** 2026-09-15, reviewed at commit `374b3df`.
**Scope:** `lib/recipes.ts`, `types/recipe.ts`, `components/recipe-card.tsx`,
`components/recipe-list.tsx`, `app/recipes/[id]/page.tsx`, and `app/page.tsx`
where it passes data between them.

## 1. Summary

The app is small, about 470 lines across the files in scope, and it works.
Four problems matter more than the rest:

1. **Search misses real recipes.** Greek accents are compared literally, so
   "καρμπονάρα" and "τσιπούρα" return nothing although both dishes exist.
2. **Bad data fails late or not at all.** One broken JSON file makes
   `next build` fail with an unrelated error message. A recipe whose `id`
   differs from its filename builds fine and publishes a link to a 404 page.
3. **There is no server/client boundary.** The home page sends every recipe's
   full steps and memory stories to the browser, and a client component that
   imports the `fs`-based loader would only fail with a cryptic bundler error.
4. **Logic is duplicated and has drifted.** The recipe schema exists in three
   places, the base path logic in two, and the category fallback label in four
   places with two different values.

The proposed architecture separates a server-only data layer, pure helpers
with unit tests, and components that receive only the data they render. The
checklist in section 7 gets there in small steps: types and helpers first,
page routing last.

## 2. How Recipes Flow Today

```
data/recipes/<id>.json
   │  readdir + readFile + JSON.parse, cast "as Recipe", no validation
   ▼
lib/recipes.ts ── getAllRecipes(): sorted Recipe[]          any error → []
               └─ getRecipeById(id): Recipe | undefined     any error → undefined
   │
   ├─► app/page.tsx (server) ── full Recipe[] ──► RecipeList ("use client")
   │                                                ├─ search and filter logic inline
   │                                                └─► RecipeCard (ships as client code)
   │
   └─► app/recipes/[id]/page.tsx (server)
         ├─ generateStaticParams: getAllRecipes(), ids taken from file contents
         └─ page: getRecipeById(id), file chosen by filename, 160 lines of inline JSX
```

Every build reads each recipe file at least three times. That costs nothing
noticeable at 30 recipes and is not a goal of this plan.

## 3. Findings

"Verified" means the problem was reproduced during this review, either in the
built site under `out/` or in a throwaway copy of the project. Line numbers
refer to commit `374b3df`.

### 3.1 Defects Users or Maintainers Can Hit

| ID | Finding | Where | Evidence |
|---|---|---|---|
| B1 | Search is accent-sensitive. "καρμπονάρα" and "τσιπούρα" find no recipes although "Η ΚΑΡΜΠΟΝΑΡΑ" and "Η ΤΣΙΠΟΥΡΑ" exist. "πατατες" finds 1 recipe while "πατάτες" finds 6. | `recipe-list.tsx:27-29` | Verified by running the exact filter against `data/recipes`. |
| B2 | The "updated" date uses the build machine's locale and time zone. The Greek site shows "Aug 10, 2026". | `[id]/page.tsx:94` | Verified in `out/recipes/*.html`. |
| B3 | All 30 recipe pages share the home page's `<title>`, because there is no `generateMetadata`. | `[id]/page.tsx` | Verified in `out/`. |
| B4 | A card's colour depends on its position in the filtered list, so colours shift while searching or filtering. The array is named `categoryStyles` but has nothing to do with categories. | `recipe-list.tsx:88,98`, `recipe-card.tsx:21` | Code reading. |
| B5 | A recipe's identity has two sources. `generateStaticParams` uses the `id` inside each file, but `getRecipeById` reads by filename. A mismatch builds successfully and the home page links to a 404 page. | `[id]/page.tsx:15-24`, `recipes.ts:30` | Verified in a scratch copy: build exit code 0, and `/recipes/mismatch-id` rendered the 404 page. Today only `npm run validate:data` catches it. |
| B6 | One unparseable recipe file fails `next build` with a misleading error: `Page "/recipes/[id]" is missing "generateStaticParams()"`. The real `SyntaxError` only appears as a log line above it. In `next dev` the home page silently shows zero recipes. | `recipes.ts:22-25` | Verified in a scratch copy. |
| B7 | Accessibility gaps. Card images are decorative but use `alt={title}`, so screen readers read the title twice inside a very long link name. Card titles are `h2` inside a section that is already headed by an `h2`. Category buttons don't expose which one is selected. | `recipe-card.tsx:32,48`, `recipe-list.tsx:55,66` | Code reading. |

### 3.2 Technical Debt

| ID | Finding | Where |
|---|---|---|
| D1 | The home page passes full `Recipe` objects to a client component. Every recipe's steps, memory story, and timestamps are embedded in `out/index.html`, which is 212 KB. The list only renders title, description, category, image, prep time, servings, ingredient count, and whether a memory exists. | `app/page.tsx:64`, `recipe-list.tsx:10` |
| D2 | No server/client boundary guard. `lib/recipes.ts` uses `fs` without importing `server-only`. `RecipeCard` has no directive but is imported by a client component, so it ships as client code. | `recipes.ts:1`, `recipe-list.tsx:5` |
| D3 | Catch-all error handling. `getAllRecipes` turns any error into `[]`, which causes B6. `getRecipeById` turns parse errors and permission errors into a 404. | `recipes.ts:22,33` |
| D4 | No runtime validation. `JSON.parse(raw) as Recipe` lets `null`, arrays, and partial objects through, typed as `Recipe`. The characterization tests confirm this. | `recipes.ts:16,32` |
| D5 | The data folder is resolved from `process.cwd()` when the module is imported, which forces the tests to fake `cwd` and re-import the module. | `recipes.ts:5` |
| D6 | `getRecipeById` doesn't sanitize ids, so an id containing `../` escapes `data/recipes`. The risk is low because ids only come from the build, but the fix is trivial. | `recipes.ts:30` |
| D7 | Recipe order is not deterministic. All 30 recipes share the `updatedAt` value `2026-08-10T16:52:28.199Z`, so the home page order is the filesystem's listing order, which can differ between macOS and the Linux CI runner. | `recipes.ts:19-21` |
| D8 | The detail page is one 160-line component containing the hero image, header, four near-identical stat tiles, memory, ingredients, and steps. | `[id]/page.tsx` |
| D9 | The search input uses an inline style workaround instead of Tailwind classes. | `recipe-list.tsx:49` |
| D10 | Card images load eagerly, with no `loading="lazy"` or `decoding="async"`, and each `<img>` carries its own lint suppression. | `recipe-card.tsx:31-32`, `[id]/page.tsx:44-47` |
| D11 | Value imports are used for types, and a stale comment in `getRecipeById` talks about falling back to `getAllRecipes`. | `recipes.ts:3,34-35`, `recipe-card.tsx:3`, `recipe-list.tsx:4` |
| D12 | Both unmerged branches rewrite these files. `dual/lang` changes `lib/recipes.ts`, the card, and both pages, and is still built on the old single `data/recipes.json` model. `feature/reimagined-ui` changes the card, the list, and both pages. This refactor will make both harder to merge. | `git diff develop...dual/lang`, `git diff develop...feature/reimagined-ui` |

### 3.3 Duplicate Logic

| ID | Duplication | Where |
|---|---|---|
| X1 | Base path prefixing: `const basePath = process.env.NEXT_PUBLIC_BASE_PATH \|\| ""` followed by `${basePath}${recipe.imageUrl}`. | `recipe-card.tsx:6,32`, `[id]/page.tsx:7,46` |
| X2 | The category fallback appears four times with two values. The card and detail page say "Αγαπημενο της Οικογενειας", the filter says "Άλλο". An uncategorized recipe would be filtered under one label and displayed under the other. The category pill markup is also repeated. | `recipe-card.tsx:39`, `[id]/page.tsx:62`, `recipe-list.tsx:19,31` |
| X3 | The recipe schema exists three times with different strictness: `types/recipe.ts`, `scripts/validate-recipes.mjs`, and the `ShapeSpec` in `lib/recipes.test.ts`. | |
| X4 | Read-and-parse code is repeated in both loader functions, and `generateStaticParams` loads and sorts full recipes only to read their ids. | `recipes.ts:14-16,30-32`, `[id]/page.tsx:15-17` |
| X5 | Optional fields render differently. The card hides a missing prep time or servings and never shows cook time, while the detail page shows "—". The stat tile markup is repeated four times and the "N υλικά" label twice. | `recipe-card.tsx:61-78`, `[id]/page.tsx:75-96,126` |
| X6 | The search query is lowercased up to three times per recipe on every keystroke. | `recipe-list.tsx:27-29` |

### 3.4 Type Inconsistencies

| ID | Inconsistency | Where |
|---|---|---|
| T1 | `description` is required by the type but read with optional chaining. | `recipe-list.tsx:28` |
| T2 | `servings?: number` is rendered with `{recipe.servings && …}`, which prints a literal `0` for zero servings. Only the data validator prevents that. | `recipe-card.tsx:67` |
| T3 | The loader's declared return types are not true. `Promise<Recipe[]>` can contain `null` or partial objects, and `Promise<Recipe \| undefined>` can resolve to `null`. | `recipes.ts:7,28` |
| T4 | Nothing in the types expresses that `id` must equal the filename, which is the root of B5. | `types/recipe.ts:8` |
| T5 | Client components take the full storage type `Recipe` instead of a view type, and `RecipeCardProps.index` leaks a styling concern into props. | `recipe-card.tsx:15-18`, `recipe-list.tsx:9-11` |
| T6 | Page props use the synchronous `params` shape. That is correct for Next 14 but becomes `Promise<{ id: string }>` in Next 15 and later, which the pending security upgrade requires. | `[id]/page.tsx:9-13` |

Noted with no action proposed: `createdAt` is never read by app code, and
`category`, `prepTime`, `cookTime`, and `memory.date` are free text.

## 4. Correction to Existing Docs

`CLAUDE.md`, `CODEBASE_INDEX.md`, and `scripts/validate-recipes.mjs` say a
broken recipe file would build and deploy an empty site. That is wrong. The
build fails, with the misleading error described in B6, and only `next dev`
shows an empty site. Step 0.1 fixes the wording.

## 5. Proposed Architecture

### Principles

1. **One server-only data layer.** Only pages in `app/` import the `fs`-based
   loader, and the `server-only` package enforces that.
2. **Pure logic is framework-free.** Parsing, sorting, searching, formatting,
   and view mapping live in small modules with no `fs`, React, or Next
   imports. They get unit tests and are safe to import on either side.
3. **Components receive view models.** Client components get only the fields
   they render.
4. **Pages are thin.** A page loads data, maps it, and composes components.
5. **Bad data fails the build loudly,** with a message naming the file and
   the field.
6. **One schema** feeds the types, the loader, the data validation, and the
   tests.

### Target Module Map

| Module | Kind | Responsibility |
|---|---|---|
| `types/recipe.ts` | types | `Recipe` and `Memory` with the same shape as today, plus a new `RecipeSummary` view type |
| `lib/recipe-schema.ts` | pure | `parseRecipe(value, source)` returns a `Recipe` or throws `RecipeDataError` naming the file and field |
| `lib/recipes.ts` | server-only | `createRecipeStore(dir)` for filesystem access, plus `getRecipeIds`, `getAllRecipes`, and `getRecipeById` bound to `data/recipes` |
| `lib/recipe-view.ts` | pure | `toRecipeSummary`, `compareRecipes`, `categoryLabel`, `formatRecipeDate`, shared labels |
| `lib/recipe-search.ts` | pure | `normalizeSearchText`, `filterRecipes`, `getCategories` |
| `lib/base-path.ts` | pure | `withBasePath(path)` |
| `components/recipe-list.tsx` | client | Search and filter state only, delegating the logic to `recipe-search` |
| `components/recipe-card.tsx` | shared | Renders a `RecipeSummary`, with a colour derived from data rather than position |
| `components/category-badge.tsx` | shared | Category pill used by the card and the detail page |
| `components/recipe-detail/*` | server | `RecipeHero`, `RecipeStats` with `StatTile`, `RecipeMemory`, `IngredientList`, `StepList` |
| `app/page.tsx` | server page | Loads recipes, maps them with `toRecipeSummary`, renders `RecipeList` |
| `app/recipes/[id]/page.tsx` | server page | `generateStaticParams` from `getRecipeIds`, `dynamicParams = false`, `generateMetadata`, composes the detail components |

A flat `lib/` layout keeps the existing `@/lib/recipes` import path and leaves
the characterization tests where they are.

### Dependency Rules

```
app/page.tsx, app/recipes/[id]/page.tsx  (server)
   │                        │
   ▼                        ▼
lib/recipes.ts           components/recipe-detail/*  (server)
(server-only, fs)           │
   │                        ▼
   ▼                     lib/recipe-view.ts, lib/base-path.ts ◄── components/recipe-card.tsx,
lib/recipe-schema.ts        │                                     components/category-badge.tsx
   │                        ▼
   └──────────────────► types/recipe.ts ◄── lib/recipe-search.ts ◄── components/recipe-list.tsx
                                                                     ("use client")
```

- Only files in `app/` import `lib/recipes.ts`.
- Files marked `"use client"` import only from `types/`,
  `lib/recipe-view.ts`, `lib/recipe-search.ts`, and `lib/base-path.ts`.
- `lib/recipe-*.ts` and `lib/base-path.ts` import nothing from `fs`, `react`,
  or `next`.

## 6. Decisions Needed Before Starting

Each decision has a recommendation. Steps that depend on one say so.

| # | Decision | Options | Recommendation |
|---|---|---|---|
| 1 | What happens with bad recipe data | Fail the build naming the file; skip bad files with a warning; keep today's behavior | **Fail the build.** A static site should never deploy partial data, and this replaces the misleading error. |
| 2 | Single source for the schema | Hand-written `parseRecipe` in TypeScript; add `zod`; keep three copies | **Hand-written, no new dependency.** `validate:data` becomes a Vitest data test and `scripts/validate-recipes.mjs` is deleted. |
| 3 | Label for a recipe without a category | "Άλλο"; "Αγαπημένο της Οικογένειας" | **"Άλλο" everywhere.** No current recipe lacks a category, so nothing visible changes today. |
| 4 | Card colour | By category; by id hash; keep position-based | **By category**, so colours stay stable and mean something. |
| 5 | Order when `updatedAt` is equal | Title in Greek alphabetical order; id | **Title.** This visibly reorders the home page today, because every recipe has the same timestamp. |
| 6 | Search that ignores accents and final sigma | Yes; no | **Yes.** |
| 7 | Date format | `el-GR` in `Europe/Athens`, for example "10 Αυγ 2026"; keep the build machine's locale | **`el-GR` in `Europe/Athens`.** |
| 8 | Per-recipe `<title>`, description, and Open Graph image | Yes; no | **Yes.** |
| 9 | Unmerged branches | Merge, rebase, or drop each one before Phase 3 | **Settle `feature/reimagined-ui` before Phase 3. Treat `dual/lang` as reference only** and rebuild translations after this refactor, since it targets the old data model anyway. |
| 10 | Source of a recipe's id | Require `id` to equal the filename; derive the id from the filename and drop the field | **Require equality**, so each file stays self-describing. |

**Decided on 2026-09-15:**

- **1: Skip bad files with a warning**, not the recommendation. The build
  succeeds without the skipped recipe. `npm run validate:data`, which CI runs
  before every build, is what stops partial data from deploying.
- **2: Hand-written `parseRecipe`**, as recommended.
- **5: Title in Greek alphabetical order**, as recommended, then id, because
  several real recipes share a title.
- **10: Require `id` to equal the filename**, as recommended.

## 7. Checklist

Rules for every step:

- One step is one commit, small enough to review in a few minutes, and
  `npm run check` must pass.
- **Behavior: none** means existing test assertions pass unedited and the
  export snapshot from step 0.2 is identical.
- **Behavior: changes** means the step names the tests that change, and those
  edits land in the same commit.
- Steps are independent unless they list what they depend on.

### Phase 0: Safety Net and Doc Fixes, No App Code

- [ ] **0.1 Correct the "empty site" claim**
  - Change: fix the wording in `CLAUDE.md`, `CODEBASE_INDEX.md`, and both
    messages in `scripts/validate-recipes.mjs`.
  - Behavior: none. Fixes section 4.
  - Note: steps 2.3 and 2.4 made this moot. The validator script is deleted,
    and `CLAUDE.md` and `CODEBASE_INDEX.md` now describe the new skip behavior.
- [ ] **0.2 Add a static export snapshot check**
  - Change: a script that runs after `next build` inside `npm run check`. It
    writes each route's markup with `<script>` tags removed, and asserts one
    page per recipe file, that each recipe page shows its own title, and that
    every home page link points to a real recipe page.
  - Why: this is the safety net for Phase 4 and Phase 5, and it would have
    caught B5.
  - Behavior: none.
- [ ] **0.3 Settle the unmerged branches**
  - Change: decision 9. No code.

### Phase 1: Types and Pure Helpers, Lowest Risk

- [x] **1.1 Type-only imports and stale comment**
  - Change: use `import type` for `Recipe` in `lib/recipes.ts`,
    `recipe-card.tsx`, and `recipe-list.tsx`, and delete the stale comment in
    `getRecipeById`.
  - Behavior: none. Fixes D11.
- [x] **1.2 `withBasePath` helper**
  - Change: add `lib/base-path.ts` with unit tests and use it in the card and
    the detail page.
  - Behavior: none, the URLs are identical. Fixes X1.
- [x] **1.3 Shared labels and fallback constants**
  - Change: add `lib/recipe-view.ts` holding the "υλικά" label and both
    existing fallback values as named constants, and use them in all four
    places.
  - Behavior: none. The two fallbacks are unified later in 3.5. Fixes part of
    X2 and X5.
- [x] **1.4 Extract search and category logic**
  - Change: add `lib/recipe-search.ts` with `getCategories` and
    `filterRecipes`, lowercasing the query once. Write unit tests first that
    lock today's accent-sensitive matching, including "καρμπονάρα" finding
    nothing. `RecipeList` then calls these functions.
  - Behavior: none. Fixes X6.
- [x] **1.5 `RecipeSummary` type and mapper**
  - Change: add `RecipeSummary` to `types/recipe.ts` and `toRecipeSummary` to
    `lib/recipe-view.ts`, with unit tests. The summary holds id, title,
    description, category, image, prep time, servings, ingredients for
    search, and whether a memory exists. Nothing uses it yet.
  - Behavior: none. Prepares D1 and T5.
- [x] **1.6 Extract the sort comparator**
  - Change: move the comparator into `compareRecipes` in
    `lib/recipe-view.ts` with identical semantics, including no tie-break, and
    have the loader use it.
  - Behavior: none. Prepares D7.
- [x] **1.7 `parseRecipe` schema**
  - Change: add `lib/recipe-schema.ts` with `parseRecipe(value, source)` and
    `RecipeDataError`, enforcing the same rules as
    `scripts/validate-recipes.mjs`, with unit tests. Nothing uses it yet.
  - Behavior: none. Prepares X3 and D4.

### Phase 2: Server Data Layer

- [x] **2.1 `server-only` guard**
  - Change: add the `server-only` dependency and import it in
    `lib/recipes.ts`. Alias `server-only` to an empty stub in
    `vitest.config.mts`, because the real package throws outside Next's
    server build.
  - Behavior: none at runtime. Importing the loader from client code becomes
    a clear build error. Fixes D2.
- [x] **2.2 Loader internals and folder injection**
  - Change: add `createRecipeStore(dir)` and keep the three exported functions
    bound to `data/recipes`, resolved when called. Share one `readRecipeFile`
    helper. Add `getRecipeIds()`, implemented for now as the ids from
    `getAllRecipes()` so mismatched files behave exactly as before.
  - Behavior: none. The test helper switches from faking `cwd` to calling
    `createRecipeStore` with the temp folder, and assertions stay unedited.
    Fixes D5 and X4.
- [x] **2.3 Replace the validator script** (depends on 1.7 and decision 2)
  - Change: move the real-data checks into `lib/recipes.data.test.ts` using
    `parseRecipe`, keep the check that each image exists, point
    `validate:data` at that file, and delete `scripts/validate-recipes.mjs`
    and the duplicate `ShapeSpec`.
  - Behavior: tooling only. The same data problems are still reported.
    Fixes X3.
- [x] **2.4 Validate in the loader and fail loudly** (depends on 1.7, 2.2, and
  decision 1)
  - Change: the loader runs `parseRecipe` on every file. `getAllRecipes`
    throws a `RecipeDataError` naming the file. `getRecipeById` still returns
    `undefined` when the file or folder is missing, but throws for an invalid
    file.
  - Behavior: changes. A bad file fails the build with a clear message.
  - Tests to update in `lib/recipes.test.ts`: every test in both "missing or
    invalid data" groups, except the two `getRecipeById` tests for a missing
    file and a missing folder. Also "does not validate shape" and "does not
    throw when updatedAt is missing or unparseable".
  - Fixes B6, D3, D4, and T3.
  - As built, following decision 1: `getAllRecipes` and `getRecipeById` skip
    an unreadable, unparseable, or invalid file with a `console.warn` naming
    the file and each problem, instead of throwing. The build succeeds without
    that recipe. A missing `data/recipes` folder still logs an error and
    returns `[]`. The tests listed above were updated to assert skipping and
    warnings.
- [x] **2.5 Require id to equal filename** (depends on 2.4 and decision 10)
  - Change: the loader rejects a file whose `id` differs from its filename,
    which lets `getRecipeIds()` read filenames only. Drop the optional
    chaining on `description` in search, since the field is now guaranteed.
  - Behavior: changes. A mismatch fails the build instead of publishing a
    broken link.
  - Tests to update: "does not check that the id inside the file matches the
    requested id".
  - Fixes B5, T1, and T4.
  - As built, following decision 1: a mismatched file is skipped with a
    warning, so no link points to a missing page. `getRecipeIds()` still
    returns the ids of the loaded recipes rather than bare filenames, because
    listing filenames would create pages for skipped files. The id check is
    `parseRecipe`'s `expectedId` option, which the data test uses too.
- [x] **2.6 Reject ids that are not slugs**
  - Change: `getRecipeById` returns `undefined` for any id that isn't a
    lowercase, hyphenated slug.
  - Behavior: changes only for ids such as `../outside`.
  - Tests to update: "does not sanitize ids".
  - Fixes D6.
- [x] **2.7 Deterministic order** (depends on 1.6 and decision 5)
  - Change: `compareRecipes` breaks ties by title using Greek collation.
    As built, it then breaks ties by id, because several real recipes share a
    title, for example three called "Έλα μου ντε???".
  - Behavior: changes. The home page order changes today.
  - Tests: add a tie-break test and update the comment on the real-data order
    test.
  - Fixes D7.

### Phase 3: Client and Shared Components

- [ ] **3.1 Card accessibility and image loading**
  - Change: the decorative card image gets `alt=""`, `loading="lazy"`, and
    `decoding="async"`, and the card title becomes an `h3`.
  - Behavior: no visual change, but screen reader output and image loading
    change. Fixes part of B7, and D10.
- [ ] **3.2 Explicit checks for optional fields**
  - Change: replace `{recipe.servings && …}` and similar patterns with
    explicit checks.
  - Behavior: none for current data. Fixes T2.
- [ ] **3.3 Search input styling**
  - Change: replace the inline style with Tailwind classes, then check text
    colour in iOS Safari and with browser autofill.
  - Behavior: should look identical, and needs a manual visual check.
    Fixes D9.
- [ ] **3.4 Filter accessibility**
  - Change: add `aria-pressed` to the category buttons and a polite live
    region that announces the result count.
  - Behavior: no visual change. Fixes part of B7.
- [ ] **3.5 One category fallback** (depends on 1.3 and decision 3)
  - Change: a single `categoryLabel(recipe)` used by the card, the detail
    page, and the filter.
  - Behavior: changes only for uncategorized recipes, and there are none
    today. Fixes X2.
- [ ] **3.6 `CategoryBadge` component**
  - Change: extract the category pill shared by the card and the detail page.
  - Behavior: none. Fixes the repeated markup in X2.
- [ ] **3.7 Send summaries to the client** (depends on 1.4 and 1.5)
  - Change: `app/page.tsx` maps recipes with `toRecipeSummary`, and
    `RecipeList` and `RecipeCard` take `RecipeSummary`. Rename the
    `initialRecipes` prop to `recipes`.
  - Behavior: no visual change. Steps and memory stories disappear from
    `out/index.html`, and searching by ingredient still works.
  - Fixes D1 and T5.
- [ ] **3.8 Stable card colour** (decision 4)
  - Change: derive the gradient from the category and remove the `index`
    prop.
  - Behavior: changes. Colours differ from today but stay fixed while
    filtering. Fixes B4.
- [ ] **3.9 Search that ignores Greek accents** (depends on 1.4 and decision 6)
  - Change: `normalizeSearchText` lowercases with Greek rules, strips
    diacritics, and folds "ς" into "σ", for both the query and the recipe
    text.
  - Behavior: changes. Update the search tests from 1.4 so "καρμπονάρα"
    finds the carbonara. Fixes B1.

### Phase 4: Detail Page Decomposition

- [ ] **4.1 `StatTile` and `RecipeStats`**
  - Change: replace the four repeated stat blocks with one component.
  - Behavior: none, confirmed with the export snapshot. Fixes X5 and part of
    D8.
- [ ] **4.2 Remaining detail sections**
  - Change: extract `RecipeHero`, `RecipeMemory`, `IngredientList`, and
    `StepList` into `components/recipe-detail/`.
  - Behavior: none, confirmed with the export snapshot. Fixes D8.
- [ ] **4.3 Greek date format** (decision 7)
  - Change: `formatRecipeDate` using `el-GR` and `Europe/Athens`, with a unit
    test.
  - Behavior: changes. "Aug 10, 2026" becomes "10 Αυγ 2026". Fixes B2.

### Phase 5: Page Routing, Highest Risk

- [ ] **5.1 Static params from ids** (depends on 2.2, ideally after 2.5)
  - Change: `generateStaticParams` uses `getRecipeIds()`, and the page exports
    `dynamicParams = false`.
  - Behavior: none. The export snapshot must list exactly the same routes.
- [ ] **5.2 Per-recipe metadata** (decision 8)
  - Change: `generateMetadata` sets the title, description, and Open Graph
    image. Set `metadataBase` so image URLs are absolute on GitHub Pages.
  - Behavior: changes. Every recipe page gets new `<head>` tags. Fixes B3.
- [ ] **5.3 One page props type**
  - Change: define the detail page's props in one place, so moving to the
    asynchronous `params` of Next 15 and later is a single edit.
  - Behavior: none. Prepares T6.

## 8. Verifying Pure Refactors

The characterization tests cover the loader, and the Phase 1 tests cover the
helpers. Components have no unit tests, so rendering is checked through the
static export:

1. Before a step, run `npm run build` and keep the snapshot from step 0.2.
2. Apply the step and build again.
3. Diff the two snapshots. For a step marked "Behavior: none", they must be
   identical.

The snapshot strips `<script>` tags because the embedded React Server
Components payload references webpack module ids, which change whenever a
component moves to a new file. Payload content changes, such as the smaller
home page from step 3.7, are checked directly instead.

## 9. Out of Scope

- **Upgrading to Next 15 or 16.** It is needed to fix the critical `next`
  security advisory and deserves its own plan. Step 5.3 prepares for it.
- **Translations** from `dual/lang` and **dark mode** from
  `feature/reimagined-ui`, beyond decision 9.
- **Caching file reads** with React `cache()`. The gain is negligible at 30
  recipes, and it would reverse the "no caching" characterization tests.
- **Structured values** for times, dates, and categories.
- **Component tests** with React Testing Library. The export snapshot covers
  rendering for now.
- **Replacing placeholder recipe content.**
