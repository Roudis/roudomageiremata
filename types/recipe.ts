import type { Locale, TranslatedLocale } from "@/lib/i18n/config";
import type { TagId } from "@/lib/tags";

export interface Memory {
  title: string;
  story: string;
  date?: string;
}

/**
 * A recipe's text in one other language. It mirrors the Greek fields one to one:
 * the same number of ingredients and steps, and a memory, prepTime, or cookTime
 * exactly when the Greek has one. The memory's date comes from the Greek.
 */
export interface RecipeTranslation {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  memory?: Pick<Memory, "title" | "story">;
  prepTime?: string;
  cookTime?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  memory?: Memory;
  imageUrl?: string;
  category?: string;
  /** Ids from TAG_NAMES in lib/tags.ts, most specific only: "vegan" rather than "vegan" and "vegetarian". */
  tags?: TagId[];
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  createdAt: string;
  updatedAt: string;
  /** Text in the other languages. A language without an entry shows the Greek. */
  translations?: Partial<Record<TranslatedLocale, RecipeTranslation>>;
}

/**
 * A recipe as one language's pages show it, built with `localizeRecipe`: the
 * translated text where there is one, the Greek otherwise. `category` stays the
 * Greek name, which filtering and the colour dots key on; pages look up its
 * display name separately.
 */
export interface LocalizedRecipe extends Omit<Recipe, "translations"> {
  /** The language the text is in: the page's language, or Greek when the recipe has no translation. */
  contentLocale: Locale;
}

/**
 * The fields the recipe list and cards need, so the browser doesn't receive
 * steps, memory stories, or timestamps. Built with `toRecipeSummary`.
 */
export interface RecipeSummary
  extends Pick<
    LocalizedRecipe,
    | "id"
    | "title"
    | "description"
    | "ingredients"
    | "imageUrl"
    | "category"
    | "tags"
    | "prepTime"
    | "servings"
    | "contentLocale"
  > {
  hasMemory: boolean;
}

/** Category display names for one language, keyed by the Greek category name. Built by `getCategoryNames`. */
export type CategoryNames = Record<string, string>;
