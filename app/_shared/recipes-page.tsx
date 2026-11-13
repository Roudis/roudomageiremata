import type { Metadata } from "next";
import { getBook } from "@/lib/book";
import { toRecipeSummary } from "@/lib/recipe-view";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { languageAlternates } from "@/app/_shared/metadata";
import { PageHeader } from "@/components/page-heading";
import { RecipeList } from "@/components/recipe-list";

export function recipesMetadata(locale: Locale): Metadata {
  const t = getMessages(locale);
  return {
    title: t.nav.recipes,
    description: t.recipesPage.intro,
    alternates: languageAlternates("/recipes", locale),
  };
}

/**
 * Every recipe in one language, with the search box and the chapter and tag
 * filters; app/(el)/recipes and app/[locale]/recipes render it. Chapter and tag
 * links elsewhere open it filtered, as /recipes?category=… or /recipes?tag=….
 */
export async function RecipesPage({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const { recipes, categoryNames } = await getBook(locale);

  return (
    <main className="page-container pt-10 sm:pt-14">
      <PageHeader eyebrow={t.home.eyebrow} title={t.recipesPage.title} intro={t.recipesPage.intro} />
      <div className="mt-10">
        <RecipeList
          recipes={recipes.map(toRecipeSummary)}
          locale={locale}
          categoryNames={categoryNames}
          messages={{ recipeList: t.recipeList, recipeCard: t.recipeCard, tags: t.tags, counts: t.counts }}
        />
      </div>
    </main>
  );
}
