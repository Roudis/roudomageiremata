import type { Recipe, RecipeSummary } from "@/types/recipe";

/** Category used everywhere a recipe has none: the card, the detail page, and the filter. */
export const CATEGORY_FALLBACK = "Άλλο";

/** The category to display and filter by, which is CATEGORY_FALLBACK when the recipe has none. */
export function categoryLabel(recipe: Pick<Recipe, "category">): string {
  return recipe.category ?? CATEGORY_FALLBACK;
}

/**
 * A stable bucket for a category label, so each category keeps one colour
 * however the list is filtered. FNV-1a, which spreads similar labels such as
 * "Της Γιαγιάς…" and "Του Μπαμπούλα…" apart. Two categories can still land on
 * the same bucket: the colour is stable, not guaranteed unique.
 */
export function categoryColorIndex(label: string, buckets: number): number {
  let hash = 2166136261;
  for (let i = 0; i < label.length; i++) {
    hash ^= label.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash % buckets;
}

/** "N υλικά", used on the card and the detail page. */
export function formatIngredientCount(count: number): string {
  return `${count} υλικά`;
}

const titleCollator = new Intl.Collator("el");

/**
 * Newest `updatedAt` first, comparing parsed instants rather than strings.
 * Ties, including unparseable timestamps, fall back to the title in Greek
 * alphabetical order and then to the id, so the order never depends on the
 * filesystem.
 */
export function compareRecipes(a: Recipe, b: Recipe): number {
  return (
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() ||
    titleCollator.compare(a.title, b.title) ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );
}

// "10 Αυγ 2026". Fixed locale and time zone, so the date does not depend on the build machine.
const recipeDateFormat = new Intl.DateTimeFormat("el-GR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Athens",
});

/** Formats an ISO timestamp for display, or returns it unchanged if it cannot be parsed. */
export function formatRecipeDate(isoDate: string): string {
  const parsed = Date.parse(isoDate);
  return Number.isNaN(parsed) ? isoDate : recipeDateFormat.format(parsed);
}

// "Νοέμβριος 2023". UTC, because a bare year and month has no time of day to shift.
const memoryMonthFormat = new Intl.DateTimeFormat("el-GR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats a memory's "YYYY-MM" date as a Greek month and year, or returns any other value unchanged. */
export function formatMemoryDate(date: string): string {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(date);
  return match === null ? date : memoryMonthFormat.format(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
}

/** Keeps only what the recipe list and cards render. Optional fields stay absent when missing. */
export function toRecipeSummary(recipe: Recipe): RecipeSummary {
  const summary: RecipeSummary = {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    hasMemory: Boolean(recipe.memory),
  };
  if (recipe.imageUrl !== undefined) summary.imageUrl = recipe.imageUrl;
  if (recipe.category !== undefined) summary.category = recipe.category;
  if (recipe.prepTime !== undefined) summary.prepTime = recipe.prepTime;
  if (recipe.servings !== undefined) summary.servings = recipe.servings;
  return summary;
}
