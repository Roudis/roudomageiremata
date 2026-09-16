import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Recipe } from "@/types/recipe";
import { RecipeDataError, isRecipeId, parseRecipe } from "@/lib/recipe-schema";
import { compareRecipes } from "@/lib/recipe-view";

export interface RecipeStore {
  getRecipeIds(): Promise<string[]>;
  getAllRecipes(): Promise<Recipe[]>;
  getRecipeById(id: string): Promise<Recipe | undefined>;
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));
const isMissingFile = (error: unknown) => error instanceof Error && "code" in error && error.code === "ENOENT";

/**
 * Reads and validates `<dir>/<id>.json`. Returns undefined when the file does
 * not exist, and throws a RecipeDataError for any other problem.
 */
async function readRecipeFile(dir: string, id: string): Promise<Recipe | undefined> {
  const filePath = path.join(dir, `${id}.json`);
  const source = path.relative(process.cwd(), filePath);

  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (isMissingFile(error)) return undefined;
    throw new RecipeDataError(source, [{ field: "", message: `could not be read: ${errorMessage(error)}` }]);
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    throw new RecipeDataError(source, [{ field: "", message: `invalid JSON: ${errorMessage(error)}` }]);
  }

  return parseRecipe(value, source, { expectedId: id });
}

/**
 * Recipe access for one folder of `<id>.json` files. Tests pass a temporary folder.
 *
 * A file that is unreadable, not valid JSON, fails `parseRecipe`, or has an id
 * that differs from its file name is skipped with a console warning, so the
 * build still succeeds without it. `npm run validate:data` fails on such files.
 */
export function createRecipeStore(dir: string): RecipeStore {
  async function readOrSkip(id: string): Promise<Recipe | undefined> {
    try {
      return await readRecipeFile(dir, id);
    } catch (error) {
      if (!(error instanceof RecipeDataError)) throw error;
      console.warn(`Skipping recipe: ${error.message}`);
      return undefined;
    }
  }

  async function getAllRecipes(): Promise<Recipe[]> {
    let files: string[];
    try {
      files = await fs.readdir(dir);
    } catch (error) {
      console.error("Failed to read recipes directory", error);
      return [];
    }

    const recipes: Recipe[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const recipe = await readOrSkip(file.slice(0, -".json".length));
      if (recipe) recipes.push(recipe);
    }

    return recipes.sort(compareRecipes);
  }

  /** Ids of the recipes getAllRecipes returns. Files are parsed rather than just listed, so skipped files get no page. */
  async function getRecipeIds(): Promise<string[]> {
    return (await getAllRecipes()).map((recipe) => recipe.id);
  }

  async function getRecipeById(id: string): Promise<Recipe | undefined> {
    return isRecipeId(id) ? readOrSkip(id) : undefined;
  }

  return { getRecipeIds, getAllRecipes, getRecipeById };
}

/** Resolved on every call rather than at import, so the working directory is read when data is needed. */
function defaultStore(): RecipeStore {
  return createRecipeStore(path.join(process.cwd(), "data", "recipes"));
}

export function getRecipeIds(): Promise<string[]> {
  return defaultStore().getRecipeIds();
}

export function getAllRecipes(): Promise<Recipe[]> {
  return defaultStore().getAllRecipes();
}

export function getRecipeById(id: string): Promise<Recipe | undefined> {
  return defaultStore().getRecipeById(id);
}
