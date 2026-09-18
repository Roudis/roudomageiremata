import { LOCALE_DETAILS, type Locale } from "@/lib/i18n/config";

/**
 * A count's wording, such as { one: "{count} recipe", other: "{count} recipes" }.
 * `few` is for languages whose plural rules have that category, such as Czech
 * ("3 recepty" but "5 receptů") and Romanian ("3 rețete" but "20 de rețete").
 */
export type PluralForms = { one: string; few?: string; other: string };

const pluralRules = new Map<Locale, Intl.PluralRules>();

/**
 * Fills in `{count}`, choosing the form by the language's plural rules: French
 * uses `one` for 0 as well as 1, Czech uses `few` for 2 to 4, and any other
 * category, or `few` when the forms have none, gets `other`.
 */
export function formatCount(locale: Locale, forms: PluralForms, count: number): string {
  let rules = pluralRules.get(locale);
  if (rules === undefined) {
    rules = new Intl.PluralRules(LOCALE_DETAILS[locale].intl);
    pluralRules.set(locale, rules);
  }
  const category = rules.select(count);
  const form = category === "one" ? forms.one : category === "few" ? (forms.few ?? forms.other) : forms.other;
  return form.replace("{count}", String(count));
}
