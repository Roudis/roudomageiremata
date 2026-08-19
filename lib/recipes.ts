import { promises as fs } from "fs";
import path from "path";
import { Recipe } from "@/types/recipe";

import { Locale } from "./i18n";

const dataFilePath = path.join(process.cwd(), "data", "recipes.json");

type RecipeFile = {
  recipes: Recipe[];
};

async function readRecipeFile(locale: Locale = "el"): Promise<RecipeFile> {
  const fileName = locale === "el" ? "recipes.json" : "recipes.en.json";
  const filePath = path.join(process.cwd(), "data", fileName);
  
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as Partial<RecipeFile>;

  return {
    recipes: Array.isArray(parsed.recipes) ? parsed.recipes : [],
  };
}

export async function getAllRecipes(locale: Locale = "el") {
  const data = await readRecipeFile(locale);

  return [...data.recipes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getRecipeById(id: string, locale: Locale = "el") {
  const recipes = await getAllRecipes(locale);
  return recipes.find((recipe) => recipe.id === id);
}
