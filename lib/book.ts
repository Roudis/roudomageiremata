import "server-only";
import type { CategoryNames, LocalizedRecipe, RecipeWithStory } from "@/types/recipe";
import type { Locale } from "@/lib/i18n/config";
import { getCategoryNames } from "@/lib/categories";
import { getAllRecipes } from "@/lib/recipes";
import { hasStory, localizeRecipe, recipeOrder, recipeTitles } from "@/lib/recipe-view";
import type { RecipeTitles } from "@/lib/story-text";

/** Everything the pages of one language read: the whole book, already in that language. */
export interface Book {
  /** Every recipe in `locale`, newest first; see `recipeOrder`. */
  recipes: LocalizedRecipe[];
  /** The recipes that have a family story, in the same order: the journal's entries. */
  stories: RecipeWithStory[];
  /** Recipe titles by id, for the recipe links inside story text. */
  titles: RecipeTitles;
  /** Category display names in `locale`, keyed by Greek category name. */
  categoryNames: CategoryNames;
}

/**
 * Loads the recipes and category names once and derives the rest. Every page
 * view in app/_shared calls it, because stories link to recipes and recipes to
 * stories, so even a single recipe's page needs to know the others.
 */
export async function getBook(locale: Locale): Promise<Book> {
  const [allRecipes, categoryNames] = await Promise.all([getAllRecipes(), getCategoryNames(locale)]);
  const recipes = allRecipes.map((recipe) => localizeRecipe(recipe, locale)).sort(recipeOrder(locale));

  return { recipes, stories: recipes.filter(hasStory), titles: recipeTitles(recipes), categoryNames };
}
