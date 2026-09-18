# Roudomageirikes

Greek family-recipe journal. Next.js 14 App Router, React 18, TypeScript strict, Tailwind 3.
Built as a fully static export and hosted on GitHub Pages at https://roudis.github.io/roudomageiremata/.
Available in Greek (the original) plus English, Dutch, French, Swedish, Spanish, and Italian.

For a file-by-file map see `CODEBASE_INDEX.md`. Keep it and this file current in the same change that makes them stale.

## Commands

```bash
npm run dev            # local dev server
npm run lint           # next lint
npm run typecheck      # tsc --noEmit
npm run test           # Vitest unit tests (npm run test:watch for watch mode)
npm run validate:data  # validate every data/recipes/*.json file
npm run changelog      # regenerate CHANGELOG.md from Git history
npm run changelog:check # fail if CHANGELOG.md is stale
npm run build          # static export to out/
npm run check          # all of the above except dev, in order; run before calling work done
npm run start          # serve out/ locally; `next start` does NOT work with static export
npm run sync:strapi    # pull published recipes + images from Strapi (needs it running), then validate
```

`npm run check` is the definition of "not broken".

## Tests

- Vitest, node environment, config in `vitest.config.mts`. Test files are `*.test.ts` next to the code they cover.
- `lib/recipes.test.ts` holds **characterization tests** for the recipe loader. They lock down current behavior, including quirks. Tests named "(current behavior)" document quirks, such as accent-sensitive search in `lib/recipe-search.test.ts`. If you change one of these behaviors on purpose, update the matching test in the same change and say so.
- Loader fixture tests write temp files and call `createRecipeStore(tempDir)`.
- `lib/recipes.data.test.ts` validates the real files in `data/recipes` (translations included), that each image exists, and `data/categories.json`. `npm run validate:data` runs only that file.
- `RECIPE_FIELDS` in `lib/recipe-schema.ts` mirrors `types/recipe.ts`. Changing the `Recipe` type fails `npm run typecheck` until it is updated.

## Hard constraints

- **Static export only** (`output: "export"`). No API routes, route handlers, server actions, middleware, cookies/headers, ISR, or runtime file writes. Anything that needs a server at request time will break the deploy.
- **`next/image` optimization is off** (`images.unoptimized`). Existing code uses `<img>` with an eslint-disable line.
- **Base path**: on GitHub Actions the site is served under `/roudomageiremata`. `next/link` handles this automatically, but raw URLs such as `<img src>` or a plain `<a href>` must go through `withBasePath` from `lib/base-path.ts`. That includes Open Graph image and alternate-language URLs in metadata, which Next does not prefix; `metadataBase` in `app/_shared/root-layout.tsx` is the origin only.
- The repo was renamed on GitHub from `roudomageirikes` to `roudomageiremata`. The `repoName` in `next.config.mjs` is correct. Do not "fix" it to match the local folder name.

## Languages and routing

- Locales live in `lib/i18n/config.ts`: `el` (default), `en`, `nl`, `fr`, `sv`, `es`, `it`, `ro`, `cs`. Greek keeps the unprefixed URLs (`/`, `/recipes/<id>`); every other language is under its code (`/en`, `/en/recipes/<id>`). Build internal links with `localizePath(path, locale)`, never by hand.
- Two route trees render the same views from `app/_shared/`: `app/(el)/` for Greek and `app/[locale]/` for the rest. Each tree's layout renders its own `<html lang>` through `RootLayout`. `app/layout.tsx` only passes children through; it must exist, because without it Next 14 builds the default unstyled 404. `app/not-found.tsx` renders its own Greek shell.
- The language menu (`components/language-switcher.tsx`) uses plain `<a>` links, so switching language is a full page load. Keep it that way: a client-side navigation between the trees would have to swap `<html>` in place.
- Interface text lives in `lib/i18n/messages/<locale>.ts`. `el.ts` is the source and defines the `Messages` type, so a key missing from any language fails `npm run typecheck`. Add every new string to all nine files. Counts use `{ one, other }` forms with `{count}`, rendered by `formatCount` in `lib/i18n/format.ts`; languages whose plural rules have a `few` category (Czech for 2–4, Romanian for 0 and 2–19) add a `few` form, and `lib/i18n/messages.test.ts` fails if one is missing or added where the rules have none.
- Server components call `getMessages(locale)`. Client components get only the message sections they render, as props.

## Recipe data

