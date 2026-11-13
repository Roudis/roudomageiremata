import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  KEY_ORDER,
  brokenTranslations,
  buildRecipe,
  dropBrokenTranslations,
  greekTextChanged,
  readForm,
  recipeIssues,
} from "./recipe-input";

const NOW = new Date("2026-11-13T10:00:00.000Z");

const form = (fields: Record<string, unknown> = {}) =>
  readForm({
    title: "Φασολάδα",
    description: "Η φασολάδα της Κυριακής.",
    ingredients: ["500 γρ. φασόλια", "1 κρεμμύδι"],
    steps: ["Μουλιάζουμε τα φασόλια.", "Τα βράζουμε."],
    ...fields,
  });

describe("readForm", () => {
  it("trims text, joins line breaks in one-line fields, and leaves out empty rows", () => {
    const read = readForm({
      title: "  Φασολάδα \n της γιαγιάς ",
      ingredients: ["", " φασόλια ", "   "],
      steps: ["Βράζουμε\nσιγά.", ""],
      tags: ["soup", ""],
    });
    expect(read.title).toBe("Φασολάδα της γιαγιάς");
    expect(read.ingredients).toEqual(["φασόλια"]);
    expect(read.steps).toEqual(["Βράζουμε σιγά."]);
    expect(read.tags).toEqual(["soup"]);
  });

  it("keeps a story's paragraphs, with exactly one blank line between them", () => {
    const read = form({ memory: { title: "Τίτλος", story: "Πρώτη.  \r\n\r\n\r\n\r\nΔεύτερη\nγραμμή.\n\n", date: "" } });
    expect(read.memory?.story).toBe("Πρώτη.\n\nΔεύτερη\nγραμμή.");
  });

  it("drops a story with neither a title nor text, and a preparation with neither a title nor steps", () => {
    const read = form({
      memory: { title: " ", story: "", date: "2024-05" },
      preparations: [{ title: "", steps: ["", " "] }, { title: "Σάλτσα", steps: [] }],
    });
    expect(read.memory).toBeUndefined();
    expect(read.preparations).toEqual([{ title: "Σάλτσα", steps: [] }]);
  });

  it("reads servings as a number, leaving a typo for validation to reject", () => {
    expect(form({ servings: " 4 " }).servings).toBe(4);
    expect(form({ servings: "" }).servings).toBeUndefined();
    expect(form({ servings: "four" }).servings).toBeNaN();
  });

  it("reads anything that is not an object as an empty form", () => {
    expect(readForm(null)).toMatchObject({ title: "", ingredients: [], memory: undefined });
  });
});

describe("buildRecipe", () => {
  it("writes a new recipe in the files' key order, without the optional fields left empty", () => {
    const recipe = buildRecipe(form({ tags: ["soup"], servings: "4" }), { id: "fasolada", imageUrl: undefined, now: NOW });
    expect(recipe).toEqual({
      id: "fasolada",
      title: "Φασολάδα",
      description: "Η φασολάδα της Κυριακής.",
      ingredients: ["500 γρ. φασόλια", "1 κρεμμύδι"],
      steps: ["Μουλιάζουμε τα φασόλια.", "Τα βράζουμε."],
      tags: ["soup"],
      servings: 4,
      createdAt: "2026-11-13T10:00:00.000Z",
      updatedAt: "2026-11-13T10:00:00.000Z",
    });
    expect(Object.keys(recipe)).toEqual(KEY_ORDER.filter((key) => key in recipe));
  });

  it("writes the story's date only when there is one", () => {
    const withDate = buildRecipe(form({ memory: { title: "Τ", story: "Ι", date: "2023-11" } }), {
      id: "fasolada",
      imageUrl: undefined,
      now: NOW,
    });
    const without = buildRecipe(form({ memory: { title: "Τ", story: "Ι", date: "" } }), {
      id: "fasolada",
      imageUrl: undefined,
      now: NOW,
    });
    expect(withDate.memory).toEqual({ title: "Τ", story: "Ι", date: "2023-11" });
    expect(without.memory).toEqual({ title: "Τ", story: "Ι" });
  });

  it("keeps createdAt, translations, and unknown fields of the file being edited, and removes cleared ones", () => {
    const existing = {
      id: "fasolada",
      title: "Παλιός τίτλος",
      cookTime: "1 ώρα",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      translations: { en: { title: "Bean soup" } },
      somethingNew: true,
    };
    const recipe = buildRecipe(form(), { id: "fasolada", existing, imageUrl: "/images/recipes/fasolada.jpg", now: NOW });
    expect(recipe.title).toBe("Φασολάδα");
    expect(recipe.createdAt).toBe("2024-01-01T00:00:00.000Z");
    expect(recipe.updatedAt).toBe("2026-11-13T10:00:00.000Z");
    expect(recipe.translations).toEqual({ en: { title: "Bean soup" } });
    expect(recipe.imageUrl).toBe("/images/recipes/fasolada.jpg");
    expect("cookTime" in recipe).toBe(false);
    expect(Object.keys(recipe).slice(-2)).toEqual(["translations", "somethingNew"]);
  });

  it("uses the same key order as scripts/sync-from-strapi.mjs, so a later sync changes nothing", () => {
    const script = readFileSync(path.join(process.cwd(), "scripts", "sync-from-strapi.mjs"), "utf8");
    const list = /const KEY_ORDER = \[([\s\S]*?)\];/.exec(script)?.[1] ?? "";
    expect(Array.from(list.matchAll(/"([a-zA-Z]+)"/g), (match) => match[1])).toEqual([...KEY_ORDER]);
  });
});

