import { LOCALE_DETAILS, type Locale } from "@/lib/i18n/config";

/**
 * One cached Intl object per language, built from that language's BCP 47 tag,
 * so formatting or sorting a list does not rebuild it for every item.
 */
export function perLocale<T>(create: (intl: string) => T): (locale: Locale) => T {
  const cache = new Map<Locale, T>();
  return (locale) => {
    let value = cache.get(locale);
    if (value === undefined) {
      value = create(LOCALE_DETAILS[locale].intl);
      cache.set(locale, value);
    }
    return value;
  };
}

/** Alphabetical order in a language, for titles and category names. */
export const collatorFor = perLocale((intl) => new Intl.Collator(intl));

const pluralRulesFor = perLocale((intl) => new Intl.PluralRules(intl));

/**
 * A count's wording, such as { one: "{count} recipe", other: "{count} recipes" }.
 * `few` is for languages whose plural rules have that category, such as Czech
 * ("3 recepty" but "5 receptů") and Romanian ("3 rețete" but "20 de rețete").
 */
export type PluralForms = { one: string; few?: string; other: string };

/**
 * Fills in `{count}`, choosing the form by the language's plural rules: French
 * uses `one` for 0 as well as 1, Czech uses `few` for 2 to 4, and any other
 * category, or `few` when the forms have none, gets `other`. That includes
 * Ukrainian's `many` (0 and 5 to 20), so its `other` form holds that wording, and
 * everything in Japanese, which has no plural.
 */
export function formatCount(locale: Locale, forms: PluralForms, count: number): string {
  const category = pluralRulesFor(locale).select(count);
  const form = category === "one" ? forms.one : category === "few" ? (forms.few ?? forms.other) : forms.other;
  return form.replace("{count}", String(count));
}
