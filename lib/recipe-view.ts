import type { CategoryNames, LocalizedRecipe, Recipe, RecipeSummary } from "@/types/recipe";
import { DEFAULT_LOCALE, LOCALE_DETAILS, type Locale } from "@/lib/i18n/config";

/** Category used everywhere a recipe has none: the card, the detail page, and the filter. */
export const CATEGORY_FALLBACK = "Άλλο";

/** The category to display and filter by, which is CATEGORY_FALLBACK when the recipe has none. */
export function categoryLabel(recipe: Pick<Recipe, "category">): string {
  return recipe.category ?? CATEGORY_FALLBACK;
}

/**
 * A category's name in the page's language: its entry in `names` (from
 * `getCategoryNames`), or the Greek label when there is none.
 */
export function categoryDisplayName(label: string, names: CategoryNames): string {
  return Object.hasOwn(names, label) ? names[label] : label;
}

/**
 * A stable bucket for a category label, so each category keeps one colour
 * however the list is filtered. FNV-1a, which spreads similar labels such as
 * "Της Γιαγιάς…" and "Του Μπαμπούλα…" apart. Two categories can still land on
 * the same bucket: the colour is stable, not guaranteed unique.
 */
export function categoryColorIndex(label: string, buckets: number): number {
  let hash = 2166136261;
  for (let i = 0; i < label.length; i++) {
    hash ^= label.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash % buckets;
}

/** One cached Intl object per language, so formatting a list does not rebuild it for every item. */
function perLocale<T>(create: (intl: string) => T): (locale: Locale) => T {
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

const titleCollator = perLocale((intl) => new Intl.Collator(intl));

type Sortable = Pick<Recipe, "id" | "title" | "updatedAt">;

/**
 * The home page order for one language. Newest `updatedAt` first, comparing
 * parsed instants rather than strings. Ties, including unparseable timestamps,
 * fall back to the title in that language's alphabetical order and then to the
 * id, so the order never depends on the filesystem.
 */
export function recipeOrder(locale: Locale): (a: Sortable, b: Sortable) => number {
  const collator = titleCollator(locale);
  return (a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() ||
    collator.compare(a.title, b.title) ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

/** The Greek order, which the loader returns. */
export const compareRecipes = recipeOrder(DEFAULT_LOCALE);

// "10 Αυγ 2026" in Greek, "10 Aug 2026" in English. Fixed time zone, so the date does not depend on the build machine.
const recipeDateFormat = perLocale(
  (intl) => new Intl.DateTimeFormat(intl, { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Athens" }),
);

/** Formats an ISO timestamp for display, or returns it unchanged if it cannot be parsed. */
export function formatRecipeDate(isoDate: string, locale: Locale = DEFAULT_LOCALE): string {
  const parsed = Date.parse(isoDate);
  return Number.isNaN(parsed) ? isoDate : recipeDateFormat(locale).format(parsed);
}

// "Νοέμβριος 2023" in Greek. UTC, because a bare year and month has no time of day to shift.
const memoryMonthFormat = perLocale(
  (intl) => new Intl.DateTimeFormat(intl, { month: "long", year: "numeric", timeZone: "UTC" }),
);

/** Formats a memory's "YYYY-MM" date as a month name and year, or returns any other value unchanged. */
export function formatMemoryDate(date: string, locale: Locale = DEFAULT_LOCALE): string {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(date);
  return match === null
    ? date
    : memoryMonthFormat(locale).format(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
}

/**
 * The recipe as `locale`'s pages show it: its translation laid over the Greek,
 * or the Greek unchanged, with `contentLocale` saying which. Fields that are not
 * text, and the memory's date, always come from the Greek.
 */
export function localizeRecipe(recipe: Recipe, locale: Locale): LocalizedRecipe {
  const { translations, ...greek } = recipe;
  const translation = locale === DEFAULT_LOCALE ? undefined : translations?.[locale];
  if (translation === undefined) return { ...greek, contentLocale: DEFAULT_LOCALE };

  const localized: LocalizedRecipe = {
    ...greek,
    title: translation.title,
    description: translation.description,
    ingredients: translation.ingredients,
    steps: translation.steps,
    contentLocale: locale,
  };
  if (greek.memory !== undefined && translation.memory !== undefined) {
    localized.memory = { ...greek.memory, ...translation.memory };
  }
  if (translation.prepTime !== undefined) localized.prepTime = translation.prepTime;
  if (translation.cookTime !== undefined) localized.cookTime = translation.cookTime;
  return localized;
}

/** Keeps only what the recipe list and cards render. Optional fields stay absent when missing. */
export function toRecipeSummary(recipe: LocalizedRecipe): RecipeSummary {
  const summary: RecipeSummary = {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    contentLocale: recipe.contentLocale,
    hasMemory: Boolean(recipe.memory),
  };
  if (recipe.imageUrl !== undefined) summary.imageUrl = recipe.imageUrl;
  if (recipe.category !== undefined) summary.category = recipe.category;
  if (recipe.prepTime !== undefined) summary.prepTime = recipe.prepTime;
  if (recipe.servings !== undefined) summary.servings = recipe.servings;
  return summary;
}