- Recipes are edited in the Strapi CMS, a separate project in the sibling folder `../roudomageiremata-cms` (run it with `npm run develop` there, admin at http://localhost:1337/admin). `npm run sync:strapi` writes the published recipes into `data/recipes/` and `public/images/recipes/`, changing only files whose content differs. Stale recipes are only listed; `--prune` deletes them. The build and deploy never contact Strapi; the committed JSON files are what ships. `STRAPI_URL` (default `http://localhost:1337`) and an optional `STRAPI_API_TOKEN` point the sync elsewhere.
- Strapi's `Recipe` content type (`src/api/recipe/`, components in `src/components/recipe/`) mirrors `types/recipe.ts`: `id` is `slug`, `ingredients`/`steps` are repeatable components, `memory` is a component, and `imageUrl` is the `image` media field. `tags` and `translations` are not in Strapi yet: edit them in the JSON files, and the sync leaves them (and any other field Strapi doesn't manage) untouched. After changing the number of Greek ingredients or steps in Strapi, fix that recipe's translations before committing, or `validate:data` fails. If you change the shape, update the Strapi schema and `scripts/sync-from-strapi.mjs` too.
- One recipe per file: `data/recipes/<id>.json`. The filename must equal the `id` field. Ids are lowercase Greeklish slugs.
- Shape is `Recipe` in `types/recipe.ts`. If you change the shape, update `parseRecipe` in `lib/recipe-schema.ts` too, plus the Strapi side above.
- Other languages go in the recipe file's optional `translations` object, keyed by locale code. Each entry mirrors the Greek text one to one: the same number of ingredients and steps, and a `memory` (title and story only), `prepTime`, or `cookTime` exactly when the Greek has one. The memory date, image, servings, and category always come from the Greek. A language with no entry shows the Greek text with a notice. `localizeRecipe` in `lib/recipe-view.ts` merges a translation for display.
- When you change a recipe's Greek ingredients or steps, update or remove its translations in the same change: a count mismatch makes the whole file invalid. Changed wording with the same count is not detected, so update the translations too.
- Category names are translated in `data/categories.json`, keyed by the Greek category name. `category` stays Greek everywhere in the data because filtering and the dot colours key on it. `npm run validate:data` fails when a key there matches no recipe's category, which usually means a typo or a rename.
- Tags come from the fixed list `TAG_NAMES` in `lib/tags.ts`, which names each tag in all nine languages; a recipe's `tags` holds ids such as `"vegan"` or `"beef"`. List only the most specific tag: `TAG_IMPLIES` makes "vegan" count as vegetarian and "beef", "pork", "lamb", and "chicken" count as meat, for both search and the filter. `npm run validate:data` rejects unknown or repeated tags, a tag that another listed tag implies, and vegetarian recipes tagged with meat, fish, or seafood. To add a tag, add it to `TAG_NAMES` (and `TAG_IMPLIES` if it is a kind of something).
- Images live at `public/images/recipes/<id>.jpg` and are referenced as `"/images/recipes/<id>.jpg"`.
- `lib/recipes.ts` validates each file with `parseRecipe` at build time. **An invalid file, or one whose `id` differs from its filename, is skipped with a console warning, and the build still succeeds without that recipe.** `npm run validate:data` fails on such files and CI runs it before building, so always run it after touching recipe data.
- Greek is the site's original language. New UI text goes into every file in `lib/i18n/messages/`, never inline in a component. Format dates with `formatRecipeDate(iso, locale)` and `formatMemoryDate(date, locale)`, which fix the time zone (`Europe/Athens`) so they don't depend on the build machine.

## Do not run

- `populate.js` overwrites `data/recipes/` with random generated recipes.
- `download-all-images.js` rewrites `imageUrl` in every recipe file.
- `download-images.js` overwrites placeholder images in `public/images/recipes/`.

These are one-off seeding scripts kept for history. They are blocked in `.claude/settings.json`.

## Code conventions

- Server components by default. Add `"use client"` only for interactivity; current client components are `components/recipe-list.tsx` (with the `recipe-card.tsx` it renders), `components/language-switcher.tsx`, and `app/_shared/page-transition.tsx`, which both trees' `template.tsx` re-export.
- Styling is inline Tailwind classes. The only shared class is `page-container` (page width and side padding) in `app/globals.css`.
- Colours are theme tokens, not raw palette classes: `background`, `foreground`, `card`, `muted`, `border`, `primary` (aubergine purple), `secondary` (olive green), and `feature` (the family-story band). Each is an HSL variable in `app/globals.css` with a dark-mode value that follows the system setting, mapped in `tailwind.config.ts`. Purple and green are the family's favourite colours; keep new UI in that palette and check contrast in both modes.
- Fonts come from `next/font/google` in `app/_shared/root-layout.tsx`, which downloads them at build time: Commissioner (`font-sans`) and Literata (`font-serif`, used for headings). Any replacement must include the `greek`, `latin`, and `latin-ext` subsets: `latin-ext` holds the Romanian and Czech letters such as ș, ț, č, and ř.
- Icons come from `lucide-react`. Animations use `framer-motion`; `app/_shared/page-transition.tsx` wraps pages in `MotionConfig reducedMotion="user"`. The navbar sits outside it, so the language menu uses CSS transitions with `motion-reduce:` instead.
- Import via the `@/` alias, which maps to the repo root.
- `lib/recipes.ts` and `lib/categories.ts` import `server-only`, so only server code in `app/` may import them. Client components get data as props: the home page sends `RecipeSummary` objects via `toRecipeSummary(localizeRecipe(...))`, not full recipes with every translation. Pure helpers in `lib/` (`recipe-view`, `recipe-search`, `recipe-schema`, `tags`, `base-path`, `i18n/config`, `i18n/format`) are safe on either side.
- Tailwind only scans `app/` and `components/`. Keep class strings there; `lib/` returns data such as a colour index, not class names.

## Git workflow

- Pushing to `main` deploys to production immediately. **Never push to `main` directly.** Work on `develop` or a feature branch and open a PR into `main`.
- CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, data validation, and build on every PR and non-main push.
- `.github/workflows/changelog.yml` regenerates and commits `CHANGELOG.md` after every push. It is generated from commit history; never edit it manually.
- Commit messages use conventional prefixes: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.
- Keep commits small and focused so they are easy to review and revert.
