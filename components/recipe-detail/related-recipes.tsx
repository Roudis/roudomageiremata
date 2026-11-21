import type { CategoryNames, RecipeSummary } from "@/types/recipe";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { recipesPath } from "@/lib/recipe-search";
import { categoryDisplayName } from "@/lib/recipe-view";
import { ArrowLink } from "@/components/button-link";
import { SectionHeading } from "@/components/page-heading";
import { RecipeCard } from "@/components/recipe-card";

type RelatedRecipesProps = {
  /** The Greek name of the category the recipes share. */
  category: string;
  recipes: RecipeSummary[];
  locale: Locale;
  categoryNames: CategoryNames;
};

/** A few other recipes from the same chapter, under a recipe. Renders nothing when there are none. */
export function RelatedRecipes({ category, recipes, locale, categoryNames }: RelatedRecipesProps) {
  if (recipes.length === 0) return null;

  const t = getMessages(locale);

  return (
    <section className="mt-16 border-t border-border pt-12 sm:mt-24 print:hidden">
      <SectionHeading
        eyebrow={t.recipe.moreFrom}
        title={categoryDisplayName(category, categoryNames)}
        action={<ArrowLink href={localizePath(recipesPath({ category }), locale)}>{t.nav.allRecipes}</ArrowLink>}
      />
      <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            locale={locale}
            categoryNames={categoryNames}
            messages={{ recipeCard: t.recipeCard, tags: t.tags, counts: t.counts }}
          />
        ))}
      </div>
    </section>
  );
}
