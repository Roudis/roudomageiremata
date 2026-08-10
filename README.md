# Roudomageirikes

A Next.js 14 recipe journal for preserving family recipes and the memories attached to them.

## Features
- Browse a warm, family-style recipe collection
- View recipe details with ingredients, steps, and memory/story notes
- Data is baked into the site at build time from `data/recipes.json` (read-only
  in production — see [Static site & GitHub Pages](#static-site--github-pages))

## Run locally
```bash
npm install
npm run dev
```

## Static site & GitHub Pages

This app is built as a fully static site (`next build` with `output: "export"`)
so it can be hosted on GitHub Pages, which only serves static files. Because of
that, there's no server at runtime — recipes are read from
[`data/recipes.json`](data/recipes.json) at build time and rendered to static
HTML. **Adding, editing, or deleting recipes now happens by editing
`data/recipes.json` and re-deploying** (the old API routes and recipe
create/edit forms were removed since they required a writable server).

To publish:
1. In the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Push to `main` — the [deploy workflow](.github/workflows/deploy.yml) builds
   the site and publishes it automatically to
   `https://<your-username>.github.io/roudomageirikes/`.

To preview the production build locally:
```bash
npm run build
npm run start   # serves the generated out/ folder
```
