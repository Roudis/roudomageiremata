/**
 * Tests for lib/recipe-search.ts. Like lib/recipes.test.ts, tests named
 * "(current behavior)" lock down quirks that a later step is expected to change.
 */
import { describe, expect, it } from "vitest";
import { filterRecipes, getCategories, normalizeSearchText, type SearchableRecipe } from "@/lib/recipe-search";

type Fixture = SearchableRecipe & { id: string };

function makeRecipe(overrides: Partial<Fixture> & Pick<Fixture, "id">): Fixture {
  return {
    title: `Title of ${overrides.id}`,
    description: `Description of ${overrides.id}`,
    ingredients: [],
    ...overrides,
  };
}

// Titles and categories modelled on real entries in data/recipes.
const carbonara = makeRecipe({
  id: "karmponara",
  title: "Η ΚΑΡΜΠΟΝΑΡΑ",
  description: "Η αυθεντική, χωρίς κρέμα",
  ingredients: ["Σπαγγέτι", "Guanciale", "Κρόκοι αυγών"],
  category: "Αέρας Νάπολης της Θείας",
});
const tsipoura = makeRecipe({
  id: "tsipoura",
  title: "Η ΤΣΙΠΟΥΡΑ",
  description: "Ψητή στα κάρβουνα",
  ingredients: ["Τσιπούρα", "Λεμόνι"],
  category: "Του Μπαμπούλα (που δεν είναι μόνο ψάρια)",
});
const patates = makeRecipe({
  id: "patates",
  title: "ΟΙ ΠΙΟ ΣΟΑΒΡΕΣ ΠΑΤΑΤΕΣ",
  description: "Τραγανές πατάτες φούρνου",
  ingredients: ["Πατάτες", "Ρίγανη"],
  category: "Της Γιαγιάς που γεμίζουν κοιλίτσες και καρδιές",
});
const uncategorized = makeRecipe({
  id: "no-category",
  title: "Κάτι ξεχνάω",
  description: "Χωρίς κατηγορία",
  ingredients: ["Αλάτι"],
});

const all = [carbonara, tsipoura, patates, uncategorized];
const ids = (recipes: readonly Fixture[]) => recipes.map((r) => r.id);
const search = (query: string, category: string | null = null) => ids(filterRecipes(all, { query, category }));

describe("filterRecipes: search", () => {
  it("returns every recipe, in order, for an empty query and no category", () => {
    expect(search("")).toEqual(["karmponara", "tsipoura", "patates", "no-category"]);
  });

  it("matches the title, ignoring case", () => {
    expect(search("καρμποναρα")).toEqual(["karmponara"]);
    expect(search("ΚαΡμΠοΝαΡα")).toEqual(["karmponara"]);
  });

  it("matches the description", () => {
    expect(search("κάρβουνα")).toEqual(["tsipoura"]);
  });

  it("matches an ingredient", () => {
    expect(search("guanciale")).toEqual(["karmponara"]);
    expect(search("ρίγανη")).toEqual(["patates"]);
  });

  it("matches substrings inside words", () => {
    expect(search("μπον")).toEqual(["karmponara"]);
  });

  it("returns the same objects it was given, without copying", () => {
    expect(filterRecipes(all, { query: "τσιπουρα", category: null })[0]).toBe(tsipoura);
  });

  it("ignores accents, so 'καρμπονάρα' finds the unaccented 'Η ΚΑΡΜΠΟΝΑΡΑ'", () => {
    expect(search("καρμπονάρα")).toEqual(["karmponara"]);
    expect(ids(filterRecipes([{ ...tsipoura, ingredients: [] }], { query: "τσιπούρα", category: null }))).toEqual([
      "tsipoura",
    ]);
  });

  it("ignores accents in both directions, in the title and in the body", () => {
    const titleOnly = { ...patates, description: "", ingredients: [] };
    const bodyOnly = { ...patates, title: "" };

    for (const query of ["πατατες", "πατάτες"]) {
      expect(ids(filterRecipes([titleOnly], { query, category: null })), query).toEqual(["patates"]);
      expect(ids(filterRecipes([bodyOnly], { query, category: null })), query).toEqual(["patates"]);
    }
  });

  it("treats final sigma 'ς' and 'σ' as the same letter", () => {
    expect(search("πατατες")).toEqual(["patates"]);
    expect(search("πατατεσ")).toEqual(["patates"]);
  });

  it("does not trim the query, so surrounding spaces must appear in the text (current behavior)", () => {
    expect(search(" καρμποναρα")).toEqual(["karmponara"]);
    expect(search("καρμποναρα ")).toEqual([]);
  });

  it("does not search the category (current behavior)", () => {
    expect(search("νάπολης")).toEqual([]);
  });
});

