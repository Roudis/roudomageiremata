/**
 * Validates the real recipe files in data/recipes. `npm run validate:data`
 * runs only this file, and CI runs it before every build.
 *
 * The loader skips invalid files with a warning so the build still succeeds,
 * which makes this test the check that stops a partial site from deploying.
 */
import { promises as fs, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RecipeDataError, parseRecipe } from "@/lib/recipe-schema";

const RECIPES_DIR = path.join(process.cwd(), "data", "recipes");
const PUBLIC_DIR = path.join(process.cwd(), "public");

// Listed synchronously because it.each needs the file names when tests are collected.
const files = readdirSync(RECIPES_DIR).filter((file) => file.endsWith(".json")).sort();

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** Every problem with one recipe file, as readable messages. */
async function problemsIn(file: string): Promise<string[]> {
  let value: unknown;
  try {
    value = JSON.parse(await fs.readFile(path.join(RECIPES_DIR, file), "utf8"));
  } catch (error) {
    return [`invalid JSON: ${error instanceof Error ? error.message : String(error)}`];
  }

  const problems: string[] = [];
  try {
    const recipe = parseRecipe(value, file, { expectedId: file.slice(0, -".json".length) });
    if (recipe.imageUrl !== undefined && !(await fileExists(path.join(PUBLIC_DIR, recipe.imageUrl)))) {
      problems.push(`imageUrl "${recipe.imageUrl}" does not exist under public/`);
    }
  } catch (error) {
    if (!(error instanceof RecipeDataError)) throw error;
    problems.push(...error.issues.map((issue) => issue.message));
  }
  return problems;
}

describe("data/recipes", () => {
  it("contains at least one recipe file, so the site never builds empty", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s is a valid recipe whose image exists", async (file) => {
    expect(await problemsIn(file)).toEqual([]);
  });
});
