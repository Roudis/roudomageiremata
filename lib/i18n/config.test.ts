import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_DETAILS,
  TRANSLATED_LOCALES,
  isLocale,
  isTranslatedLocale,
  localizePath,
  splitLocalePath,
} from "@/lib/i18n/config";

describe("locales", () => {
  it("has Greek first as the default, then the six translated languages", () => {
    expect(DEFAULT_LOCALE).toBe("el");
    expect(LOCALES).toEqual(["el", "en", "nl", "fr", "sv", "es", "it", "ro", "cs"]);
    expect(TRANSLATED_LOCALES).toEqual(["en", "nl", "fr", "sv", "es", "it", "ro", "cs"]);
  });

  it("gives every language a name, an Intl tag, and an Open Graph locale", () => {
    for (const locale of LOCALES) {
      expect(LOCALE_DETAILS[locale].name, locale).not.toBe("");
      expect(Intl.DateTimeFormat.supportedLocalesOf(LOCALE_DETAILS[locale].intl), locale).toHaveLength(1);
      expect(LOCALE_DETAILS[locale].openGraph, locale).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
    }
  });

  it("recognises only the site's language codes", () => {
    expect(isLocale("el")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale("EN")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isTranslatedLocale("en")).toBe(true);
    expect(isTranslatedLocale("el")).toBe(false);
  });
});

describe("localizePath", () => {
  it("leaves Greek paths unprefixed", () => {
    expect(localizePath("/", "el")).toBe("/");
    expect(localizePath("/recipes/gemista", "el")).toBe("/recipes/gemista");
  });

  it("prefixes other languages without adding a trailing slash", () => {
    expect(localizePath("/", "en")).toBe("/en");
    expect(localizePath("/recipes/gemista", "fr")).toBe("/fr/recipes/gemista");
  });

  it("keeps a hash or query after the path", () => {
    expect(localizePath("/#recipe-grid", "en")).toBe("/en#recipe-grid");
    expect(localizePath("/recipes/gemista?print=1", "sv")).toBe("/sv/recipes/gemista?print=1");
  });
});

describe("splitLocalePath", () => {
  it("reads the language from the first segment", () => {
    expect(splitLocalePath("/en/recipes/gemista")).toEqual({ locale: "en", path: "/recipes/gemista" });
    expect(splitLocalePath("/it")).toEqual({ locale: "it", path: "/" });
  });

  it("treats any other path as Greek", () => {
    expect(splitLocalePath("/")).toEqual({ locale: "el", path: "/" });
    expect(splitLocalePath("/recipes/gemista")).toEqual({ locale: "el", path: "/recipes/gemista" });
    expect(splitLocalePath("/el/recipes/gemista")).toEqual({ locale: "el", path: "/el/recipes/gemista" });
    expect(splitLocalePath("/english")).toEqual({ locale: "el", path: "/english" });
  });

  it("round-trips with localizePath for every language", () => {
    for (const locale of LOCALES) {
      for (const path of ["/", "/recipes/gemista"]) {
        expect(splitLocalePath(localizePath(path, locale)), `${locale} ${path}`).toEqual({ locale, path });
      }
    }
  });
});
