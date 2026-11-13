/**
 * The recipe editor's rules for turning what its form sends into a recipe file,
 * kept free of file access so recipe-input.test.ts can cover them. server.ts
 * does the reading and writing.
 *
 * Validation is the site's own: parseRecipe from lib/recipe-schema.ts plus the
 * story-link check from lib/recipes.data.test.ts, so a recipe the editor saves
 * passes `npm run validate:data`.
 */
import type { Recipe } from "@/types/recipe";
import { RecipeDataError, parseRecipe, type RecipeDataIssue } from "@/lib/recipe-schema";
import { storyMentions } from "@/lib/story-text";

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The editor form's fields after `readForm` has tidied them: trimmed, with empty rows left out. */
export interface RecipeForm {
  title: string;
  description: string;
  category: string;
  tags: string[];
  prepTime: string;
  cookTime: string;
  /** Undefined when left empty; whatever was typed otherwise, so validation can reject a bad value. */
  servings: number | undefined;
  ingredients: string[];
  steps: string[];
  preparations: { title: string; steps: string[] }[];
  /** Undefined when the recipe has no story. An empty `date` means none. */
  memory: { title: string; story: string; date: string } | undefined;
}

/**
 * The key order of a recipe file. It is the order scripts/sync-from-strapi.mjs
 * writes, so a later sync leaves an editor-made file unchanged; the test checks
 * that the two lists agree.
 */
export const KEY_ORDER = [
  "id", "title", "description", "ingredients", "steps", "preparations", "memory", "category", "tags",
  "imageUrl", "prepTime", "cookTime", "servings", "createdAt", "updatedAt", "translations",
] as const satisfies readonly (keyof Recipe)[];

