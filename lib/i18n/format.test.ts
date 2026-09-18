import { describe, expect, it } from "vitest";
import { formatCount } from "@/lib/i18n/format";

const recipes = { one: "{count} recipe", other: "{count} recipes" };

describe("formatCount", () => {
  it("uses the singular form for 1 and the plural otherwise", () => {
    expect(formatCount("en", recipes, 1)).toBe("1 recipe");
    expect(formatCount("en", recipes, 0)).toBe("0 recipes");
    expect(formatCount("en", recipes, 30)).toBe("30 recipes");
  });

  it("follows each language's plural rules: French treats 0 as singular", () => {
    const recettes = { one: "{count} recette", other: "{count} recettes" };

    expect(formatCount("fr", recettes, 0)).toBe("0 recette");
    expect(formatCount("fr", recettes, 2)).toBe("2 recettes");
  });

  it("uses the few form where the language has one: Czech for 2 to 4, Romanian for 0 and 2 to 19", () => {
    const recepty = { one: "{count} recept", few: "{count} recepty", other: "{count} receptů" };
    const retete = { one: "{count} rețetă", few: "{count} rețete", other: "{count} de rețete" };

    expect([1, 3, 5, 22].map((count) => formatCount("cs", recepty, count))).toEqual([
      "1 recept",
      "3 recepty",
      "5 receptů",
      "22 receptů",
    ]);
    expect([0, 1, 19, 20, 101].map((count) => formatCount("ro", retete, count))).toEqual([
      "0 rețete",
      "1 rețetă",
      "19 rețete",
      "20 de rețete",
      "101 rețete",
    ]);
  });

  it("falls back to the plural form when a few form is missing", () => {
    expect(formatCount("cs", { one: "{count} recept", other: "{count} receptů" }, 3)).toBe("3 receptů");
  });

  it("uses the plural form for categories other than one, such as Italian's 'many' for a million", () => {
    expect(formatCount("it", { one: "{count} ricetta", other: "{count} ricette" }, 1_000_000)).toBe("1000000 ricette");
  });
});
