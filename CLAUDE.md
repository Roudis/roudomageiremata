# Roudomageirikes

Greek family-recipe journal. Next.js 14 App Router, React 18, TypeScript strict, Tailwind 3.
Built as a fully static export and hosted on GitHub Pages at https://roudis.github.io/roudomageiremata/.

For a file-by-file map see `CODEBASE_INDEX.md`. Keep it and this file current in the same change that makes them stale.

## Commands

```bash
npm run dev            # local dev server
npm run lint           # next lint
npm run typecheck      # tsc --noEmit
npm run validate:data  # validate every data/recipes/*.json file
npm run build          # static export to out/
npm run check          # all of the above except dev, in order; run before calling work done
npm run start          # serve out/ locally; `next start` does NOT work with static export
```

There is no test suite. `npm run check` is the definition of "not broken".

## Hard constraints

- **Static export only** (`output: "export"`). No API routes, route handlers, server actions, middleware, cookies/headers, ISR, or runtime file writes. Anything that needs a server at request time will break the deploy.
- **`next/image` optimization is off** (`images.unoptimized`). Existing code uses `<img>` with an eslint-disable line.
- **Base path**: on GitHub Actions the site is served under `/roudomageiremata`. `next/link` handles this automatically, but raw asset URLs such as `<img src>` must be prefixed with `process.env.NEXT_PUBLIC_BASE_PATH`. See `components/recipe-card.tsx`.
- The repo was renamed on GitHub from `roudomageirikes` to `roudomageiremata`. The `repoName` in `next.config.mjs` is correct. Do not "fix" it to match the local folder name.

## Recipe data

- One recipe per file: `data/recipes/<id>.json`. The filename must equal the `id` field. Ids are lowercase Greeklish slugs.
- Shape is `Recipe` in `types/recipe.ts`. If you change the shape, update `scripts/validate-recipes.mjs` too.
- Images live at `public/images/recipes/<id>.jpg` and are referenced as `"/images/recipes/<id>.jpg"`.
- `lib/recipes.ts` reads files at build time and **silently returns an empty list on any read or parse error**. A broken JSON file still builds and would deploy an empty site. Always run `npm run validate:data` after touching recipe data.
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

## Git workflow

- Pushing to `main` deploys to production immediately. **Never push to `main` directly.** Work on `develop` or a feature branch and open a PR into `main`.
- CI (`.github/workflows/ci.yml`) runs lint, typecheck, data validation, and build on every PR and non-main push.
- Commit messages use conventional prefixes: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.
- Keep commits small and focused so they are easy to review and revert.
