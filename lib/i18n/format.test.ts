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

  it("uses the plural form for categories other than one, such as Italian's 'many' for a million", () => {
    expect(formatCount("it", { one: "{count} ricetta", other: "{count} ricette" }, 1_000_000)).toBe("1000000 ricette");
  });
});
