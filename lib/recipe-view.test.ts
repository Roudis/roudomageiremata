import { describe, expect, it } from "vitest";
import {
  DISPLAY_CATEGORY_FALLBACK,
  FILTER_CATEGORY_FALLBACK,
  compareRecipes,
  formatIngredientCount,
  toRecipeSummary,
} from "@/lib/recipe-view";
import type { Recipe } from "@/types/recipe";

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

describe("labels and fallbacks", () => {
  it("keeps today's two different category fallbacks until step 3.5 unifies them (current behavior)", () => {
    expect(DISPLAY_CATEGORY_FALLBACK).toBe("Αγαπημενο της Οικογενειας");
    expect(FILTER_CATEGORY_FALLBACK).toBe("Άλλο");
  });

  it("formats an ingredient count as 'N υλικά'", () => {
    expect(formatIngredientCount(12)).toBe("12 υλικά");
  });

  it("uses the plural label for every count, including 1 and 0 (current behavior)", () => {
    expect(formatIngredientCount(1)).toBe("1 υλικά");
    expect(formatIngredientCount(0)).toBe("0 υλικά");
  });
});

describe("compareRecipes", () => {
  const sortIds = (recipes: Recipe[]) => [...recipes].sort(compareRecipes).map((r) => r.id);

  it("sorts by updatedAt, newest first", () => {
    const recipes = [
      makeRecipe({ id: "oldest", updatedAt: "2025-01-01T00:00:00.000Z" }),
      makeRecipe({ id: "newest", updatedAt: "2026-06-01T00:00:00.000Z" }),
      makeRecipe({ id: "middle", updatedAt: "2025-09-01T00:00:00.000Z" }),
    ];

    expect(sortIds(recipes)).toEqual(["newest", "middle", "oldest"]);
  });

  it("compares parsed instants, so time zone offsets are respected", () => {
    const offset = makeRecipe({ id: "offset", updatedAt: "2026-03-01T00:00:00+02:00" });
    const utc = makeRecipe({ id: "utc", updatedAt: "2026-02-28T23:30:00Z" });

    expect(compareRecipes(offset, utc)).toBeGreaterThan(0);
    expect(sortIds([offset, utc])).toEqual(["utc", "offset"]);
  });

  it("ignores createdAt", () => {
    const createdLate = makeRecipe({ id: "created-late", createdAt: "2026-12-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" });
    const createdEarly = makeRecipe({ id: "created-early", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2026-02-01T00:00:00Z" });

    expect(sortIds([createdLate, createdEarly])).toEqual(["created-early", "created-late"]);
  });

  it("returns 0 for equal timestamps, with no tie-break by title or id (current behavior)", () => {
    const b = makeRecipe({ id: "b", title: "Β" });
    const a = makeRecipe({ id: "a", title: "Α" });

    expect(compareRecipes(b, a)).toBe(0);
    expect(compareRecipes(a, b)).toBe(0);
    expect(sortIds([b, a])).toEqual(["b", "a"]);
  });

  it("returns NaN when a timestamp is unparseable (current behavior)", () => {
    const valid = makeRecipe({ id: "valid" });
    const invalid = makeRecipe({ id: "invalid", updatedAt: "not a date" });

    expect(compareRecipes(valid, invalid)).toBeNaN();
  });
});

describe("toRecipeSummary", () => {
  it("keeps the fields the list renders and drops steps, memory, cookTime, and timestamps", () => {
    const recipe = makeRecipe({
      id: "gemista",
      title: "Τα καημένα γεμιστά",
      description: "Γεμιστά της γιαγιάς",
      ingredients: ["ντομάτες", "ρύζι"],
      steps: ["Γέμισε", "Ψήσε"],
      memory: { title: "Κυριακή", story: "Στην κουζίνα της γιαγιάς", date: "1998" },
      imageUrl: "/images/recipes/gemista.jpg",
      category: "Της Γιαγιάς",
      prepTime: "20 λεπτά",
      cookTime: "60 λεπτά",
      servings: 4,
    });

    expect(toRecipeSummary(recipe)).toStrictEqual({
      id: "gemista",
      title: "Τα καημένα γεμιστά",
      description: "Γεμιστά της γιαγιάς",
      ingredients: ["ντομάτες", "ρύζι"],
      imageUrl: "/images/recipes/gemista.jpg",
      category: "Της Γιαγιάς",
      prepTime: "20 λεπτά",
      servings: 4,
      hasMemory: true,
    });
  });

  it("leaves missing optional fields absent instead of setting them to undefined", () => {
    const summary = toRecipeSummary(makeRecipe({ id: "minimal" }));

    expect(summary).toStrictEqual({
      id: "minimal",
      title: "Title of minimal",
      description: "Description of minimal",
      ingredients: ["ingredient"],
      hasMemory: false,
    });
    expect(Object.keys(summary)).not.toContain("imageUrl");
  });

  it("keeps zero servings, which the card's truthiness check hides today", () => {
    expect(toRecipeSummary(makeRecipe({ id: "zero", servings: 0 })).servings).toBe(0);
  });

  it("does not mutate the recipe", () => {
    const recipe = makeRecipe({ id: "frozen", memory: { title: "t", story: "s" } });
    const copy = structuredClone(recipe);

    toRecipeSummary(recipe);

    expect(recipe).toStrictEqual(copy);
  });
});
