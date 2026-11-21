# Roudomageirikes

Greek family recipe book and journal: recipes, and the family stories that go with them. Next.js 14 App Router, React 18, TypeScript strict, Tailwind 3.
Built as a fully static export and hosted on GitHub Pages at https://roudis.github.io/roudomageiremata/.
Available in Greek (the original) plus English, Dutch, French, Swedish, Spanish, Italian, Romanian, Czech, Ukrainian, and Japanese.

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
npm run editor         # local recipe and story editor at http://127.0.0.1:3210; writes data/recipes + images
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
- **`next/image` optimization is off** (`images.unoptimized`). Use a plain `<img>`; `.eslintrc.json` turns off the `no-img-element` rule for that reason, so no disable comment is needed.
- **Base path**: on GitHub Actions the site is served under `/roudomageiremata`. `next/link` handles this automatically, but raw URLs such as `<img src>` or a plain `<a href>` must go through `withBasePath` from `lib/base-path.ts`. That includes Open Graph image and alternate-language URLs in metadata, which Next does not prefix; `metadataBase` in `app/_shared/root-layout.tsx` is the origin only.
- The repo was renamed on GitHub from `roudomageirikes` to `roudomageiremata`. The `repoName` in `next.config.mjs` is correct. Do not "fix" it to match the local folder name.

## Languages and routing

- The site has two halves, both in the navbar: recipes (`/recipes`, the searchable list, and `/recipes/<id>`) and stories (`/stories`, the journal, and `/stories/<id>`). The home page is the book's cover: a few stories, the chapters (categories), and the newest recipes. The interface calls categories "chapters"; the code and data still say `category`.
- Locales live in `lib/i18n/config.ts`: `el` (default), `en`, `nl`, `fr`, `sv`, `es`, `it`, `ro`, `cs`, `uk`, `ja`. Greek keeps the unprefixed URLs (`/`, `/recipes/<id>`); every other language is under its code (`/en`, `/en/recipes/<id>`). Build internal links with `localizePath(path, locale)`, never by hand.
- The recipe list's filters live in the address as `?q=`, `?category=` (the Greek category name), and `?tag=`, read after mount. Link to a filtered list with `localizePath(recipesPath({ category }), locale)`; `recipesPath` is in `lib/recipe-search.ts`.
- Two route trees render the same views from `app/_shared/`: `app/(el)/` for Greek and `app/[locale]/` for the rest. Each tree's layout renders its own `<html lang>` through `RootLayout`. `app/layout.tsx` only passes children through; it must exist, because without it Next 14 builds the default unstyled 404. `app/not-found.tsx` renders its own Greek shell.
- The language menu (`components/language-switcher.tsx`) uses plain `<a>` links, so switching language is a full page load. Keep it that way: a client-side navigation between the trees would have to swap `<html>` in place.
- Interface text lives in `lib/i18n/messages/<locale>.ts`. `el.ts` is the source and defines the `Messages` type, so a key missing from any language fails `npm run typecheck`. Add every new string to all eleven files. Counts use `{ one, other }` forms with `{count}`, rendered by `formatCount` in `lib/i18n/format.ts`; languages whose plural rules have a `few` category (Czech and Ukrainian for 2–4, Romanian for 0 and 2–19) add a `few` form, and `lib/i18n/messages.test.ts` fails if one is missing or added where the rules have none. Every other category gets `other`, so Ukrainian's `other` holds its 0 and 5–20 wording ("рецептів"), and Japanese, which has no plural, gives the same text for both forms.
- Server components call `getMessages(locale)`. Client components get only the message sections they render, as props.

## Recipe data

