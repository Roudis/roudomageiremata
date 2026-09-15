#!/usr/bin/env node
// Validates every recipe in data/recipes/ against the Recipe shape in
// types/recipe.ts. lib/recipes.ts swallows read/parse errors and returns [],
// so a single broken file would otherwise build and deploy an empty site.
// Usage: node scripts/validate-recipes.mjs [recipesDir]

import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const recipesDir = path.resolve(root, process.argv[2] ?? "data/recipes");
const publicDir = path.join(root, "public");

const ALLOWED_KEYS = new Set([
  "id", "title", "description", "ingredients", "steps", "memory", "imageUrl",
  "category", "prepTime", "cookTime", "servings", "createdAt", "updatedAt",
]);
const MEMORY_KEYS = new Set(["title", "story", "date"]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const isStringArray = (v) => Array.isArray(v) && v.length > 0 && v.every(isNonEmptyString);
const isIsoDate = (v) => typeof v === "string" && !Number.isNaN(Date.parse(v));

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function validateRecipe(file) {
  const errors = [];
  const expectedId = file.replace(/\.json$/, "");
  let recipe;

  try {
    recipe = JSON.parse(await fs.readFile(path.join(recipesDir, file), "utf8"));
  } catch (err) {
    return [`invalid JSON: ${err.message}`];
  }
  if (recipe === null || typeof recipe !== "object" || Array.isArray(recipe)) {
    return ["top-level value must be an object"];
  }

  for (const key of Object.keys(recipe)) {
    if (!ALLOWED_KEYS.has(key)) errors.push(`unknown field "${key}" (update types/recipe.ts and this validator if intentional)`);
  }

  if (recipe.id !== expectedId) errors.push(`id "${recipe.id}" must match filename "${expectedId}"`);
  if (!SLUG.test(expectedId)) errors.push(`filename/id "${expectedId}" must be a lowercase-hyphen slug`);
  if (!isNonEmptyString(recipe.title)) errors.push("title must be a non-empty string");
  if (!isNonEmptyString(recipe.description)) errors.push("description must be a non-empty string");
  if (!isStringArray(recipe.ingredients)) errors.push("ingredients must be a non-empty array of non-empty strings");
  if (!isStringArray(recipe.steps)) errors.push("steps must be a non-empty array of non-empty strings");
  if (!isIsoDate(recipe.createdAt)) errors.push("createdAt must be an ISO date string");
  if (!isIsoDate(recipe.updatedAt)) errors.push("updatedAt must be an ISO date string");

  for (const key of ["category", "prepTime", "cookTime"]) {
    if (key in recipe && !isNonEmptyString(recipe[key])) errors.push(`${key} must be a non-empty string when present`);
  }
  if ("servings" in recipe && !(Number.isInteger(recipe.servings) && recipe.servings > 0)) {
    errors.push("servings must be a positive integer when present");
  }

  if ("memory" in recipe) {
    const m = recipe.memory;
    if (m === null || typeof m !== "object" || Array.isArray(m)) {
      errors.push("memory must be an object when present");
    } else {
      for (const key of Object.keys(m)) {
        if (!MEMORY_KEYS.has(key)) errors.push(`unknown memory field "${key}"`);
      }
      if (!isNonEmptyString(m.title)) errors.push("memory.title must be a non-empty string");
      if (!isNonEmptyString(m.story)) errors.push("memory.story must be a non-empty string");
      if ("date" in m && !isNonEmptyString(m.date)) errors.push("memory.date must be a non-empty string when present");
    }
  }

  if ("imageUrl" in recipe) {
    if (!isNonEmptyString(recipe.imageUrl) || !recipe.imageUrl.startsWith("/")) {
      errors.push('imageUrl must be a root-relative path like "/images/recipes/<id>.jpg"');
    } else if (!(await fileExists(path.join(publicDir, recipe.imageUrl)))) {
      errors.push(`imageUrl "${recipe.imageUrl}" does not exist under public/`);
    }
  }

  return errors;
}

async function main() {
  let files;
  try {
    files = (await fs.readdir(recipesDir)).filter((f) => f.endsWith(".json")).sort();
  } catch (err) {
    console.error(`✖ Cannot read recipes directory ${recipesDir}: ${err.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`✖ No recipe files found in ${recipesDir}; the site would build with zero recipes.`);
    process.exit(1);
  }

  let failed = 0;
  for (const file of files) {
    const errors = await validateRecipe(file);
    if (errors.length > 0) {
      failed++;
      console.error(`✖ ${file}`);
      for (const e of errors) console.error(`    - ${e}`);
    }
  }

  if (failed > 0) {
    console.error(`\n✖ ${failed} of ${files.length} recipe files failed validation.`);
    process.exit(1);
  }
  console.log(`✔ ${files.length} recipe files are valid.`);
}

main();
