import "server-only";
import path from "path";
import type { CategoryNames } from "@/types/recipe";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { readJsonFile } from "@/lib/json-file";
import { RecipeDataError, parseCategoryTranslations, type CategoryTranslations } from "@/lib/recipe-schema";
import { CATEGORY_FALLBACK } from "@/lib/recipe-view";

/**
 * Reads a category translations file. A missing file means no translations; an
 * unreadable or invalid one is ignored with a console warning, like a broken
 * recipe, so the build still succeeds with Greek names. `npm run validate:data`
 * fails on it.
 */
async function readCategoryTranslations(filePath: string): Promise<CategoryTranslations> {
  try {
    const file = await readJsonFile(filePath, "category list");
    return file ? parseCategoryTranslations(file.value, file.source) : {};
  } catch (error) {
    if (!(error instanceof RecipeDataError)) throw error;
    console.warn(`Ignoring category translations: ${error.message}`);
    return {};
  }
}

/**
 * Display names for the categories in `locale`, keyed by Greek category name,
 * including CATEGORY_FALLBACK. A category with no name here shows in Greek.
 * Tests pass their own file; pages use data/categories.json.
 */
export async function getCategoryNames(
  locale: Locale,
  filePath = path.join(process.cwd(), "data", "categories.json"),
): Promise<CategoryNames> {
  const names: CategoryNames = { [CATEGORY_FALLBACK]: getMessages(locale).recipe.otherCategory };
  if (locale === DEFAULT_LOCALE) return names;

  for (const [category, byLocale] of Object.entries(await readCategoryTranslations(filePath))) {
    const name = byLocale[locale];
    if (name !== undefined) names[category] = name;
  }
  return names;
}
