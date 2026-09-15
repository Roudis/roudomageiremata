import type { Recipe, RecipeSummary } from "@/types/recipe";

/** Category shown on the card and the detail page when a recipe has none. */
export const DISPLAY_CATEGORY_FALLBACK = "Αγαπημενο της Οικογενειας";

/**
 * Category the home page filter lists uncategorized recipes under. It differs
 * from DISPLAY_CATEGORY_FALLBACK today; step 3.5 of REFACTOR_PLAN.md unifies them.
 */
export const FILTER_CATEGORY_FALLBACK = "Άλλο";

/** "N υλικά", used on the card and the detail page. */
export function formatIngredientCount(count: number): string {
  return `${count} υλικά`;
}

/**
 * Newest `updatedAt` first, comparing parsed instants rather than strings.
 * Recipes with equal timestamps compare as 0, so their order is left to the
 * sort, and unparseable timestamps compare as NaN.
 */
export function compareRecipes(a: Recipe, b: Recipe): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
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
