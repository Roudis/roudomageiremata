import { describe, expect, expectTypeOf, it } from "vitest";
import {
  RecipeDataError,
  isRecipeId,
  parseRecipe,
  type ParseRecipeOptions,
  type RecipeDataIssue,
} from "@/lib/recipe-schema";
import type { Recipe } from "@/types/recipe";

const SOURCE = "data/recipes/gemista.json";

function validRecipe(): Record<string, unknown> {
  return {
    id: "gemista",
    title: "Τα καημένα γεμιστά",
    description: "Γεμιστά της γιαγιάς",
    ingredients: ["ντομάτες", "ρύζι"],
    steps: ["Γέμισε", "Ψήσε"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function fullRecipe(): Record<string, unknown> {
  return {
    ...validRecipe(),
    memory: { title: "Κυριακή", story: "Στην κουζίνα της γιαγιάς", date: "1998" },
    imageUrl: "/images/recipes/gemista.jpg",
    category: "Της Γιαγιάς",
    prepTime: "20 λεπτά",
    cookTime: "60 λεπτά",
    servings: 4,
  };
}

/** Runs parseRecipe and returns the issues it throws, or [] if it accepts the value. */
function issuesFor(value: unknown, options?: ParseRecipeOptions): RecipeDataIssue[] {
  try {
    parseRecipe(value, SOURCE, options);
    return [];
  } catch (error) {
    if (!(error instanceof RecipeDataError)) throw error;
    return [...error.issues];
  }
}

const fieldsOf = (value: unknown) => issuesFor(value).map((issue) => issue.field);

describe("parseRecipe: valid data", () => {
  it("returns the same object for a recipe with only required fields", () => {
    const value = validRecipe();

    expect(parseRecipe(value, SOURCE)).toBe(value);
  });

  it("accepts every optional field", () => {
    const value = fullRecipe();

    expect(parseRecipe(value, SOURCE)).toBe(value);
  });

  it("accepts a memory without a date", () => {
    expect(fieldsOf({ ...validRecipe(), memory: { title: "t", story: "s" } })).toEqual([]);
  });

  it("accepts timestamps that Date.parse understands, not only ISO strings", () => {
    expect(fieldsOf({ ...validRecipe(), createdAt: "August 10, 2026", updatedAt: "2026-08-10" })).toEqual([]);
  });

  it("does not compare the id with the source file name unless expectedId is given", () => {
    expect(parseRecipe(validRecipe(), "data/recipes/something-else.json")).toMatchObject({ id: "gemista" });
  });

  it("accepts an id equal to expectedId", () => {
    expect(issuesFor(validRecipe(), { expectedId: "gemista" })).toEqual([]);
  });

  it("does not check that imageUrl exists on disk, which is left to the caller", () => {
    expect(fieldsOf({ ...validRecipe(), imageUrl: "/images/recipes/missing.jpg" })).toEqual([]);
  });

  it("is typed to return a Recipe (checked by npm run typecheck)", () => {
    expectTypeOf(parseRecipe).parameters.toEqualTypeOf<[value: unknown, source: string, options?: ParseRecipeOptions]>();
    expectTypeOf(parseRecipe).returns.toEqualTypeOf<Recipe>();
  });
});

describe("parseRecipe: invalid data", () => {
  it.each([
    ["null", null],
    ["an array", [validRecipe()]],
    ["a string", "gemista"],
    ["a number", 4],
    ["undefined", undefined],
  ])("rejects %s as the top-level value", (_label, value) => {
    expect(issuesFor(value)).toEqual([{ field: "", message: "top-level value must be an object" }]);
  });

  it.each(["id", "title", "description", "ingredients", "steps", "createdAt", "updatedAt"])(
    "rejects a recipe missing required field %s",
    (field) => {
      const value = validRecipe();
      delete value[field];

      expect(fieldsOf(value)).toEqual([field]);
    },
  );

  it.each([
    ["an uppercase letter", "Gemista"],
    ["an underscore", "gemista_2"],
    ["a leading hyphen", "-gemista"],
    ["a double hyphen", "gemista--2"],
    ["Greek letters", "γεμιστά"],
    ["a path segment", "../gemista"],
    ["an empty string", ""],
    ["a number", 7],
  ])("rejects an id with %s", (_label, id) => {
    expect(issuesFor({ ...validRecipe(), id })).toEqual([{ field: "id", message: "id must be a lowercase-hyphen slug" }]);
  });

  it("rejects an id that differs from expectedId, alongside other problems", () => {
    expect(issuesFor({ ...validRecipe(), id: "beta", title: "" }, { expectedId: "alpha" })).toEqual([
      { field: "id", message: 'id "beta" must match filename "alpha"' },
      { field: "title", message: "title must be a non-empty string" },
    ]);
  });

  it("reports both problems when the id is missing and expectedId is given", () => {
    const value = validRecipe();
    delete value.id;

    expect(issuesFor(value, { expectedId: "gemista" })).toEqual([
      { field: "id", message: "id must be a lowercase-hyphen slug" },
      { field: "id", message: 'id "undefined" must match filename "gemista"' },
    ]);
  });

  it.each([
    ["empty", ""],
    ["whitespace only", "   "],
    ["not a string", 42],
  ])("rejects a title that is %s", (_label, title) => {
    expect(issuesFor({ ...validRecipe(), title })).toEqual([
      { field: "title", message: "title must be a non-empty string" },
    ]);
  });

  it.each([
    ["empty", []],
    ["contains an empty string", ["ντομάτες", ""]],
    ["contains a number", ["ντομάτες", 2]],
    ["a string", "ντομάτες"],
  ])("rejects ingredients and steps when the array is %s", (_label, list) => {
    expect(fieldsOf({ ...validRecipe(), ingredients: list, steps: list })).toEqual(["ingredients", "steps"]);
  });

  it("rejects unparseable timestamps", () => {
    expect(fieldsOf({ ...validRecipe(), createdAt: "not a date", updatedAt: 1754844748199 })).toEqual([
      "createdAt",
      "updatedAt",
    ]);
  });

  it.each(["category", "prepTime", "cookTime"])("rejects %s when present but blank, null, or not a string", (field) => {
    for (const bad of ["", "  ", null, 20]) {
      expect(issuesFor({ ...validRecipe(), [field]: bad }), JSON.stringify(bad)).toEqual([
        { field, message: `${field} must be a non-empty string when present` },
      ]);
    }
  });

  it.each([
    ["zero", 0],
    ["negative", -2],
    ["fractional", 2.5],
    ["a numeric string", "4"],
    ["null", null],
  ])("rejects servings that are %s", (_label, servings) => {
    expect(issuesFor({ ...validRecipe(), servings })).toEqual([
      { field: "servings", message: "servings must be a positive integer when present" },
    ]);
  });

  it.each([
    ["null", null],
    ["an array", []],
    ["a string", "Κυριακή"],
  ])("rejects a memory that is %s", (_label, memory) => {
    expect(fieldsOf({ ...validRecipe(), memory })).toEqual(["memory"]);
  });

  it("rejects a memory with missing, blank, or unknown fields", () => {
    const memory = { story: "  ", date: "", mood: "happy" };

    expect(issuesFor({ ...validRecipe(), memory })).toEqual([
      { field: "memory.mood", message: 'unknown memory field "mood"' },
      { field: "memory.title", message: "memory.title must be a non-empty string" },
      { field: "memory.story", message: "memory.story must be a non-empty string" },
      { field: "memory.date", message: "memory.date must be a non-empty string when present" },
    ]);
  });

  it.each([
    ["relative", "images/recipes/gemista.jpg"],
    ["a full URL", "https://example.com/gemista.jpg"],
    ["empty", ""],
    ["not a string", 1],
  ])("rejects an imageUrl that is %s", (_label, imageUrl) => {
    expect(fieldsOf({ ...validRecipe(), imageUrl })).toEqual(["imageUrl"]);
  });

  it("rejects unknown top-level fields", () => {
    expect(issuesFor({ ...validRecipe(), rating: 5 })).toEqual([
      { field: "rating", message: 'unknown field "rating" (update types/recipe.ts and lib/recipe-schema.ts if intentional)' },
    ]);
  });

  it("rejects an own __proto__ key from JSON.parse as an unknown field", () => {
    const value: unknown = JSON.parse(JSON.stringify(validRecipe()).replace("{", '{"__proto__":{},'));

    expect(fieldsOf(value)).toEqual(["__proto__"]);
  });
});

describe("RecipeDataError", () => {
  it("reports every problem at once, not only the first", () => {
    const value = { ...fullRecipe(), id: "Bad Id", title: "", servings: 0, extra: true };

    expect(fieldsOf(value)).toEqual(["extra", "id", "title", "servings"]);
  });

  it("names the source and lists each problem in its message", () => {
    let caught: unknown;
    try {
      parseRecipe({ ...validRecipe(), title: "", servings: 0 }, SOURCE);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(RecipeDataError);
    expect(caught).toBeInstanceOf(Error);
    expect(caught).toMatchObject({
      name: "RecipeDataError",
      source: SOURCE,
      message: [
        "data/recipes/gemista.json is not a valid recipe:",
        "  - title must be a non-empty string",
        "  - servings must be a positive integer when present",
      ].join("\n"),
    });
  });
});

describe("isRecipeId", () => {
  it.each(["gemista", "ela-moy-nte-1", "a", "123"])("accepts %s", (id) => {
    expect(isRecipeId(id)).toBe(true);
  });

  it.each(["", "Gemista", "gemista_2", "-gemista", "gemista-", "gemista--2", "../gemista", "gemista.json", "γεμιστά"])(
    "rejects %j",
    (id) => {
      expect(isRecipeId(id)).toBe(false);
    },
  );

  it("rejects values that are not strings", () => {
    expect(isRecipeId(7)).toBe(false);
    expect(isRecipeId(null)).toBe(false);
  });
});
