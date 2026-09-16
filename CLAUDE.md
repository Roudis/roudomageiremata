# Roudomageirikes

Greek family-recipe journal. Next.js 14 App Router, React 18, TypeScript strict, Tailwind 3.
Built as a fully static export and hosted on GitHub Pages at https://roudis.github.io/roudomageiremata/.

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
```

`npm run check` is the definition of "not broken".

## Tests

- Vitest, node environment, config in `vitest.config.mts`. Test files are `*.test.ts` next to the code they cover.
- `lib/recipes.test.ts` holds **characterization tests** for the recipe loader. They lock down current behavior, including quirks. Tests named "(current behavior)" document quirks, such as accent-sensitive search in `lib/recipe-search.test.ts`. If you change one of these behaviors on purpose, update the matching test in the same change and say so.
- Loader fixture tests write temp files and call `createRecipeStore(tempDir)`.
- `lib/recipes.data.test.ts` validates the real files in `data/recipes`, including that each image exists. `npm run validate:data` runs only that file.
- `RECIPE_FIELDS` in `lib/recipe-schema.ts` mirrors `types/recipe.ts`. Changing the `Recipe` type fails `npm run typecheck` until it is updated.

## Hard constraints

- **Static export only** (`output: "export"`). No API routes, route handlers, server actions, middleware, cookies/headers, ISR, or runtime file writes. Anything that needs a server at request time will break the deploy.
- **`next/image` optimization is off** (`images.unoptimized`). Existing code uses `<img>` with an eslint-disable line.
- **Base path**: on GitHub Actions the site is served under `/roudomageiremata`. `next/link` handles this automatically, but raw asset URLs such as `<img src>` must go through `withBasePath` from `lib/base-path.ts`.
- The repo was renamed on GitHub from `roudomageirikes` to `roudomageiremata`. The `repoName` in `next.config.mjs` is correct. Do not "fix" it to match the local folder name.

## Recipe data

- One recipe per file: `data/recipes/<id>.json`. The filename must equal the `id` field. Ids are lowercase Greeklish slugs.
- Shape is `Recipe` in `types/recipe.ts`. If you change the shape, update `parseRecipe` in `lib/recipe-schema.ts` too.
- Images live at `public/images/recipes/<id>.jpg` and are referenced as `"/images/recipes/<id>.jpg"`.
- `lib/recipes.ts` validates each file with `parseRecipe` at build time. **An invalid file, or one whose `id` differs from its filename, is skipped with a console warning, and the build still succeeds without that recipe.** `npm run validate:data` fails on such files and CI runs it before building, so always run it after touching recipe data.
- All user-facing copy is Greek (`<html lang="el">`). Keep new UI text in Greek.

## Do not run

- `populate.js` overwrites `data/recipes/` with random generated recipes.
- `download-all-images.js` rewrites `imageUrl` in every recipe file.
- `download-images.js` overwrites placeholder images in `public/images/recipes/`.

These are one-off seeding scripts kept for history. They are blocked in `.claude/settings.json`.

## Code conventions

- Server components by default. Add `"use client"` only for interactivity; current client components are `components/navbar.tsx`, `components/recipe-list.tsx`, and `app/template.tsx`.
- Styling is inline Tailwind classes. Shared utility classes `glass-panel` and `glass-card` live in `app/globals.css`.
- Icons come from `lucide-react`. Animations use `framer-motion` or the Tailwind keyframes in `tailwind.config.ts`.
- Import via the `@/` alias, which maps to the repo root.
- `lib/recipes.ts` imports `server-only`, so only server code in `app/` may import it. Client components get data as props. Pure helpers in `lib/` (`recipe-view`, `recipe-search`, `recipe-schema`, `base-path`) are safe on either side.

## Git workflow

- Pushing to `main` deploys to production immediately. **Never push to `main` directly.** Work on `develop` or a feature branch and open a PR into `main`.
- CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, data validation, and build on every PR and non-main push.
- `.github/workflows/changelog.yml` regenerates and commits `CHANGELOG.md` after every push. It is generated from commit history; never edit it manually.
- Commit messages use conventional prefixes: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.
- Keep commits small and focused so they are easy to review and revert.
