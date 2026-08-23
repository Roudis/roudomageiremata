import { promises as fs } from "fs";
import path from "path";
import { Recipe } from "@/types/recipe";

const recipesDir = path.join(process.cwd(), "data", "recipes");

export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    const files = await fs.readdir(recipesDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const recipes: Recipe[] = [];
    for (const file of jsonFiles) {
      const filePath = path.join(recipesDir, file);
      const raw = await fs.readFile(filePath, "utf8");
      recipes.push(JSON.parse(raw) as Recipe);
    }

    return recipes.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  } catch (error) {
    console.error("Failed to read recipes directory", error);
    return [];
  }
}

export async function getRecipeById(id: string): Promise<Recipe | undefined> {
  try {
    const filePath = path.join(recipesDir, `${id}.json`);
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as Recipe;
  } catch {
    // If the file is not found, we can optionally fallback to getAllRecipes() 
    // but reading the specific file is more efficient.
    return undefined;
  }
}
