import type { Recipe } from "@/types/recipe";
import { categoryLabel } from "@/lib/recipe-view";

/** The fields search and filtering read. Both `Recipe` and `RecipeSummary` satisfy it. */
export type SearchableRecipe = Pick<Recipe, "title" | "description" | "ingredients" | "category">;

export type RecipeFilter = {
  /** Free text matched against the title, description, and ingredients. */
  query: string;
  /** A value from `getCategories`, or null for every category. */
  category: string | null;
};

/** Unique category labels, sorted by code unit, with uncategorized recipes under CATEGORY_FALLBACK. */
export function getCategories(recipes: readonly SearchableRecipe[]): string[] {
  return Array.from(new Set(recipes.map(categoryLabel))).sort();
}

const COMBINING_MARKS = /[\u0300-\u036f]/g;

/**
 * Folds text for searching: lowercase with Greek rules, accents stripped, and
 * final sigma "ς" written as "σ", so "καρμπονάρα", "ΚΑΡΜΠΟΝΑΡΑ", and
 * "καρμποναρασ" all match the same recipes.
 */
export function normalizeSearchText(text: string): string {
  return text
    .toLocaleLowerCase("el")
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/ς/g, "σ");
}

/**
 * Recipes matching both the query and the category, in their original order.
 * Matching is a substring check on `normalizeSearchText`, so it ignores case,
 * accents, and final sigma.
 */
export function filterRecipes<T extends SearchableRecipe>(recipes: readonly T[], { query, category }: RecipeFilter): T[] {
  const needle = normalizeSearchText(query);

  return recipes.filter((recipe) => {
    const matchesSearch =
      normalizeSearchText(recipe.title).includes(needle) ||
      normalizeSearchText(recipe.description).includes(needle) ||
      recipe.ingredients.some((ingredient) => normalizeSearchText(ingredient).includes(needle));

    const matchesCategory = category ? categoryLabel(recipe) === category : true;

    return matchesSearch && matchesCategory;
  });
}
