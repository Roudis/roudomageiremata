/**
 * The site's languages and how they map to URLs. Greek is the original: its
 * pages keep the unprefixed paths ("/recipes/x"), and every other language
 * lives under its code ("/en/recipes/x"). Pure, so it is safe on either side.
 */

/** The site's name, written in Greek in every language. */
export const SITE_NAME = "Ρουδομαγειρέματα";

export const LOCALES = ["el", "en", "nl", "fr", "sv", "es", "it", "ro", "cs", "uk", "ja"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE = "el" satisfies Locale;

/** Every language except Greek: the ones with a URL prefix and a translation in each recipe file. */
export type TranslatedLocale = Exclude<Locale, typeof DEFAULT_LOCALE>;

export const TRANSLATED_LOCALES = LOCALES.filter(
  (locale): locale is TranslatedLocale => locale !== DEFAULT_LOCALE,
);

type LocaleDetails = {
  /** The language's name in that language, as the switcher lists it. */
  name: string;
  /** BCP 47 tag for Intl date and plural formatting. */
  intl: string;
  /** Open Graph `og:locale`. */
  openGraph: string;
};

export const LOCALE_DETAILS: Record<Locale, LocaleDetails> = {
  el: { name: "Ελληνικά", intl: "el-GR", openGraph: "el_GR" },
  en: { name: "English", intl: "en-GB", openGraph: "en_GB" },
  nl: { name: "Nederlands", intl: "nl-NL", openGraph: "nl_NL" },
  fr: { name: "Français", intl: "fr-FR", openGraph: "fr_FR" },
  sv: { name: "Svenska", intl: "sv-SE", openGraph: "sv_SE" },
  es: { name: "Español", intl: "es-ES", openGraph: "es_ES" },
  it: { name: "Italiano", intl: "it-IT", openGraph: "it_IT" },
  ro: { name: "Română", intl: "ro-RO", openGraph: "ro_RO" },
  cs: { name: "Čeština", intl: "cs-CZ", openGraph: "cs_CZ" },
  uk: { name: "Українська", intl: "uk-UA", openGraph: "uk_UA" },
  ja: { name: "日本語", intl: "ja-JP", openGraph: "ja_JP" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function isTranslatedLocale(value: unknown): value is TranslatedLocale {
  return isLocale(value) && value !== DEFAULT_LOCALE;
}

/**
 * A site path in `locale`: unchanged for Greek, prefixed for the rest, so
 * "/recipes/x" becomes "/en/recipes/x" and "/#recipe-grid" becomes "/en#recipe-grid".
 * Never adds a trailing slash, which the static export has no file for.
 */
export function localizePath(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  const suffixAt = path.search(/[?#]/);
  const pathname = suffixAt === -1 ? path : path.slice(0, suffixAt);
  const suffix = suffixAt === -1 ? "" : path.slice(suffixAt);
  return `/${locale}${pathname === "/" ? "" : pathname}${suffix}`;
}

/** The language of a pathname and the pathname without its prefix: "/en/recipes/x" → en, "/recipes/x". */
export function splitLocalePath(pathname: string): { locale: Locale; path: string } {
  const [, first = "", ...rest] = pathname.split("/");
  if (isTranslatedLocale(first)) return { locale: first, path: `/${rest.join("/")}` };
  return { locale: DEFAULT_LOCALE, path: pathname };
}
