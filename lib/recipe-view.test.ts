import { describe, expect, it } from "vitest";
import {
  CATEGORY_FALLBACK,
  categoryColorIndex,
  categoryLabel,
  compareRecipes,
  formatIngredientCount,
  formatRecipeDate,
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
  it("uses one fallback category everywhere", () => {
    expect(CATEGORY_FALLBACK).toBe("Άλλο");
  });

  it("returns the recipe's category when it has one", () => {
    expect(categoryLabel({ category: "Της Γιαγιάς" })).toBe("Της Γιαγιάς");
  });

  it("falls back for a recipe with no category", () => {
    expect(categoryLabel({})).toBe("Άλλο");
    expect(categoryLabel({ category: undefined })).toBe("Άλλο");
  });

  it("formats an ingredient count as 'N υλικά'", () => {
    expect(formatIngredientCount(12)).toBe("12 υλικά");
  });

  it("uses the plural label for every count, including 1 and 0 (current behavior)", () => {
    expect(formatIngredientCount(1)).toBe("1 υλικά");
    expect(formatIngredientCount(0)).toBe("0 υλικά");
  });
});

describe("formatRecipeDate", () => {
  it("formats an ISO timestamp in Greek", () => {
    expect(formatRecipeDate("2026-08-10T16:52:28.199Z")).toBe("10 Αυγ 2026");
    expect(formatRecipeDate("2026-01-02T09:00:00.000Z")).toBe("2 Ιαν 2026");
  });

  it("uses Europe/Athens rather than the build machine's time zone", () => {
    // 22:30 UTC on 31 December is already 1 January in Athens.
    expect(formatRecipeDate("2025-12-31T22:30:00.000Z")).toBe("1 Ιαν 2026");
  });

  it("accepts any timestamp Date.parse understands", () => {
    expect(formatRecipeDate("2026-08-10")).toBe("10 Αυγ 2026");
  });

  it("returns the input unchanged when it cannot be parsed", () => {
    expect(formatRecipeDate("not a date")).toBe("not a date");
    expect(formatRecipeDate("")).toBe("");
  });
});

describe("categoryColorIndex", () => {
  const CATEGORIES = [
    "Οι ντελικάτες της Μαμάς",
    "Μικρές στο μάτι , Μεγάλες στο τραπέζι",
    "Από Χαραλαμπρούδη",
    "Αέρας Νάπολης της Θείας",
    "Του Μπαμπούλα (που δεν είναι μόνο ψάρια)",
    "Της Γιαγιάς που γεμίζουν κοιλίτσες και καρδιές",
  ];

  // components/recipe-card.tsx has 7 gradients.
  const BUCKETS = 7;

  it("returns the same index for the same label", () => {
    expect(categoryColorIndex("Της Γιαγιάς", BUCKETS)).toBe(categoryColorIndex("Της Γιαγιάς", BUCKETS));
  });

  it("returns an index inside the range", () => {
    for (const category of [...CATEGORIES, CATEGORY_FALLBACK, ""]) {
      const index = categoryColorIndex(category, BUCKETS);
      expect(index, category).toBeGreaterThanOrEqual(0);
      expect(index, category).toBeLessThan(BUCKETS);
    }
  });

  // Distinct colours are not guaranteed for any set of labels, but they hold for the six
  // categories in data/recipes today. CATEGORY_FALLBACK shares a bucket with one of them,
  // which no page shows because every recipe has a category. If this fails after a category
  // is renamed or added, two categories share a colour: a look problem rather than a bug.
  it("gives each of today's categories its own colour", () => {
    const indexes = CATEGORIES.map((category) => categoryColorIndex(category, BUCKETS));

    expect(new Set(indexes).size).toBe(CATEGORIES.length);
  });

  it("does not depend on the order categories appear in", () => {
    const forward = CATEGORIES.map((category) => categoryColorIndex(category, BUCKETS));
    const backward = [...CATEGORIES].reverse().map((category) => categoryColorIndex(category, BUCKETS));

    expect(backward).toEqual([...forward].reverse());
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

  it("breaks ties by title in Greek alphabetical order, not by code unit", () => {
    // By code unit the order would be Ά, Γ, Ω, β.
    const recipes = ["Ωραίο", "Άλλο", "βραστό", "Γεμιστά"].map((title, i) => makeRecipe({ id: `r${i}`, title }));

    expect(sortIds(recipes).map((id) => recipes.find((r) => r.id === id)?.title)).toEqual([
      "Άλλο",
      "βραστό",
      "Γεμιστά",
      "Ωραίο",
    ]);
  });

  it("breaks ties between equal titles by id, so the result does not depend on input order", () => {
    const b = makeRecipe({ id: "ela-moy-nte-2", title: "Έλα μου ντε???" });
    const a = makeRecipe({ id: "ela-moy-nte-1", title: "Έλα μου ντε???" });

    expect(compareRecipes(a, b)).toBeLessThan(0);
    expect(compareRecipes(b, a)).toBeGreaterThan(0);
    expect(sortIds([b, a])).toEqual(["ela-moy-nte-1", "ela-moy-nte-2"]);
    expect(sortIds([a, b])).toEqual(["ela-moy-nte-1", "ela-moy-nte-2"]);
  });

  it("returns 0 only for the same updatedAt, title, and id", () => {
    expect(compareRecipes(makeRecipe({ id: "same" }), makeRecipe({ id: "same" }))).toBe(0);
  });

  it("treats an unparseable timestamp as a tie and falls back to the title", () => {
    const valid = makeRecipe({ id: "valid", title: "Β", updatedAt: "2026-06-01T00:00:00.000Z" });
    const invalid = makeRecipe({ id: "invalid", title: "Α", updatedAt: "not a date" });

    expect(compareRecipes(valid, invalid)).toBeGreaterThan(0);
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
