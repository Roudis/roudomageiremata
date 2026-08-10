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