- Recipes are edited in the Strapi CMS, a separate project in the sibling folder `../roudomageiremata-cms` (run it with `npm run develop` there, admin at http://localhost:1337/admin). `npm run sync:strapi` writes the published recipes into `data/recipes/` and `public/images/recipes/`, changing only files whose content differs. Stale recipes are only listed; `--prune` deletes them. The build and deploy never contact Strapi; the committed JSON files are what ships. `STRAPI_URL` (default `http://localhost:1337`) and an optional `STRAPI_API_TOKEN` point the sync elsewhere.
- Strapi's `Recipe` content type (`src/api/recipe/`, components in `src/components/recipe/`) mirrors `types/recipe.ts`: `id` is `slug`, `ingredients`/`steps` are repeatable components, `memory` is a component, and `imageUrl` is the `image` media field. `preparations`, `tags`, `translations`, and the story's photo (`memory.imageUrl`) are not in Strapi yet: edit them in the JSON files, and the sync leaves them (and any other field Strapi doesn't manage) untouched. After changing the number of Greek ingredients or steps in Strapi, fix that recipe's translations before committing, or `validate:data` fails. If you change the shape, update the Strapi schema and `scripts/sync-from-strapi.mjs` too.
- Without Strapi, recipes and their stories are added and edited in the local editor, `npm run editor` (`editor/`). It writes `data/recipes/<id>.json`, `public/images/recipes/<id>.jpg`, and the story's `public/images/stories/<id>.jpg` directly, in the sync script's key order, after checking the recipe with `parseRecipe` and the story-link rule from `lib/recipes.data.test.ts`, so a saved recipe passes `validate:data`. It edits the Greek only and keeps `translations`; when a Greek change no longer fits them, it offers to drop the mismatched languages. A recipe made there is not in Strapi, so `sync:strapi` lists it as stale and `--prune` would delete it; and syncing a recipe that is in Strapi overwrites what the editor changed in its Strapi-managed fields.
- One recipe per file: `data/recipes/<id>.json`. The filename must equal the `id` field. Ids are lowercase Greeklish slugs.
- Shape is `Recipe` in `types/recipe.ts`. If you change the shape, update `parseRecipe` in `lib/recipe-schema.ts` too, plus the Strapi side above.
- A story is a recipe's `memory`: the journal lists every recipe that has one, and its story page is `/stories/<recipe id>`. There are no stories outside recipes yet.
- A memory's `story` is plain text, with a blank line between paragraphs. To link a recipe from a story, write `[[recipe-id]]`, which shows that recipe's title in the page's language, or `[[recipe-id|words to show]]` when the name has to fit the sentence. `lib/story-text.ts` parses it and `components/story-text.tsx` renders it; the recipe then lists the story under "also in these stories". Each translation carries its own links. `npm run validate:data` rejects a malformed link and a link to a recipe that does not exist. The Greek story is managed in Strapi, so type the link there too, or the next sync removes it from the Greek text. The syntax works in stories only, not in descriptions or steps.
- Other languages go in the recipe file's optional `translations` object, keyed by locale code. Each entry mirrors the Greek text one to one: the same number of ingredients and steps, the same `preparations` with the same number of steps each, and a `memory` (title and story only), `prepTime`, or `cookTime` exactly when the Greek has one. The memory date, image, servings, and category always come from the Greek. A language with no entry shows the Greek text with a notice. `localizeRecipe` in `lib/recipe-view.ts` merges a translation for display.
- When you change a recipe's Greek ingredients or steps, update or remove its translations in the same change: a count mismatch makes the whole file invalid. Changed wording with the same count is not detected, so update the translations too.
- `preparations` holds parts made separately before the main steps, such as the béchamel in `o-mousakas-tis-giagias`: each has a `title` and its own `steps`, and the recipe page shows them above the main steps.
- Category names are translated in `data/categories.json`, keyed by the Greek category name. `category` stays Greek everywhere in the data because filtering and the dot colours key on it. `npm run validate:data` fails when a key there matches no recipe's category, which usually means a typo or a rename.
- Tags come from the fixed list `TAG_NAMES` in `lib/tags.ts`, which names each tag in all eleven languages; a recipe's `tags` holds ids such as `"vegan"` or `"beef"`. List only the most specific tag: `TAG_IMPLIES` makes "vegan" count as vegetarian and "beef", "pork", "lamb", and "chicken" count as meat, for both search and the filter. `npm run validate:data` rejects unknown or repeated tags, a tag that another listed tag implies, and vegetarian recipes tagged with meat, fish, or seafood. To add a tag, add it to `TAG_NAMES` (and `TAG_IMPLIES` if it is a kind of something).
- Images live at `public/images/recipes/<id>.jpg` and are referenced as `"/images/recipes/<id>.jpg"`. That is the food. A story can have a photo of its own in `memory.imageUrl`, at `public/images/stories/<id>.jpg` (`"/images/stories/<id>.jpg"`): the story page opens with it, above the text, and shows the food photo only in the recipe banner below, so a story without its own photo has none at the top. The journal and the story's Open Graph image use `storyImageUrl` from `lib/recipe-view.ts`, which falls back to the food photo. The story photo is the same in every language (translations can't set it), `validate:data` checks that it exists, and it isn't in Strapi: `sync:strapi` keeps it from the file.
- `lib/recipes.ts` validates each file with `parseRecipe` at build time. **An invalid file, or one whose `id` differs from its filename, is skipped with a console warning, and the build still succeeds without that recipe.** `npm run validate:data` fails on such files and CI runs it before building, so always run it after touching recipe data.
- Greek is the site's original language. New UI text goes into every file in `lib/i18n/messages/`, never inline in a component. Format dates with `formatRecipeDate(iso, locale)` and `formatMemoryDate(date, locale)`, which fix the time zone (`Europe/Athens`) so they don't depend on the build machine.

## Do not run

- `populate.js` overwrites `data/recipes/` with random generated recipes.
- `download-all-images.js` rewrites `imageUrl` in every recipe file.
- `download-images.js` overwrites placeholder images in `public/images/recipes/`.

These are one-off seeding scripts kept for history. They are blocked in `.claude/settings.json`.

## Code conventions

- Server components by default. Add `"use client"` only for interactivity; current client components are `components/recipe-list.tsx` (with the `recipe-card.tsx` and `filter-chips.tsx` it renders), `components/nav-links.tsx`, `components/language-switcher.tsx`, and `app/_shared/page-transition.tsx`, which both trees' `template.tsx` re-export.
- Styling is inline Tailwind classes. The shared classes, in `app/globals.css`, are `page-container` (page width and side padding), `eyebrow` (the small green label above a title), and the keyboard focus ring: `focus-ring`, or `focus-ring-offset` for filled or bordered controls. Use those two on every link and button instead of repeating the `focus-visible:` utilities; on the aubergine `feature` band add `focus-visible:ring-feature-accent`, because the default ring is too dark to see there.
- Reuse the shared pieces before writing new markup: `ButtonLink` and `ArrowLink` (`components/button-link.tsx`), `PageHeader` and `SectionHeading` (`components/page-heading.tsx`), `BackLink` and `UntranslatedNotice` (`components/page-links.tsx`), and the story and recipe cards.
- A grid or flex child that holds a `truncate` line needs `min-w-0`, or a long recipe title widens the page past a phone's screen.
- Colours are theme tokens, not raw palette classes: `background`, `foreground`, `card`, `muted`, `border`, `primary` (aubergine purple), `secondary` (olive green), and `feature` (the family-story band). Each is an HSL variable in `app/globals.css` with a dark-mode value that follows the system setting, mapped in `tailwind.config.ts`. Purple and green are the family's favourite colours; keep new UI in that palette and check contrast in both modes.
- Fonts come from `next/font/google` in `app/_shared/root-layout.tsx`, which downloads them at build time: Commissioner (`font-sans`) and Literata (`font-serif`, used for headings). Any replacement must include the `greek`, `latin`, `latin-ext`, and `cyrillic` subsets: `latin-ext` holds the Romanian and Czech letters such as ș, ț, č, and ř, and `cyrillic` Ukrainian. Japanese is not in either font; its characters come from the system fonts listed after them in `tailwind.config.ts` (Hiragino, Yu Gothic, Meiryo, Noto CJK), and `app/globals.css` stops browsers slanting Japanese in the italic quotes.
- Icons come from `lucide-react`. Animations use `framer-motion`; `app/_shared/page-transition.tsx` wraps pages in `MotionConfig reducedMotion="user"`. The navbar sits outside it, so the language menu uses CSS transitions with `motion-reduce:` instead.
- Import via the `@/` alias, which maps to the repo root.
- `lib/recipes.ts`, `lib/categories.ts`, the `lib/json-file.ts` they read files through, and `lib/book.ts` import `server-only`, so only server code in `app/` may import them. Every page view calls `getBook(locale)` from `lib/book.ts`, which returns the recipes in that language, the stories, the recipe titles for story links, and the category names. Client components get data as props: the recipe list gets `RecipeSummary` objects via `toRecipeSummary`, not full recipes with every translation. Pure helpers in `lib/` (`recipe-view`, `recipe-search`, `recipe-schema`, `story-text`, `tags`, `base-path`, `i18n/config`, `i18n/format`) are safe on either side.
- Tailwind only scans `app/` and `components/`. Keep class strings there; `lib/` returns data such as a colour index, not class names.
- `editor/` is a local tool, not part of the site; nothing in `app/` or `components/` imports from it. It is a Node server (`server.ts`, started by `index.mjs`, which adds the `@/` alias) and a plain-JavaScript page in `editor/ui/` with no build step, styled with the site's colour tokens copied into `editor/ui/styles.css`. Node 22.18+ runs its TypeScript, and the `lib/` files it imports (`recipe-schema`, `story-text`, `tags`, `recipe-view`, `i18n/config`, `i18n/format`), by stripping types, so those files may only use syntax that strips away: no `enum`, `namespace`, or constructor parameter properties, and types imported with `import type` or an inline `type`. `editor/server.test.ts` starts the editor to catch a break; it is skipped on CI's Node 20, so run `npm run test` locally after changing those files.

## Git workflow

- Pushing to `main` deploys to production immediately. **Never push to `main` directly.** Work on `dev` or a feature branch and open a PR into `main`.
- CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, data validation, and build on every PR and non-main push.
- `.github/workflows/changelog.yml` regenerates and commits `CHANGELOG.md` after every push. It is generated from commit history; never edit it manually.
- Commit messages use conventional prefixes: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.
- Keep commits small and focused so they are easy to review and revert.
