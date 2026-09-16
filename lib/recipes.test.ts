/**
 * Characterization tests for lib/recipes.ts.
 *
 * These lock down how recipes are loaded, including quirks that may not be
 * desirable. A test named "(current behavior)" documents a quirk: if a
 * refactor changes it on purpose, update the test in the same change.
 *
 * Checks on the real files in data/recipes live in lib/recipes.data.test.ts.
 */
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { createRecipeStore, getAllRecipes, getRecipeById, getRecipeIds, type RecipeStore } from "@/lib/recipes";
import type { Recipe } from "@/types/recipe";

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const REAL_RECIPES_DIR = path.join(process.cwd(), "data", "recipes");
const LOG_MESSAGE = "Failed to read recipes directory";

let projectRoot: string;
let recipesDir: string;
let errorSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), "recipes-test-"));
  recipesDir = path.join(projectRoot, "data", "recipes");
  await fs.mkdir(recipesDir, { recursive: true });
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(projectRoot, { recursive: true, force: true });
});

/** A store reading the fixture folder `<projectRoot>/data/recipes`. */
function fixtureStore(): RecipeStore {
  return createRecipeStore(recipesDir);
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
    const { getRecipeById } = fixtureStore();

    await expect(getRecipeById("gemista")).resolves.toEqual(stored);
  });

  it("returns fields exactly as stored, without adding defaults for optional fields", async () => {
    const stored = makeRecipe({ id: "minimal" });
    await writeRecipe(stored);
    const { getRecipeById } = fixtureStore();

    const result = await getRecipeById("minimal");

    expect(result).toStrictEqual(stored);
    expect(Object.keys(result ?? {})).toEqual(Object.keys(stored));
  });

  it("reads the file on every call, with no caching", async () => {
    await writeRecipe(makeRecipe({ id: "soup", title: "Before" }));
    const { getRecipeById } = fixtureStore();

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
    const { getRecipeById } = fixtureStore();

    await expect(getRecipeById("good")).resolves.toMatchObject({ id: "good" });
  });

  it("returns undefined and warns when the id inside the file differs from the file name", async () => {
    await writeRaw("alpha.json", JSON.stringify(makeRecipe({ id: "beta" })));
    const { getRecipeById } = fixtureStore();

    await expect(getRecipeById("alpha")).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('id "beta" must match filename "alpha"'));
  });

  it("does not find an id that already ends in .json", async () => {
    await writeRecipe(makeRecipe({ id: "pastitsio" }));
    const { getRecipeById } = fixtureStore();

    await expect(getRecipeById("pastitsio.json")).resolves.toBeUndefined();
  });

  it("returns undefined for ids that are not lowercase slugs, without reading any file", async () => {
    await fs.writeFile(
      path.join(projectRoot, "data", "outside.json"),
      JSON.stringify(makeRecipe({ id: "outside" })),
    );
    await writeRaw("Upper_Case.json", JSON.stringify(makeRecipe({ id: "upper-case" })));
    const { getRecipeById } = fixtureStore();

    await expect(getRecipeById("../outside")).resolves.toBeUndefined();
    await expect(getRecipeById("Upper_Case")).resolves.toBeUndefined();
    await expect(getRecipeById("")).resolves.toBeUndefined();
    // Reading Upper_Case.json would have warned about the id mismatch.
    expect(warnSpy).not.toHaveBeenCalled();
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
    const { getAllRecipes } = fixtureStore();

    await expect(getAllRecipes()).resolves.toEqual([b, a]);
  });

  it("ignores files whose names do not end in lowercase .json", async () => {
    await writeRecipe(makeRecipe({ id: "kept" }));
    await writeRaw(".DS_Store", "binary junk");
    await writeRaw("notes.txt", "not a recipe");
    await writeRaw("draft.json.bak", "{ not json");
    await writeRaw("SHOUTING.JSON", "{ not json");
    const { getAllRecipes } = fixtureStore();

    const result = await getAllRecipes();

    expect(result.map((r) => r.id)).toEqual(["kept"]);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("sorts by updatedAt, newest first, regardless of file name order", async () => {
    await writeRecipe(makeRecipe({ id: "a-oldest", updatedAt: "2025-01-01T00:00:00.000Z" }));
    await writeRecipe(makeRecipe({ id: "b-newest", updatedAt: "2026-06-01T00:00:00.000Z" }));
    await writeRecipe(makeRecipe({ id: "c-middle", updatedAt: "2025-09-01T00:00:00.000Z" }));
    const { getAllRecipes } = fixtureStore();

    const result = await getAllRecipes();

    expect(result.map((r) => r.id)).toEqual(["b-newest", "c-middle", "a-oldest"]);
  });

  it("sorts by parsed time, not by string order, so time zone offsets are respected", async () => {
    // As strings "2026-03-01..." > "2026-02-28...", but as instants 22:00Z is before 23:30Z.
    await writeRecipe(makeRecipe({ id: "offset", updatedAt: "2026-03-01T00:00:00+02:00" }));
    await writeRecipe(makeRecipe({ id: "utc", updatedAt: "2026-02-28T23:30:00Z" }));
    const { getAllRecipes } = fixtureStore();

    const result = await getAllRecipes();

    expect(result.map((r) => r.id)).toEqual(["utc", "offset"]);
  });

  it("ignores createdAt when sorting", async () => {
    // File names sort opposite to the expected result, so this cannot pass by directory order.
    await writeRecipe(makeRecipe({ id: "a-created-late", createdAt: "2026-12-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" }));
    await writeRecipe(makeRecipe({ id: "b-created-early", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2026-02-01T00:00:00Z" }));
    const { getAllRecipes } = fixtureStore();

    const result = await getAllRecipes();

    expect(result.map((r) => r.id)).toEqual(["b-created-early", "a-created-late"]);
  });

  it("breaks updatedAt ties by title in Greek alphabetical order, then by id", async () => {
    // File names sort differently from the expected result, so this cannot pass by directory order.
    await writeRecipe(makeRecipe({ id: "a-omega", title: "Ωραίο" }));
    await writeRecipe(makeRecipe({ id: "b-accent", title: "Άλλο" }));
    await writeRecipe(makeRecipe({ id: "d-same", title: "Βραστό" }));
    await writeRecipe(makeRecipe({ id: "c-same", title: "Βραστό" }));
    await writeRecipe(makeRecipe({ id: "e-newer", title: "Ωραίο", updatedAt: "2026-02-01T00:00:00.000Z" }));
    const { getAllRecipes } = fixtureStore();

    const result = await getAllRecipes();

    expect(result.map((r) => r.id)).toEqual(["e-newer", "b-accent", "c-same", "d-same", "a-omega"]);
  });

  it("returns an empty array for an empty directory, without logging", async () => {
    const { getAllRecipes } = fixtureStore();

    await expect(getAllRecipes()).resolves.toEqual([]);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("re-reads the directory on every call, with no caching", async () => {
    await writeRecipe(makeRecipe({ id: "first" }));
    const { getAllRecipes } = fixtureStore();

    const before = await getAllRecipes();
    await writeRecipe(makeRecipe({ id: "second" }));
    const after = await getAllRecipes();

    expect(before).toHaveLength(1);
    expect(after).toHaveLength(2);
  });

  it("skips a file that fails validation and warns once, naming the file and every problem", async () => {
    const good = makeRecipe({ id: "good" });
    await writeRecipe(good);
    await writeRaw("partial.json", JSON.stringify({ id: "partial", updatedAt: "2026-01-01T00:00:00Z", unexpected: true }));
    const { getAllRecipes } = fixtureStore();

    await expect(getAllRecipes()).resolves.toEqual([good]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/^Skipping recipe: .*partial\.json is not a valid recipe:/));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('unknown field "unexpected"'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("title must be a non-empty string"));
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("skips recipes whose updatedAt is missing or unparseable", async () => {
    await writeRecipe(makeRecipe({ id: "valid-date", updatedAt: "2026-01-01T00:00:00Z" }));
    await writeRecipe(makeRecipe({ id: "bad-date", updatedAt: "not a date" }));
    const noDate: Partial<Recipe> = makeRecipe({ id: "no-date" });
    delete noDate.updatedAt;
    await writeRaw("no-date.json", JSON.stringify(noDate));
    const { getAllRecipes } = fixtureStore();

    const result = await getAllRecipes();

    expect(result.map((r) => r.id)).toEqual(["valid-date"]);
    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("skips a file whose id differs from its file name, so no link points to a missing page", async () => {
    await writeRecipe(makeRecipe({ id: "good" }));
    await writeRaw("alpha.json", JSON.stringify(makeRecipe({ id: "beta" })));
    const { getAllRecipes } = fixtureStore();

    await expect(getAllRecipes()).resolves.toEqual([makeRecipe({ id: "good" })]);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('id "beta" must match filename "alpha"'));
  });

  it("declares Recipe-typed signatures (checked by npm run typecheck)", () => {
    expectTypeOf(createRecipeStore).parameters.toEqualTypeOf<[dir: string]>();
    expectTypeOf(createRecipeStore).returns.toEqualTypeOf<RecipeStore>();
    expectTypeOf(getRecipeIds).parameters.toEqualTypeOf<[]>();
    expectTypeOf(getRecipeIds).returns.resolves.toEqualTypeOf<string[]>();
    expectTypeOf(getAllRecipes).parameters.toEqualTypeOf<[]>();
    expectTypeOf(getAllRecipes).returns.resolves.toEqualTypeOf<Recipe[]>();
    expectTypeOf(getRecipeById).parameters.toEqualTypeOf<[id: string]>();
    expectTypeOf(getRecipeById).returns.resolves.toEqualTypeOf<Recipe | undefined>();
  });
});

describe("getRecipeIds", () => {
  it("returns the ids of the loaded recipes, in the same order, leaving out skipped files", async () => {
    await writeRecipe(makeRecipe({ id: "older", updatedAt: "2025-01-01T00:00:00.000Z" }));
    await writeRecipe(makeRecipe({ id: "newer", updatedAt: "2026-01-01T00:00:00.000Z" }));
    await writeRaw("broken.json", "{ not json");
    const { getRecipeIds } = fixtureStore();

    await expect(getRecipeIds()).resolves.toEqual(["newer", "older"]);
  });
});

describe("default store", () => {
  it("resolves data/recipes from process.cwd() on each call, not when the module is imported", async () => {
    await writeRecipe(makeRecipe({ id: "from-fixture" }));
    vi.spyOn(process, "cwd").mockReturnValue(projectRoot);

    await expect(getRecipeIds()).resolves.toEqual(["from-fixture"]);
    await expect(getRecipeById("from-fixture")).resolves.toMatchObject({ id: "from-fixture" });
  });
});

describe("real data in data/recipes", () => {
  it("returns exactly one recipe per .json file in data/recipes", async () => {
    const ids = await realRecipeIds();
    const recipes = await getAllRecipes();

    expect(ids.length).toBeGreaterThan(0);
    expect(recipes.map((r) => r.id).sort()).toEqual([...ids].sort());
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  // Note: today all real recipes share one updatedAt value, so this passes trivially and the
  // rendered order comes from the title and id tie-breaks. The fixture sort tests above are
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
    const { getRecipeById } = fixtureStore();

    await expect(getRecipeById("does-not-exist")).resolves.toBeUndefined();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("returns undefined and warns when the file contains invalid JSON", async () => {
    await writeRaw("broken.json", '{ "id": "broken", ');
    const { getRecipeById } = fixtureStore();

    await expect(getRecipeById("broken")).resolves.toBeUndefined();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/broken\.json is not a valid recipe:\n {2}- invalid JSON: /));
  });

  it("returns undefined and warns when the file is empty", async () => {
    await writeRaw("empty.json", "");
    const { getRecipeById } = fixtureStore();

    await expect(getRecipeById("empty")).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("invalid JSON"));
  });

  it("returns undefined when data/recipes does not exist, without logging", async () => {
    await fs.rm(recipesDir, { recursive: true });
    const { getRecipeById } = fixtureStore();

    await expect(getRecipeById("anything")).resolves.toBeUndefined();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("returns undefined and warns when <id>.json is a directory", async () => {
    await fs.mkdir(path.join(recipesDir, "folder.json"));
    const { getRecipeById } = fixtureStore();

    await expect(getRecipeById("folder")).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("could not be read: EISDIR"));
  });

  it("returns undefined and warns for valid JSON that is not a recipe object, such as null or an array", async () => {
    await writeRaw("null.json", "null");
    await writeRaw("array.json", "[1, 2, 3]");
    const { getRecipeById } = fixtureStore();

    await expect(getRecipeById("null")).resolves.toBeUndefined();
    await expect(getRecipeById("array")).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("top-level value must be an object"));
  });
});

describe("missing or invalid data: getAllRecipes", () => {
  it("returns [] and logs once when data/recipes does not exist", async () => {
    await fs.rm(recipesDir, { recursive: true });
    const { getAllRecipes } = fixtureStore();

    await expect(getAllRecipes()).resolves.toEqual([]);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(LOG_MESSAGE, expect.objectContaining({ code: "ENOENT" }));
  });

  it("skips a file with invalid JSON, keeps the other recipes, and warns once", async () => {
    await writeRecipe(makeRecipe({ id: "good-1" }));
    await writeRecipe(makeRecipe({ id: "good-2" }));
    await writeRaw("broken.json", '{ "id": "broken", ');
    const { getAllRecipes } = fixtureStore();

    await expect(getAllRecipes()).resolves.toEqual([makeRecipe({ id: "good-1" }), makeRecipe({ id: "good-2" })]);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/broken\.json is not a valid recipe:\n {2}- invalid JSON: /));
  });

  it("skips an empty .json file and keeps the other recipes", async () => {
    await writeRecipe(makeRecipe({ id: "good" }));
    await writeRaw("empty.json", "");
    const { getAllRecipes } = fixtureStore();

    await expect(getAllRecipes()).resolves.toEqual([makeRecipe({ id: "good" })]);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("empty.json is not a valid recipe"));
  });

  it("skips a directory whose name ends in .json and keeps the other recipes", async () => {
    await writeRecipe(makeRecipe({ id: "good" }));
    await fs.mkdir(path.join(recipesDir, "folder.json"));
    const { getAllRecipes } = fixtureStore();

    await expect(getAllRecipes()).resolves.toEqual([makeRecipe({ id: "good" })]);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("could not be read: EISDIR"));
  });

  it("skips a lone null file and returns []", async () => {
    await writeRaw("null.json", "null");
    const { getAllRecipes } = fixtureStore();

    await expect(getAllRecipes()).resolves.toEqual([]);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("top-level value must be an object"));
  });

  it("skips a null file next to a real recipe and keeps the recipe", async () => {
    await writeRecipe(makeRecipe({ id: "good" }));
    await writeRaw("null.json", "null");
    const { getAllRecipes } = fixtureStore();

    await expect(getAllRecipes()).resolves.toEqual([makeRecipe({ id: "good" })]);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("a broken file is skipped by getAllRecipes and does not affect getRecipeById for other ids", async () => {
    await writeRecipe(makeRecipe({ id: "good" }));
    await writeRaw("broken.json", "{ not json");
    const { getAllRecipes, getRecipeById } = fixtureStore();

    await expect(getAllRecipes()).resolves.toEqual([makeRecipe({ id: "good" })]);
    await expect(getRecipeById("good")).resolves.toMatchObject({ id: "good" });
  });
});
