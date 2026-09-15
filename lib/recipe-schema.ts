import type { Memory, Recipe } from "@/types/recipe";

/**
 * Runtime validation for recipe data, enforcing the same rules as
 * scripts/validate-recipes.mjs. Two of that script's checks need more than the
 * value and stay with the caller: that `id` equals the file name, and that
 * `imageUrl` exists under public/.
 */

export interface RecipeDataIssue {
  /** Path of the offending field, such as "servings" or "memory.title", or "" for the whole value. */
  field: string;
  message: string;
}

export class RecipeDataError extends Error {
  readonly source: string;
  readonly issues: readonly RecipeDataIssue[];

  constructor(source: string, issues: readonly RecipeDataIssue[]) {
    super(`${source} is not a valid recipe:\n${issues.map((issue) => `  - ${issue.message}`).join("\n")}`);
    this.name = "RecipeDataError";
    this.source = source;
    this.issues = issues;
  }
}

// `satisfies` makes `npm run typecheck` fail until these lists match types/recipe.ts.
const RECIPE_FIELDS = {
  id: true, title: true, description: true, ingredients: true, steps: true, memory: true, imageUrl: true,
  category: true, prepTime: true, cookTime: true, servings: true, createdAt: true, updatedAt: true,
} as const satisfies Record<keyof Recipe, true>;
const MEMORY_FIELDS = { title: true, story: true, date: true } as const satisfies Record<keyof Memory, true>;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isNonEmptyString = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.length > 0 && v.every(isNonEmptyString);
const isIsoDate = (v: unknown): v is string => typeof v === "string" && !Number.isNaN(Date.parse(v));

/** Pushes every problem with `value` onto `issues` and returns true only if there are none. */
function checkRecipe(value: unknown, issues: RecipeDataIssue[]): value is Recipe {
  const fail = (field: string, message: string) => issues.push({ field, message });

  if (!isPlainObject(value)) {
    fail("", "top-level value must be an object");
    return false;
  }

  for (const key of Object.keys(value)) {
    if (!Object.hasOwn(RECIPE_FIELDS, key)) {
      fail(key, `unknown field "${key}" (update types/recipe.ts and lib/recipe-schema.ts if intentional)`);
    }
  }

  if (typeof value.id !== "string" || !SLUG.test(value.id)) fail("id", "id must be a lowercase-hyphen slug");
  if (!isNonEmptyString(value.title)) fail("title", "title must be a non-empty string");
  if (!isNonEmptyString(value.description)) fail("description", "description must be a non-empty string");
  if (!isStringArray(value.ingredients)) fail("ingredients", "ingredients must be a non-empty array of non-empty strings");
  if (!isStringArray(value.steps)) fail("steps", "steps must be a non-empty array of non-empty strings");
  if (!isIsoDate(value.createdAt)) fail("createdAt", "createdAt must be an ISO date string");
  if (!isIsoDate(value.updatedAt)) fail("updatedAt", "updatedAt must be an ISO date string");

  for (const key of ["category", "prepTime", "cookTime"] as const) {
    if (key in value && !isNonEmptyString(value[key])) fail(key, `${key} must be a non-empty string when present`);
  }
  if ("servings" in value && !(Number.isInteger(value.servings) && Number(value.servings) > 0)) {
    fail("servings", "servings must be a positive integer when present");
  }

  if ("memory" in value) {
    const memory = value.memory;
    if (!isPlainObject(memory)) {
      fail("memory", "memory must be an object when present");
    } else {
      for (const key of Object.keys(memory)) {
        if (!Object.hasOwn(MEMORY_FIELDS, key)) fail(`memory.${key}`, `unknown memory field "${key}"`);
      }
      if (!isNonEmptyString(memory.title)) fail("memory.title", "memory.title must be a non-empty string");
      if (!isNonEmptyString(memory.story)) fail("memory.story", "memory.story must be a non-empty string");
      if ("date" in memory && !isNonEmptyString(memory.date)) {
        fail("memory.date", "memory.date must be a non-empty string when present");
      }
    }
  }

  if ("imageUrl" in value && !(isNonEmptyString(value.imageUrl) && value.imageUrl.startsWith("/"))) {
    fail("imageUrl", 'imageUrl must be a root-relative path like "/images/recipes/<id>.jpg"');
  }

  return issues.length === 0;
}

/**
 * Returns `value` typed as a Recipe if it passes every rule, or throws a
 * RecipeDataError listing all problems. `source` names the file in the message.
 */
export function parseRecipe(value: unknown, source: string): Recipe {
  const issues: RecipeDataIssue[] = [];
  if (!checkRecipe(value, issues)) throw new RecipeDataError(source, issues);
  return value;
}