/** One line of text: trimmed, with any run of whitespace, line breaks included, as one space. */
function line(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

/** The non-empty lines of a list. */
function lines(value: unknown): string[] {
  return Array.isArray(value) ? value.map(line).filter((text) => text !== "") : [];
}

/** A story: paragraphs split by exactly one blank line, no spaces at line ends, "\n" line breaks. */
function storyText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function servings(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  const typed = line(value);
  return typed === "" ? undefined : Number(typed);
}

/**
 * The form as the page sent it, tidied. Anything missing or of the wrong type
 * reads as empty, so validation then names the field.
 */
export function readForm(value: unknown): RecipeForm {
  const form = isObject(value) ? value : {};
  const memory = isObject(form.memory)
    ? { title: line(form.memory.title), story: storyText(form.memory.story), date: line(form.memory.date) }
    : undefined;
  const preparations = Array.isArray(form.preparations)
    ? form.preparations
        .filter(isObject)
        .map((preparation) => ({ title: line(preparation.title), steps: lines(preparation.steps) }))
        .filter((preparation) => preparation.title !== "" || preparation.steps.length > 0)
    : [];

  return {
    title: line(form.title),
    description: line(form.description),
    category: line(form.category),
    tags: lines(form.tags),
    prepTime: line(form.prepTime),
    cookTime: line(form.cookTime),
    servings: servings(form.servings),
    ingredients: lines(form.ingredients),
    steps: lines(form.steps),
    preparations,
    memory: memory && (memory.title !== "" || memory.story !== "") ? memory : undefined,
  };
}

/** The keys in KEY_ORDER, then any others in their own order, leaving out undefined values. */
function orderKeys(recipe: Json): Json {
  const ordered: Json = {};
  for (const key of [...KEY_ORDER, ...Object.keys(recipe)]) {
    if (recipe[key] !== undefined && !(key in ordered)) ordered[key] = recipe[key];
  }
  return ordered;
}

export interface BuildOptions {
  id: string;
  /**
   * The file being edited, as read from disk. Its `createdAt`, `translations`,
   * and any field the form doesn't show are kept.
   */
  existing?: Json;
  /** The photo's path, such as "/images/recipes/<id>.jpg", or undefined for none. */
  imageUrl: string | undefined;
  now: Date;
}

/**
 * The recipe file for `form`: the form's fields over the existing file, in
 * KEY_ORDER, with `updatedAt` set to `now` (and `createdAt` too for a new recipe).
 * An optional field left empty is removed.
 */
export function buildRecipe(form: RecipeForm, { id, existing = {}, imageUrl, now }: BuildOptions): Json {
  const stamp = now.toISOString();
  const { memory } = form;
  return orderKeys({
    ...existing,
    id,
    title: form.title,
    description: form.description,
    ingredients: form.ingredients,
    steps: form.steps,
    preparations: form.preparations.length > 0 ? form.preparations : undefined,
    memory: memory && { title: memory.title, story: memory.story, ...(memory.date !== "" && { date: memory.date }) },
    category: form.category || undefined,
    tags: form.tags.length > 0 ? form.tags : undefined,
    imageUrl,
    prepTime: form.prepTime || undefined,
    cookTime: form.cookTime || undefined,
    servings: form.servings,
    createdAt: typeof existing.createdAt === "string" ? existing.createdAt : stamp,
    updatedAt: stamp,
  });
}

/** The Greek story and each translated one, with the field path validation messages use. */
function stories(recipe: Json): [field: string, story: string][] {
  const found: [string, string][] = [];
  if (isObject(recipe.memory) && typeof recipe.memory.story === "string") {
    found.push(["memory.story", recipe.memory.story]);
  }
  if (isObject(recipe.translations)) {
    for (const [locale, translation] of Object.entries(recipe.translations)) {
      if (isObject(translation) && isObject(translation.memory) && typeof translation.memory.story === "string") {
        found.push([`translations.${locale}.memory.story`, translation.memory.story]);
      }
    }
  }
  return found;
}

/**
 * Every problem `npm run validate:data` would report for this recipe, apart from
 * whether its photo exists, which needs the disk: the schema rules, and story
 * links to recipes that don't exist. `recipeIds` holds the ids of the recipe
 * files on disk; a story may also link to its own recipe.
 */
export function recipeIssues(recipe: Json, id: string, recipeIds: ReadonlySet<string>): RecipeDataIssue[] {
  const issues: RecipeDataIssue[] = [];
  try {
    parseRecipe(recipe, `data/recipes/${id}.json`, { expectedId: id });
  } catch (error) {
    if (!(error instanceof RecipeDataError)) throw error;
    issues.push(...error.issues);
  }

  for (const [field, story] of stories(recipe)) {
    for (const mention of storyMentions(story)) {
      if (mention !== id && !recipeIds.has(mention)) {
        issues.push({ field, message: `${field} links to [[${mention}]], but there is no recipe with that id` });
      }
    }
  }
  return issues;
}

const TRANSLATION_FIELD = /^translations\.([^.]+)(?:\.|$)/;

/** The languages whose translation has a problem in `issues`, sorted. */
export function brokenTranslations(issues: readonly RecipeDataIssue[]): string[] {
  const locales = new Set(issues.flatMap((issue) => TRANSLATION_FIELD.exec(issue.field)?.[1] ?? []));
  return Array.from(locales).sort();
}

/**
 * The recipe without the translations that have a problem in `issues`, such as
 * a different number of steps from the Greek. Those languages then show the
 * Greek text with a notice, as for a recipe never translated.
 */
export function dropBrokenTranslations(
  recipe: Json,
  issues: readonly RecipeDataIssue[],
): { recipe: Json; dropped: string[] } {
  const dropped = brokenTranslations(issues);
  if (dropped.length === 0 || !isObject(recipe.translations)) return { recipe, dropped: [] };

  const kept = Object.entries(recipe.translations).filter(([locale]) => !dropped.includes(locale));
  const next: Json = { ...recipe, translations: kept.length > 0 ? Object.fromEntries(kept) : undefined };
  return { recipe: orderKeys(next), dropped };
}

/** What a translation has to say again: the Greek text, without the memory's date. */
function greekText(recipe: Json): string {
  const memory = isObject(recipe.memory) ? { title: recipe.memory.title, story: recipe.memory.story } : undefined;
  const { title, description, ingredients, steps, preparations, prepTime, cookTime } = recipe;
  return JSON.stringify({ title, description, ingredients, steps, preparations, memory, prepTime, cookTime });
}

/** True when the Greek text differs, so the translations may no longer say the same. */
export function greekTextChanged(before: Json, after: Json): boolean {
  return greekText(before) !== greekText(after);
}
