import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, localizePath, type Locale } from "@/lib/i18n/config";
import { withBasePath } from "@/lib/base-path";

/**
 * The canonical URL of `path` in `locale`, and the same page in every language,
 * so search engines show visitors their own language. Next does not add the
 * base path to these, hence withBasePath.
 */
export function languageAlternates(path: string, locale: Locale): Metadata["alternates"] {
  return {
    canonical: withBasePath(localizePath(path, locale)),
    languages: {
      ...Object.fromEntries(LOCALES.map((code) => [code, withBasePath(localizePath(path, code))])),
      "x-default": withBasePath(localizePath(path, DEFAULT_LOCALE)),
    },
  };
}