describe("filterRecipes: category", () => {
  it("keeps only recipes in the selected category", () => {
    expect(search("", "Αέρας Νάπολης της Θείας")).toEqual(["karmponara"]);
  });

  it("lists uncategorized recipes under 'Άλλο'", () => {
    expect(search("", "Άλλο")).toEqual(["no-category"]);
  });

  it("requires both the query and the category to match", () => {
    expect(search("η", "Αέρας Νάπολης της Θείας")).toEqual(["karmponara"]);
    expect(search("τσιπουρα", "Αέρας Νάπολης της Θείας")).toEqual([]);
  });

  it("compares categories exactly, including case", () => {
    expect(search("", "αέρας νάπολης της θείας")).toEqual([]);
  });

  it("treats an empty-string category like no category (current behavior)", () => {
    expect(search("", "")).toEqual(ids(all));
  });

  it("does not mutate the input array", () => {
    const input = [...all];

    filterRecipes(input, { query: "καρμποναρα", category: null });

    expect(input).toEqual(all);
  });
});

describe("normalizeSearchText", () => {
  it("lowercases, strips accents, and folds final sigma", () => {
    expect(normalizeSearchText("Η ΚΑΡΜΠΟΝΑΡΑ")).toBe("η καρμποναρα");
    expect(normalizeSearchText("Καρμπονάρα")).toBe("καρμποναρα");
    expect(normalizeSearchText("ΠΑΤΑΤΕΣ")).toBe("πατατεσ");
    expect(normalizeSearchText("πατάτες")).toBe("πατατεσ");
  });

  it("strips the diaeresis too", () => {
    expect(normalizeSearchText("ΟΪΣΤΡΟΣ")).toBe("οιστροσ");
    expect(normalizeSearchText("ρολόι")).toBe("ρολοι");
  });

  it("leaves Latin text and punctuation alone apart from case", () => {
    expect(normalizeSearchText("Guanciale (100g)")).toBe("guanciale (100g)");
  });

  it("does not trim whitespace", () => {
    expect(normalizeSearchText("  πατάτες ")).toBe("  πατατεσ ");
  });
});

describe("getCategories", () => {
  it("returns each category once", () => {
    const duplicate = makeRecipe({ id: "second-carbonara", category: carbonara.category });

    expect(getCategories([carbonara, duplicate])).toEqual(["Αέρας Νάπολης της Θείας"]);
  });

  it("adds 'Άλλο' when a recipe has no category", () => {
    expect(getCategories(all)).toEqual([
      "Άλλο",
      "Αέρας Νάπολης της Θείας",
      "Της Γιαγιάς που γεμίζουν κοιλίτσες και καρδιές",
      "Του Μπαμπούλα (που δεν είναι μόνο ψάρια)",
    ]);
  });

  it("sorts by UTF-16 code unit rather than Greek collation, so accented and lowercase letters sort late (current behavior)", () => {
    const categories = ["γλυκά", "Ώρα", "Ψάρια", "Βραδινά"].map((category, i) => makeRecipe({ id: `c${i}`, category }));

    expect(getCategories(categories)).toEqual(["Ώρα", "Βραδινά", "Ψάρια", "γλυκά"]);
  });

  it("returns an empty list for no recipes", () => {
    expect(getCategories([])).toEqual([]);
  });
});
