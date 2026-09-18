import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/config";
import { NOT_VEGETARIAN, TAG_IDS, TAG_IMPLIES, TAG_NAMES, expandTags, isTagId, tagName } from "@/lib/tags";

describe("tag vocabulary", () => {
  it("names every tag in every language", () => {
    for (const tag of TAG_IDS) {
      for (const locale of LOCALES) {
        expect(tagName(tag, locale).trim(), `${tag} ${locale}`).not.toBe("");
      }
    }
  });

  it("uses lowercase ids, which recipe files store", () => {
    for (const tag of TAG_IDS) expect(tag).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
  });

  it("gives tags distinct names within each language, so the filter chips can be told apart", () => {
    for (const locale of LOCALES) {
      const names = TAG_IDS.map((tag) => TAG_NAMES[tag][locale]);
      expect(new Set(names).size, locale).toBe(names.length);
    }
  });

  it("implies only other tags, one level deep", () => {
    for (const [tag, implied] of Object.entries(TAG_IMPLIES)) {
      for (const other of implied ?? []) {
        expect(other, tag).not.toBe(tag);
        expect(TAG_IMPLIES[other] ?? [], `${tag} → ${other}`).toEqual([]);
      }
    }
  });

  it("never implies a tag that contradicts vegetarian from a vegetarian one", () => {
    expect(expandTags(["vegan"]).some((tag) => NOT_VEGETARIAN.includes(tag))).toBe(false);
  });
});

describe("isTagId", () => {
  it("accepts vocabulary ids only", () => {
    expect(isTagId("vegan")).toBe(true);
    expect(isTagId("Vegan")).toBe(false);
    expect(isTagId("tofu")).toBe(false);
    expect(isTagId("constructor")).toBe(false);
    expect(isTagId(undefined)).toBe(false);
  });
});

describe("expandTags", () => {
  it("adds implied tags and returns the vocabulary's order", () => {
    expect(expandTags(["pasta", "beef"])).toEqual(["meat", "beef", "pasta"]);
    expect(expandTags(["vegan", "dessert"])).toEqual(["vegan", "vegetarian", "dessert"]);
  });

  it("does not repeat a tag that is both listed and implied", () => {
    expect(expandTags(["beef", "pork"])).toEqual(["meat", "beef", "pork"]);
  });

  it("returns [] for no tags", () => {
    expect(expandTags([])).toEqual([]);
  });
});
