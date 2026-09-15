/**
 * Characterization tests for lib/recipes.ts.
 *
 * These lock down how recipes are loaded TODAY, including quirks that may not
 * be desirable. A test named "(current behavior)" documents a quirk: if a
 * refactor changes it on purpose, update the test in the same change.
 */
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { getAllRecipes, getRecipeById } from "@/lib/recipes";
import type { Memory, Recipe } from "@/types/recipe";

type RecipesModule = typeof import("@/lib/recipes");

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const REAL_RECIPES_DIR = path.join(process.cwd(), "data", "recipes");
const LOG_MESSAGE = "Failed to read recipes directory";

let projectRoot: string;
let recipesDir: string;
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), "recipes-test-"));
  recipesDir = path.join(projectRoot, "data", "recipes");
  await fs.mkdir(recipesDir, { recursive: true });
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(projectRoot, { recursive: true, force: true });
});

/**
 * lib/recipes.ts computes `path.join(process.cwd(), "data", "recipes")` once,
 * when the module is first evaluated. To point it at a fixture directory we
 * fake cwd only while a fresh copy of the module is imported.
 */
async function loadRecipesModule(cwd: string = projectRoot): Promise<RecipesModule> {
  const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(cwd);
  try {
    vi.resetModules();
    return await import("@/lib/recipes");
  } finally {
    cwdSpy.mockRestore();
  }
}

