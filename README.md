# Roudomageirikes

A Next.js 14 family recipe book and journal: the recipes, and the stories attached to them.

Live site: https://roudis.github.io/roudomageiremata/

## Features
- Browse the recipes at `/recipes`, with search, chapters (one per family cook),
  and tags such as vegan, beef, or pasta. The filters are kept in the address, so
  they survive opening a recipe and coming back
- Read the family stories in the journal at `/stories`. A recipe named in a story
  is a link to that recipe, and the recipe lists the stories that mention it
- View a recipe with its ingredients, steps, and the start of its story
- Read the site and every recipe in Greek (the original), English, Dutch,
  French, Swedish, Spanish, Italian, Romanian, Czech, Ukrainian, or Japanese,
  using the language menu at the top right. Greek pages keep their URLs; the
  others live under `/en`, `/nl`, `/fr`, `/sv`, `/es`, `/it`, `/ro`, `/cs`,
  `/uk`, and `/ja`
- Recipe data is baked into the site at build time from one JSON file per recipe
  in [`data/recipes/`](data/recipes). It is read-only in production; see
  [Static site & GitHub Pages](#static-site--github-pages).

## Run locally
```bash
npm install
npm run dev
```

## Checks
```bash
npm run lint           # ESLint
npm run typecheck      # TypeScript
npm run test           # Vitest unit tests
npm run validate:data  # validate every recipe JSON file
npm run build          # static export
npm run check          # all of the above
```

The same checks run in CI on every pull request and before each deploy.

## Changelog

[CHANGELOG.md](CHANGELOG.md) is generated from the Git commit history. The
[changelog workflow](.github/workflows/changelog.yml) regenerates and commits it
after every push. To regenerate it locally, run:

```bash
npm run changelog
```

## Adding or editing a recipe

The Greek text, photo, and timestamps of each recipe are managed in the Strapi CMS
(a separate project, `roudomageiremata-cms`) and pulled into this repository with
`npm run sync:strapi`. The sync overwrites those fields, so edit them in Strapi;
it keeps `preparations`, `tags`, and `translations`, which live only in the JSON
files. [CODEBASE_INDEX.md](CODEBASE_INDEX.md) has the full workflow. Without
Strapi, the files can be edited by hand:

1. Create or edit `data/recipes/<id>.json`. The filename must match the `id`
   field. The shape is defined in [`types/recipe.ts`](types/recipe.ts).
2. Put the image at `public/images/recipes/<id>.jpg` and set
   `"imageUrl": "/images/recipes/<id>.jpg"`.
3. Add the other languages under `"translations"`, one entry per language code
   (`en`, `nl`, `fr`, `sv`, `es`, `it`, `ro`, `cs`, `uk`, `ja`) with the same number of ingredients and
   steps as the Greek. A language you leave out shows the Greek text with a
   short notice. When you change the Greek ingredients or steps, update the
   translations too, or `npm run validate:data` will fail.
4. For a new category, add its names in the other languages to
   [`data/categories.json`](data/categories.json).
5. Add `"tags"`, such as `["beef", "pasta"]`, using the ids in
   [`lib/tags.ts`](lib/tags.ts). List only the most specific one: a vegan recipe
   is found under "vegetarian" too, and a beef one under "meat".
6. To link a recipe from a story, write `[[recipe-id]]` in the memory's `story`
   to show that recipe's title, or `[[recipe-id|words to show]]` to choose the
   words, as in `δίπλα στον [[o-mousakas-tis-giagias|μουσακά της γιαγιάς]]`. The
   id is the recipe's file name without `.json`. Leave a blank line between
   paragraphs. The Greek story lives in Strapi, so add the link there as well.
7. Run `npm run validate:data`, then open a pull request into `main`.

## Static site & GitHub Pages

This app is built as a fully static site (`next build` with `output: "export"`)
so it can be hosted on GitHub Pages, which only serves static files. There's no
server at runtime. Recipes are read from `data/recipes/*.json` at build time
and rendered to static HTML. There are no API routes or in-app create/edit
forms, because those would require a writable server.

Publishing is automatic. Merging to `main` runs the
[deploy workflow](.github/workflows/deploy.yml), which checks, builds, and
publishes the site. **Settings → Pages → Source** must be set to
**GitHub Actions**.

To preview the production build locally:
```bash
npm run build
npm run start   # serves the generated out/ folder
```

## Developing with Claude Code
Project guidance for AI coding agents lives in [`CLAUDE.md`](CLAUDE.md), and
shared tool permissions live in [`.claude/settings.json`](.claude/settings.json).
