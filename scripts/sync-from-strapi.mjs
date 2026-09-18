#!/usr/bin/env node
// Pulls published recipes from the Strapi CMS (the roudomageiremata-cms
// project) into data/recipes/<id>.json and public/images/recipes/, so the
// static build keeps reading local files and never needs Strapi at deploy
// time. Files are only rewritten when their content changed. Fields Strapi
// doesn't hold, such as tags and translations, are kept from the existing file.
//
// Recipes that exist here but not in Strapi are listed; pass --prune to delete
// them and their images.
//
// Usage: node scripts/sync-from-strapi.mjs [--prune]
// Env:   STRAPI_URL (default http://localhost:1337), STRAPI_API_TOKEN (optional)

import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const recipesDir = path.join(root, "data", "recipes");
const imagesDir = path.join(root, "public", "images", "recipes");
const strapiUrl = (process.env.STRAPI_URL ?? "http://localhost:1337").replace(/\/$/, "");
const token = process.env.STRAPI_API_TOKEN;
const prune = process.argv.includes("--prune");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PAGE_SIZE = 100;

async function strapiFetch(url) {
  let res;
  try {
    res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  } catch (err) {
    throw new Error(`Cannot reach Strapi at ${strapiUrl} (${err.cause?.code ?? err.message}). Is "npm run develop" running in roudomageiremata-cms?`);
  }
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
  return res;
}

async function fetchAllRecipes() {
  const recipes = [];
  for (let page = 1; ; page++) {
    const query = new URLSearchParams({
      populate: "*",
      sort: "slug",
      "pagination[page]": String(page),
      "pagination[pageSize]": String(PAGE_SIZE),
    });
    const body = await (await strapiFetch(`${strapiUrl}/api/recipes?${query}`)).json();
    recipes.push(...body.data);
    if (page >= body.meta.pagination.pageCount) return recipes;
  }
}

// Key order of the recipe files, so unchanged recipes produce no diff. Strapi
// holds the Greek text, image, and timestamps; tags and translations are only
// in the files, so they are kept from the existing file.
const KEY_ORDER = [
  "id", "title", "description", "ingredients", "steps", "memory", "category", "tags",
  "imageUrl", "prepTime", "cookTime", "servings", "createdAt", "updatedAt", "translations",
];

function toRecipe(entry, imageUrl, existing) {
  const fromStrapi = {
    id: entry.slug,
    title: entry.title,
    description: entry.description,
    ingredients: entry.ingredients.map((item) => item.name),
    steps: entry.steps.map((item) => item.text),
    memory: entry.memory
      ? { title: entry.memory.title, story: entry.memory.story, ...(entry.memory.date && { date: entry.memory.date }) }
      : undefined,
    category: entry.category || undefined,
    imageUrl,
    prepTime: entry.prepTime || undefined,
    cookTime: entry.cookTime || undefined,
    servings: entry.servings ?? undefined,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
  const merged = { ...existing, ...fromStrapi };
  const recipe = {};
  for (const key of [...KEY_ORDER, ...Object.keys(merged)]) {
    if (merged[key] !== undefined && !(key in recipe)) recipe[key] = merged[key];
  }
  return recipe;
}

async function readIfExists(filePath, encoding) {
  try {
    return await fs.readFile(filePath, encoding);
  } catch {
    return undefined;
  }
}

// Writes the file only if its content differs. Returns true if it wrote.
async function writeIfChanged(filePath, content) {
  const current = await readIfExists(filePath);
  if (current && Buffer.compare(current, Buffer.from(content)) === 0) return false;
  await fs.writeFile(filePath, content);
  return true;
}

async function syncImage(slug, image) {
  const ext = image.ext.toLowerCase();
  const imageUrl = `/images/recipes/${slug}${ext}`;
  const source = image.url.startsWith("/") ? `${strapiUrl}${image.url}` : image.url;
  const bytes = Buffer.from(await (await strapiFetch(source)).arrayBuffer());
  const changed = await writeIfChanged(path.join(root, "public", imageUrl), bytes);
  return { imageUrl, changed };
}

async function main() {
  const entries = await fetchAllRecipes();
  if (entries.length === 0) {
    throw new Error(`Strapi at ${strapiUrl} returned no published recipes; refusing to sync an empty site.`);
  }

  await fs.mkdir(recipesDir, { recursive: true });
  await fs.mkdir(imagesDir, { recursive: true });

  const synced = new Set();
  let written = 0;
  let imagesWritten = 0;
  for (const entry of entries) {
    if (!SLUG.test(entry.slug ?? "")) throw new Error(`Recipe "${entry.title}" has an invalid slug "${entry.slug}".`);

    const image = entry.image ? await syncImage(entry.slug, entry.image) : undefined;
    if (image?.changed) imagesWritten++;

    const recipePath = path.join(recipesDir, `${entry.slug}.json`);
    const existing = JSON.parse((await readIfExists(recipePath, "utf8")) ?? "{}");
    const previousImageUrl = existing.imageUrl;
    const json = JSON.stringify(toRecipe(entry, image?.imageUrl, existing), null, 2);
    if (await writeIfChanged(recipePath, json)) {
      written++;
      console.log(`✎ ${entry.slug}`);
    }
    // The image was removed in Strapi or replaced with one of another type.
    if (previousImageUrl?.startsWith("/images/recipes/") && previousImageUrl !== image?.imageUrl) {
      await fs.rm(path.join(root, "public", previousImageUrl), { force: true });
    }
    synced.add(`${entry.slug}.json`);
  }

  const stale = (await fs.readdir(recipesDir)).filter((f) => f.endsWith(".json") && !synced.has(f)).sort();
  for (const file of stale) {
    if (!prune) {
      console.warn(`! ${file} is not published in Strapi (run with --prune to delete it)`);
      continue;
    }
    const recipe = JSON.parse((await readIfExists(path.join(recipesDir, file), "utf8")) ?? "{}");
    await fs.rm(path.join(recipesDir, file));
    if (typeof recipe.imageUrl === "string" && recipe.imageUrl.startsWith("/images/recipes/")) {
      await fs.rm(path.join(root, "public", recipe.imageUrl), { force: true });
    }
    console.log(`✖ ${file} deleted`);
  }

  console.log(
    `\n✔ ${entries.length} recipes from ${strapiUrl}: ${written} recipe files and ${imagesWritten} images updated` +
      (stale.length ? `, ${stale.length} ${prune ? "deleted" : "not in Strapi"}` : "") +
      ".",
  );
}

main().catch((err) => {
  console.error(`✖ ${err.message}`);
  process.exit(1);
});