function makeRecipe(overrides: Partial<Recipe> & Pick<Recipe, "id">): Recipe {
  return {
    title: `Title of ${overrides.id}`,
    description: `Description of ${overrides.id}`,
    ingredients: ["ingredient"],
    steps: ["step"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

async function writeRecipe(recipe: Recipe): Promise<void> {
  await writeRaw(`${recipe.id}.json`, JSON.stringify(recipe, null, 2));
}

async function writeRaw(fileName: string, contents: string): Promise<void> {
  await fs.writeFile(path.join(recipesDir, fileName), contents, "utf8");
}

async function realRecipeIds(): Promise<string[]> {
  const files = await fs.readdir(REAL_RECIPES_DIR);
  return files.filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -".json".length));
}

// ---------------------------------------------------------------------------
// Runtime mirror of types/recipe.ts
//
// ShapeSpec<T> must list every key of T, with `required` matching whether the
// key is optional in T. Adding, removing, or changing the optionality of a
// field in types/recipe.ts makes this file fail `npm run typecheck` until the
// spec below is updated.
// ---------------------------------------------------------------------------

type RequiredKeys<T> = {
  [K in keyof T]-?: Partial<Pick<T, K>> extends Pick<T, K> ? never : K;
}[keyof T];

type FieldRule = (value: unknown) => boolean;

type ShapeSpec<T> = {
  [K in keyof T]-?: { required: K extends RequiredKeys<T> ? true : false; valid: FieldRule };
};

const isString: FieldRule = (v) => typeof v === "string";
const isStringArray: FieldRule = (v) => Array.isArray(v) && v.every((item) => typeof item === "string");
const isNumber: FieldRule = (v) => typeof v === "number" && Number.isFinite(v);
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const memorySpec: ShapeSpec<Memory> = {
  title: { required: true, valid: isString },
  story: { required: true, valid: isString },
  date: { required: false, valid: isString },
};

const recipeSpec: ShapeSpec<Recipe> = {
  id: { required: true, valid: isString },
  title: { required: true, valid: isString },
  description: { required: true, valid: isString },
  ingredients: { required: true, valid: isStringArray },
  steps: { required: true, valid: isStringArray },
  memory: { required: false, valid: (v) => isPlainObject(v) && shapeErrors(v, memorySpec).length === 0 },
  imageUrl: { required: false, valid: isString },
  category: { required: false, valid: isString },
  prepTime: { required: false, valid: isString },
  cookTime: { required: false, valid: isString },
  servings: { required: false, valid: isNumber },
  createdAt: { required: true, valid: isString },
  updatedAt: { required: true, valid: isString },
};

function shapeErrors<T>(value: unknown, spec: ShapeSpec<T>): string[] {
  if (!isPlainObject(value)) return ["not an object"];
  const rules = Object.entries(spec) as [string, { required: boolean; valid: FieldRule }][];
  const errors: string[] = [];
  for (const [key, rule] of rules) {
    if (!(key in value)) {
      if (rule.required) errors.push(`missing required field "${key}"`);
    } else if (!rule.valid(value[key])) {
      errors.push(`field "${key}" has the wrong type`);
    }
  }
  const known = new Set(rules.map(([key]) => key));
  for (const key of Object.keys(value)) {
    if (!known.has(key)) errors.push(`unexpected field "${key}"`);
  }
  return errors;
}

// ---------------------------------------------------------------------------
// 1. Loading an individual recipe by id
// ---------------------------------------------------------------------------

describe("getRecipeById: loading one recipe", () => {
  it("returns the parsed contents of data/recipes/<id>.json", async () => {
    const stored = makeRecipe({
      id: "gemista",
      memory: { title: "Sunday", story: "Grandma's kitchen", date: "1998" },
      imageUrl: "/images/recipes/gemista.jpg",
      category: "Mains",
      prepTime: "20 λεπτά",
      cookTime: "60 λεπτά",
      servings: 4,
    });
    await writeRecipe(stored);
    const { getRecipeById } = await loadRecipesModule();

    await expect(getRecipeById("gemista")).resolves.toEqual(stored);
  });

  it("returns fields exactly as stored, without adding defaults for optional fields", async () => {
    const stored = makeRecipe({ id: "minimal" });
    await writeRecipe(stored);
    const { getRecipeById } = await loadRecipesModule();

    const result = await getRecipeById("minimal");

    expect(result).toStrictEqual(stored);
    expect(Object.keys(result ?? {})).toEqual(Object.keys(stored));
  });

  it("reads the file on every call, with no caching", async () => {
    await writeRecipe(makeRecipe({ id: "soup", title: "Before" }));
    const { getRecipeById } = await loadRecipesModule();

    const first = await getRecipeById("soup");
    await writeRecipe(makeRecipe({ id: "soup", title: "After" }));
    const second = await getRecipeById("soup");

    expect(first?.title).toBe("Before");
    expect(second?.title).toBe("After");
    expect(second).not.toBe(first);
  });

  it("does not require other recipe files to be valid", async () => {
    await writeRecipe(makeRecipe({ id: "good" }));
    await writeRaw("broken.json", "{ not json");
    const { getRecipeById } = await loadRecipesModule();

    await expect(getRecipeById("good")).resolves.toMatchObject({ id: "good" });
  });

  it("does not check that the id inside the file matches the requested id (current behavior)", async () => {
    await writeRaw("alpha.json", JSON.stringify(makeRecipe({ id: "beta" })));
    const { getRecipeById } = await loadRecipesModule();

    await expect(getRecipeById("alpha")).resolves.toMatchObject({ id: "beta" });
  });

  it("appends .json to the id verbatim, so an id that already ends in .json is not found (current behavior)", async () => {
    await writeRecipe(makeRecipe({ id: "pastitsio" }));
    const { getRecipeById } = await loadRecipesModule();

    await expect(getRecipeById("pastitsio.json")).resolves.toBeUndefined();
  });

  it("does not sanitize ids, so '../' segments resolve outside data/recipes (current behavior)", async () => {
    await fs.writeFile(
      path.join(projectRoot, "data", "outside.json"),
      JSON.stringify(makeRecipe({ id: "outside" })),
    );
    const { getRecipeById } = await loadRecipesModule();

    await expect(getRecipeById("../outside")).resolves.toMatchObject({ id: "outside" });
  });

  it("loads every real recipe in data/recipes by its id", async () => {
    const ids = await realRecipeIds();
    expect(ids.length).toBeGreaterThan(0);

    for (const id of ids) {
      const onDisk: unknown = JSON.parse(await fs.readFile(path.join(REAL_RECIPES_DIR, `${id}.json`), "utf8"));
      await expect(getRecipeById(id), `recipe "${id}"`).resolves.toEqual(onDisk);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Loading all recipes and shape consistency
// ---------------------------------------------------------------------------

describe("getAllRecipes: loading every recipe", () => {
  it("returns one parsed recipe per .json file", async () => {
    const a = makeRecipe({ id: "a", updatedAt: "2026-01-01T00:00:00.000Z" });
    const b = makeRecipe({ id: "b", updatedAt: "2026-02-01T00:00:00.000Z" });
    await writeRecipe(a);
    await writeRecipe(b);
    const { getAllRecipes } = await loadRecipesModule();

    await expect(getAllRecipes()).resolves.toEqual([b, a]);
  });

  it("ignores files whose names do not end in lowercase .json", async () => {
    await writeRecipe(makeRecipe({ id: "kept" }));
    await writeRaw(".DS_Store", "binary junk");
    await writeRaw("notes.txt", "not a recipe");
    await writeRaw("draft.json.bak", "{ not json");
    await writeRaw("SHOUTING.JSON", "{ not json");
    const { getAllRecipes } = await loadRecipesModule();

    const result = await getAllRecipes();

    expect(result.map((r) => r.id)).toEqual(["kept"]);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("sorts by updatedAt, newest first, regardless of file name order", async () => {
    await writeRecipe(makeRecipe({ id: "a-oldest", updatedAt: "2025-01-01T00:00:00.000Z" }));
    await writeRecipe(makeRecipe({ id: "b-newest", updatedAt: "2026-06-01T00:00:00.000Z" }));
    await writeRecipe(makeRecipe({ id: "c-middle", updatedAt: "2025-09-01T00:00:00.000Z" }));
    const { getAllRecipes } = await loadRecipesModule();

    const result = await getAllRecipes();

    expect(result.map((r) => r.id)).toEqual(["b-newest", "c-middle", "a-oldest"]);
  });

  it("sorts by parsed time, not by string order, so time zone offsets are respected", async () => {
    // As strings "2026-03-01..." > "2026-02-28...", but as instants 22:00Z is before 23:30Z.
    await writeRecipe(makeRecipe({ id: "offset", updatedAt: "2026-03-01T00:00:00+02:00" }));
    await writeRecipe(makeRecipe({ id: "utc", updatedAt: "2026-02-28T23:30:00Z" }));
    const { getAllRecipes } = await loadRecipesModule();

    const result = await getAllRecipes();

    expect(result.map((r) => r.id)).toEqual(["utc", "offset"]);
  });

  it("ignores createdAt when sorting", async () => {
    // File names sort opposite to the expected result, so this cannot pass by directory order.
    await writeRecipe(makeRecipe({ id: "a-created-late", createdAt: "2026-12-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" }));
    await writeRecipe(makeRecipe({ id: "b-created-early", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2026-02-01T00:00:00Z" }));
    const { getAllRecipes } = await loadRecipesModule();

    const result = await getAllRecipes();

    expect(result.map((r) => r.id)).toEqual(["b-created-early", "a-created-late"]);
  });

  it("returns an empty array for an empty directory, without logging", async () => {
    const { getAllRecipes } = await loadRecipesModule();

    await expect(getAllRecipes()).resolves.toEqual([]);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("re-reads the directory on every call, with no caching", async () => {
    await writeRecipe(makeRecipe({ id: "first" }));
    const { getAllRecipes } = await loadRecipesModule();

    const before = await getAllRecipes();
    await writeRecipe(makeRecipe({ id: "second" }));
    const after = await getAllRecipes();

    expect(before).toHaveLength(1);
    expect(after).toHaveLength(2);
  });

  it("does not validate shape: incomplete or extra fields are returned as-is (current behavior)", async () => {
    const partial = { id: "partial", updatedAt: "2026-01-01T00:00:00Z", unexpected: true };
    await writeRaw("partial.json", JSON.stringify(partial));
    const { getAllRecipes } = await loadRecipesModule();

    await expect(getAllRecipes()).resolves.toEqual([partial]);
  });

  it("does not throw when updatedAt is missing or unparseable (current behavior)", async () => {
    await writeRecipe(makeRecipe({ id: "valid-date", updatedAt: "2026-01-01T00:00:00Z" }));
    await writeRecipe(makeRecipe({ id: "bad-date", updatedAt: "not a date" }));
    const noDate: Partial<Recipe> = makeRecipe({ id: "no-date" });
    delete noDate.updatedAt;
    await writeRaw("no-date.json", JSON.stringify(noDate));
    const { getAllRecipes } = await loadRecipesModule();

    const result = await getAllRecipes();

    // NaN comparisons leave the order unspecified, so only membership is locked down.
    expect(result.map((r) => r.id).sort()).toEqual(["bad-date", "no-date", "valid-date"]);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("declares Recipe-typed signatures (checked by npm run typecheck)", () => {
    expectTypeOf(getAllRecipes).parameters.toEqualTypeOf<[]>();
    expectTypeOf(getAllRecipes).returns.resolves.toEqualTypeOf<Recipe[]>();
    expectTypeOf(getRecipeById).parameters.toEqualTypeOf<[id: string]>();
    expectTypeOf(getRecipeById).returns.resolves.toEqualTypeOf<Recipe | undefined>();
  });
});

describe("shape consistency of real data against the Recipe type", () => {
  it("the shape checker itself rejects recipes that break the Recipe type", () => {
    const valid = makeRecipe({ id: "ok", memory: { title: "t", story: "s" } });
    expect(shapeErrors(valid, recipeSpec)).toEqual([]);

    const broken = { ...valid, servings: "4", memory: { title: "t" }, extra: 1 } as unknown;
    delete (broken as Record<string, unknown>).steps;
    expect(shapeErrors(broken, recipeSpec)).toEqual([
      'missing required field "steps"',
      'field "memory" has the wrong type',
      'field "servings" has the wrong type',
      'unexpected field "extra"',
    ]);
  });

  it("returns exactly one recipe per .json file in data/recipes", async () => {
    const ids = await realRecipeIds();
    const recipes = await getAllRecipes();

    expect(ids.length).toBeGreaterThan(0);
    expect(recipes.map((r) => r.id).sort()).toEqual([...ids].sort());
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("every recipe matches the Recipe and Memory interfaces, with no extra fields", async () => {
    const recipes = await getAllRecipes();

    const problems = recipes.flatMap((recipe) =>
      shapeErrors(recipe, recipeSpec).map((problem) => `${recipe.id}: ${problem}`),
    );

    expect(problems).toEqual([]);
  });

  it("every recipe has parseable createdAt and updatedAt timestamps", async () => {
    const recipes = await getAllRecipes();

    const unparseable = recipes.filter(
      (r) => Number.isNaN(Date.parse(r.createdAt)) || Number.isNaN(Date.parse(r.updatedAt)),
    );

    expect(unparseable.map((r) => r.id)).toEqual([]);
  });

  // Note: today all real recipes share one updatedAt value, so this passes trivially and the
  // rendered order is really the filesystem's readdir order. The fixture sort tests above are
  // the ones that lock down sorting.
  it("is sorted by updatedAt, newest first", async () => {
    const times = (await getAllRecipes()).map((r) => Date.parse(r.updatedAt));

    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it("getRecipeById returns the same data as getAllRecipes for every recipe", async () => {
    const recipes = await getAllRecipes();

    for (const recipe of recipes) {
      await expect(getRecipeById(recipe.id), `recipe "${recipe.id}"`).resolves.toEqual(recipe);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Missing or invalid data
// ---------------------------------------------------------------------------

describe("missing or invalid data: getRecipeById", () => {
  it("returns undefined for an id with no file, without logging", async () => {
    const { getRecipeById } = await loadRecipesModule();

    await expect(getRecipeById("does-not-exist")).resolves.toBeUndefined();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("returns undefined when the file contains invalid JSON, without logging", async () => {
    await writeRaw("broken.json", '{ "id": "broken", ');
    const { getRecipeById } = await loadRecipesModule();

    await expect(getRecipeById("broken")).resolves.toBeUndefined();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("returns undefined when the file is empty", async () => {
    await writeRaw("empty.json", "");
    const { getRecipeById } = await loadRecipesModule();

    await expect(getRecipeById("empty")).resolves.toBeUndefined();
  });

  it("returns undefined when data/recipes does not exist", async () => {
    await fs.rm(recipesDir, { recursive: true });
    const { getRecipeById } = await loadRecipesModule();

    await expect(getRecipeById("anything")).resolves.toBeUndefined();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("returns undefined when <id>.json is a directory", async () => {
    await fs.mkdir(path.join(recipesDir, "folder.json"));
    const { getRecipeById } = await loadRecipesModule();

    await expect(getRecipeById("folder")).resolves.toBeUndefined();
  });

  it("returns valid non-recipe JSON such as null as-is instead of undefined (current behavior)", async () => {
    await writeRaw("null.json", "null");
    await writeRaw("array.json", "[1, 2, 3]");
    const { getRecipeById } = await loadRecipesModule();

    await expect(getRecipeById("null")).resolves.toBeNull();
    await expect(getRecipeById("array")).resolves.toEqual([1, 2, 3]);
  });
});

describe("missing or invalid data: getAllRecipes", () => {
  it("returns [] and logs once when data/recipes does not exist", async () => {
    await fs.rm(recipesDir, { recursive: true });
    const { getAllRecipes } = await loadRecipesModule();

    await expect(getAllRecipes()).resolves.toEqual([]);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(LOG_MESSAGE, expect.objectContaining({ code: "ENOENT" }));
  });

  it("discards every recipe when one file has invalid JSON: returns [] and logs a SyntaxError (current behavior)", async () => {
    await writeRecipe(makeRecipe({ id: "good-1" }));
    await writeRecipe(makeRecipe({ id: "good-2" }));
    await writeRaw("broken.json", '{ "id": "broken", ');
    const { getAllRecipes } = await loadRecipesModule();

    await expect(getAllRecipes()).resolves.toEqual([]);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(LOG_MESSAGE, expect.any(SyntaxError));
  });

  it("discards every recipe when one .json file is empty (current behavior)", async () => {
    await writeRecipe(makeRecipe({ id: "good" }));
    await writeRaw("empty.json", "");
    const { getAllRecipes } = await loadRecipesModule();

    await expect(getAllRecipes()).resolves.toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith(LOG_MESSAGE, expect.any(SyntaxError));
  });

  it("discards every recipe when a directory name ends in .json (current behavior)", async () => {
    await writeRecipe(makeRecipe({ id: "good" }));
    await fs.mkdir(path.join(recipesDir, "folder.json"));
    const { getAllRecipes } = await loadRecipesModule();

    await expect(getAllRecipes()).resolves.toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith(LOG_MESSAGE, expect.objectContaining({ code: "EISDIR" }));
  });

  it("returns a lone null file as [null], because the sort comparator never runs (current behavior)", async () => {
    await writeRaw("null.json", "null");
    const { getAllRecipes } = await loadRecipesModule();

    await expect(getAllRecipes()).resolves.toEqual([null]);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("discards every recipe when a null file sits next to a real recipe, because sorting throws (current behavior)", async () => {
    await writeRecipe(makeRecipe({ id: "good" }));
    await writeRaw("null.json", "null");
    const { getAllRecipes } = await loadRecipesModule();

    await expect(getAllRecipes()).resolves.toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith(LOG_MESSAGE, expect.any(TypeError));
  });

  it("a broken file breaks getAllRecipes but not getRecipeById for other ids", async () => {
    await writeRecipe(makeRecipe({ id: "good" }));
    await writeRaw("broken.json", "{ not json");
    const { getAllRecipes, getRecipeById } = await loadRecipesModule();

    await expect(getAllRecipes()).resolves.toEqual([]);
    await expect(getRecipeById("good")).resolves.toMatchObject({ id: "good" });
  });
});
