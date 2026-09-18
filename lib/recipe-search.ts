import type { Recipe } from "@/types/recipe";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { categoryLabel } from "@/lib/recipe-view";
import { TAG_IDS, expandTags, tagName, type TagId } from "@/lib/tags";

/** The fields search and filtering read. Both `Recipe` and `RecipeSummary` satisfy it. */
export type SearchableRecipe = Pick<Recipe, "title" | "description" | "ingredients" | "category" | "tags">;

export type RecipeFilter = {
  /** Free text matched against the title, description, ingredients, and tag names. */
  query: string;
  /** A value from `getCategories`, or null for every category. */
  category: string | null;
  /** A value from `getTags`, or null or absent for any tags. Implied tags count, so "vegetarian" includes vegan recipes. */
  tag?: TagId | null;
  /** The language whose tag names the query is matched against. Defaults to Greek. */
  locale?: Locale;
};

/** Unique category labels, sorted by code unit, with uncategorized recipes under CATEGORY_FALLBACK. */
export function getCategories(recipes: readonly SearchableRecipe[]): string[] {
  return Array.from(new Set(recipes.map(categoryLabel))).sort();
}

/** Every tag at least one recipe has, implied ones included, in TAG_IDS order. */
export function getTags(recipes: readonly SearchableRecipe[]): TagId[] {
  const used = new Set(recipes.flatMap((recipe) => expandTags(recipe.tags ?? [])));
  return TAG_IDS.filter((tag) => used.has(tag));
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
 * Recipes matching the query, the category, and the tag, in their original order.
 * Matching is a substring check on `normalizeSearchText`, so it ignores case,
 * accents, and final sigma. The query also matches the names of a recipe's tags
 * in `locale`, implied ones included, so "κρέας" finds a recipe tagged beef.
 */
export function filterRecipes<T extends SearchableRecipe>(
  recipes: readonly T[],
  { query, category, tag = null, locale = DEFAULT_LOCALE }: RecipeFilter,
): T[] {
  const needle = normalizeSearchText(query);

  return recipes.filter((recipe) => {
    const tags = expandTags(recipe.tags ?? []);

    const matchesSearch =
      normalizeSearchText(recipe.title).includes(needle) ||
      normalizeSearchText(recipe.description).includes(needle) ||
      recipe.ingredients.some((ingredient) => normalizeSearchText(ingredient).includes(needle)) ||
      tags.some((id) => normalizeSearchText(tagName(id, locale)).includes(needle));

    const matchesCategory = category ? categoryLabel(recipe) === category : true;
    const matchesTag = tag ? tags.includes(tag) : true;

    return matchesSearch && matchesCategory && matchesTag;
  });
}
