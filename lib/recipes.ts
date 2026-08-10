import { promises as fs } from "fs";
import path from "path";
import { Recipe } from "@/types/recipe";

const dataFilePath = path.join(process.cwd(), "data", "recipes.json");

type RecipeFile = {
  recipes: Recipe[];
};

async function readRecipeFile(): Promise<RecipeFile> {
  const raw = await fs.readFile(dataFilePath, "utf8");
  const parsed = JSON.parse(raw) as Partial<RecipeFile>;

  return {
    recipes: Array.isArray(parsed.recipes) ? parsed.recipes : [],
  };
}

export async function getAllRecipes() {
  const data = await readRecipeFile();

  return [...data.recipes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getRecipeById(id: string) {
  const recipes = await getAllRecipes();
  return recipes.find((recipe) => recipe.id === id);
}
