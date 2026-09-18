import { LOCALE_DETAILS, type Locale } from "@/lib/i18n/config";

/** A count's wording, such as { one: "{count} recipe", other: "{count} recipes" }. */
export type PluralForms = { one: string; other: string };

const pluralRules = new Map<Locale, Intl.PluralRules>();

/**
 * Fills in `{count}`, choosing the form by the language's plural rules: French
 * uses `one` for 0 as well as 1, and any category other than `one` gets `other`.
 */
export function formatCount(locale: Locale, forms: PluralForms, count: number): string {
  let rules = pluralRules.get(locale);
  if (rules === undefined) {
    rules = new Intl.PluralRules(LOCALE_DETAILS[locale].intl);
    pluralRules.set(locale, rules);
  }
  const form = rules.select(count) === "one" ? forms.one : forms.other;
  return form.replace("{count}", String(count));
}
