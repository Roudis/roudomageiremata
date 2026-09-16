export interface Memory {
  title: string;
  story: string;
  date?: string;
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
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * The fields the recipe list and cards need, so the browser doesn't receive
 * steps, memory stories, or timestamps. Built with `toRecipeSummary`.
 */
export interface RecipeSummary
  extends Pick<Recipe, "id" | "title" | "description" | "ingredients" | "imageUrl" | "category" | "prepTime" | "servings"> {
  hasMemory: boolean;
}
