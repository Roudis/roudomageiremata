import Link from "next/link";
import { ArrowRight, ChefHat } from "lucide-react";
import type { CategoryNames, RecipeSummary } from "@/types/recipe";
import { withBasePath } from "@/lib/base-path";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { textLang } from "@/lib/recipe-view";
import { ButtonLink } from "@/components/button-link";
import { CategoryBadge } from "@/components/category-badge";
import { RecipeMeta } from "@/components/recipe-card";

type RecipeBannerProps = {
  recipe: RecipeSummary;
  locale: Locale;
  categoryNames: CategoryNames;
};

/**
 * One recipe as a wide card with its photo beside it and a button to open it:
 * the recipe a story belongs to, at the end of that story.
 */
export function RecipeBanner({ recipe, locale, categoryNames }: RecipeBannerProps) {
  const messages = getMessages(locale);
  const lang = textLang(recipe, locale);
  const href = localizePath(`/recipes/${recipe.id}`, locale);

  return (
    <article className="grid overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="aspect-[4/3] bg-muted sm:aspect-auto sm:min-h-56">
        {recipe.imageUrl !== undefined ? (
          <img
            src={withBasePath(recipe.imageUrl)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ChefHat className="h-10 w-10" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-col items-start p-6 sm:p-8">
        <CategoryBadge recipe={recipe} names={categoryNames} variant="card" />
        <h3 lang={lang} className="mt-2 text-pretty font-serif text-2xl font-semibold leading-snug tracking-tight">
          <Link href={href} className="rounded-sm transition-colors hover:text-primary focus-ring">
            {recipe.title}
          </Link>
        </h3>
        <p lang={lang} className="mt-2 line-clamp-3 text-pretty leading-relaxed text-muted-foreground">
          {recipe.description}
        </p>
        <RecipeMeta recipe={recipe} locale={locale} counts={messages.counts} className="mb-6 mt-4" />
        <div className="mt-auto">
          <ButtonLink href={href} variant="primary">
            {messages.stories.viewRecipe}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
