import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { Recipe } from "@/types/recipe";

const dataFilePath = path.join(process.cwd(), "data", "recipes.json");

type RecipeInput = {
  title?: string;
  description?: string;
  ingredients?: string[];
  steps?: string[];
  memory?: {
    title?: string;
    story?: string;
    date?: string;
  };
  imageUrl?: string;
  category?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
};

type RecipeFile = {
  recipes: Recipe[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function cleanList(items?: string[]) {
  return (items ?? []).map((item) => item.trim()).filter(Boolean);
}

function normalizeMemory(memory?: RecipeInput["memory"]) {
  if (!memory) {
    return undefined;
  }

  const title = memory.title?.trim() ?? "";
  const story = memory.story?.trim() ?? "";
  const date = memory.date?.trim() ?? "";

  if (!title && !story && !date) {
    return undefined;
  }

  if (!title || !story) {
    throw new Error("Memory title and story are required when adding a memory.");
  }

  return {
    title,
    story,
    ...(date ? { date } : {}),
  };
}

function validateRecipeInput(input: RecipeInput) {
  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const ingredients = cleanList(input.ingredients);
  const steps = cleanList(input.steps);
  const memory = normalizeMemory(input.memory);
  const imageUrl = input.imageUrl?.trim() || undefined;
  const category = input.category?.trim() || undefined;
  const prepTime = input.prepTime?.trim() || undefined;
  const cookTime = input.cookTime?.trim() || undefined;
  const servings =
    typeof input.servings === "number" && Number.isFinite(input.servings) && input.servings > 0
      ? Math.floor(input.servings)
      : undefined;

  if (!title) {
    throw new Error("Recipe title is required.");
  }

  if (!description) {
    throw new Error("Recipe description is required.");
  }

  if (ingredients.length === 0) {
    throw new Error("Please add at least one ingredient.");
  }

  if (steps.length === 0) {
    throw new Error("Please add at least one step.");
  }

  return {
    title,
    description,
    ingredients,
    steps,
    memory,
    imageUrl,
    category,
    prepTime,
    cookTime,
    servings,
  };
}

async function readRecipeFile(): Promise<RecipeFile> {
  try {
    const raw = await fs.readFile(dataFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<RecipeFile>;

    return {
      recipes: Array.isArray(parsed.recipes) ? parsed.recipes : [],
    };
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      await writeRecipeFile({ recipes: [] });
      return { recipes: [] };
    }

    throw new Error("Unable to read recipe data.");
  }
}

async function writeRecipeFile(data: RecipeFile) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
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

export async function createRecipe(input: RecipeInput) {
  const data = await readRecipeFile();
  const now = new Date().toISOString();
  const normalized = validateRecipeInput(input);
  const baseSlug = slugify(normalized.title) || "family-recipe";
  const recipe: Recipe = {
    id: `${baseSlug}-${randomUUID().slice(0, 8)}`,
    ...normalized,
    createdAt: now,
    updatedAt: now,
  };

  data.recipes.unshift(recipe);
  await writeRecipeFile(data);
  revalidatePath("/");
  revalidatePath(`/recipes/${recipe.id}`);

  return recipe;
}

export async function updateRecipe(id: string, input: RecipeInput) {
  const data = await readRecipeFile();
  const index = data.recipes.findIndex((recipe) => recipe.id === id);

  if (index === -1) {
    return null;
  }

  const normalized = validateRecipeInput(input);
  const current = data.recipes[index];
  const updatedRecipe: Recipe = {
    ...current,
    ...normalized,
    updatedAt: new Date().toISOString(),
  };

  data.recipes[index] = updatedRecipe;
  await writeRecipeFile(data);
  revalidatePath("/");
  revalidatePath(`/recipes/${id}`);
  revalidatePath(`/recipes/${id}/edit`);

  return updatedRecipe;
}

export async function deleteRecipe(id: string) {
  const data = await readRecipeFile();
  const recipe = data.recipes.find((item) => item.id === id);

  if (!recipe) {
    return null;
  }

  data.recipes = data.recipes.filter((item) => item.id !== id);
  await writeRecipeFile(data);
  revalidatePath("/");
  revalidatePath(`/recipes/${id}`);

  return recipe;
}
