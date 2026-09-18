import { describe, expect, it } from "vitest";
import { LOCALE_DETAILS, LOCALES } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

/** Every leaf of a messages object, as ["section.key", value] pairs. */
function leaves(value: unknown, prefix = ""): [string, unknown][] {
  if (typeof value !== "object" || value === null) return [[prefix, value]];
  return Object.entries(value).flatMap(([key, child]) => leaves(child, prefix ? `${prefix}.${key}` : key));
}

// The Messages type already makes every language list the Greek keys; these check the values.
describe.each(LOCALES)("%s messages", (locale) => {
  const entries = leaves(getMessages(locale));

  it("has the same keys as the Greek, apart from plural few forms", () => {
    const keys = entries.map(([key]) => key).filter((key) => !/^counts\.\w+\.few$/.test(key));
    expect(keys).toEqual(leaves(getMessages("el")).map(([key]) => key));
  });

  it("gives every count a few form exactly when the language's plural rules have one", () => {
    const hasFew = new Intl.PluralRules(LOCALE_DETAILS[locale].intl).resolvedOptions().pluralCategories.includes("few");
    for (const [key, forms] of Object.entries(getMessages(locale).counts)) {
      expect("few" in forms, key).toBe(hasFew);
    }
  });

  it("has no blank text", () => {
    for (const [key, value] of entries) {
      expect(typeof value, key).toBe("string");
      expect(String(value).trim(), key).not.toBe("");
    }
  });

  it("puts {count} in every plural form", () => {
    for (const [key, value] of entries.filter(([key]) => key.startsWith("counts."))) {
      expect(value, key).toContain("{count}");
    }
  });
});