describe("recipeIssues", () => {
  const build = (fields: Record<string, unknown> = {}) =>
    buildRecipe(form(fields), { id: "fasolada", imageUrl: undefined, now: NOW });

  it("finds nothing wrong with a complete recipe", () => {
    expect(recipeIssues(build(), "fasolada", new Set())).toEqual([]);
  });

  it("reports the site's schema problems, such as a missing description or an unknown tag", () => {
    const fields = recipeIssues(build({ description: "", tags: ["spicy"] }), "fasolada", new Set()).map(
      (issue) => issue.field,
    );
    expect(fields).toEqual(["description", "tags"]);
  });

  it("accepts story links to existing recipes and to the recipe itself, and reports the others", () => {
    const recipe = build({
      memory: { title: "Τ", story: "Με [[tsilichoyda]], [[fasolada|αυτή]] και [[den-yparchei]].", date: "" },
    });
    expect(recipeIssues(recipe, "fasolada", new Set(["tsilichoyda"]))).toEqual([
      {
        field: "memory.story",
        message: "memory.story links to [[den-yparchei]], but there is no recipe with that id",
      },
    ]);
  });
});

describe("translations", () => {
  const translation = (steps: number) => ({
    title: "Bean soup",
    description: "Sunday bean soup.",
    ingredients: ["500 g beans", "1 onion"],
    steps: Array.from({ length: steps }, (_, index) => `Step ${index + 1}.`),
  });
  const existing = { translations: { en: translation(2), fr: translation(3) } };
  const recipe = buildRecipe(form(), { id: "fasolada", existing, imageUrl: undefined, now: NOW });
  const issues = recipeIssues(recipe, "fasolada", new Set());

  it("names the languages whose translation no longer matches the Greek", () => {
    expect(brokenTranslations(issues)).toEqual(["fr"]);
  });

  it("drops only those, keeping the rest", () => {
    const { recipe: fixed, dropped } = dropBrokenTranslations(recipe, issues);
    expect(dropped).toEqual(["fr"]);
    expect(Object.keys(fixed.translations as object)).toEqual(["en"]);
    expect(recipeIssues(fixed, "fasolada", new Set())).toEqual([]);
  });

  it("removes the translations field when no language is left", () => {
    const { recipe: fixed } = dropBrokenTranslations({ ...recipe, translations: { fr: translation(3) } }, issues);
    expect("translations" in fixed).toBe(false);
  });

  it("notices a change to the Greek text, but not to the story's date or the photo", () => {
    const changedDate = { ...recipe, memory: { title: "Τ", story: "Ι", date: "2023-11" } };
    const before = { ...recipe, memory: { title: "Τ", story: "Ι" } };
    expect(greekTextChanged(before, changedDate)).toBe(false);
    expect(greekTextChanged(recipe, { ...recipe, imageUrl: "/images/recipes/x.jpg" })).toBe(false);
    expect(greekTextChanged(recipe, { ...recipe, steps: ["Ένα βήμα."] })).toBe(true);
  });
});
