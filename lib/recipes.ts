import { promises as fs } from "fs";
import path from "path";
import type { Recipe } from "@/types/recipe";
import { compareRecipes } from "@/lib/recipe-view";

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

    return recipes.sort(compareRecipes);
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
    return undefined;
  }
}
