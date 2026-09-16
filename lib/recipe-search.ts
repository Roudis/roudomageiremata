import type { Recipe } from "@/types/recipe";
import { FILTER_CATEGORY_FALLBACK } from "@/lib/recipe-view";

/** The fields search and filtering read. Both `Recipe` and `RecipeSummary` satisfy it. */
export type SearchableRecipe = Pick<Recipe, "title" | "description" | "ingredients" | "category">;

export type RecipeFilter = {
  /** Free text matched against the title, description, and ingredients. */
  query: string;
  /** A value from `getCategories`, or null for every category. */
  category: string | null;
};

/** Unique category labels, sorted by code unit, with uncategorized recipes under FILTER_CATEGORY_FALLBACK. */
export function getCategories(recipes: readonly SearchableRecipe[]): string[] {
  const categories = new Set(recipes.map((recipe) => recipe.category ?? FILTER_CATEGORY_FALLBACK));
  return Array.from(categories).sort();
}

/**
 * Recipes matching both the query and the category, in their original order.
 * Matching is a case-insensitive substring check that respects accents.
 */
export function filterRecipes<T extends SearchableRecipe>(recipes: readonly T[], { query, category }: RecipeFilter): T[] {
  const needle = query.toLowerCase();

  return recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(needle) ||
      recipe.description.toLowerCase().includes(needle) ||
      recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(needle));

    const matchesCategory = category ? (recipe.category ?? FILTER_CATEGORY_FALLBACK) === category : true;

    return matchesSearch && matchesCategory;
  });
}
