import Link from "next/link";
import type { CategoryNames, RecipeSummary } from "@/types/recipe";
import type { Messages } from "@/lib/i18n/messages";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { formatCount } from "@/lib/i18n/format";
import { withBasePath } from "@/lib/base-path";
import { tagName } from "@/lib/tags";
import { CategoryBadge } from "@/components/category-badge";
import { BookHeart, ChefHat, Clock, ListChecks, Users } from "lucide-react";

type RecipeCardProps = {
  recipe: RecipeSummary;
  locale: Locale;
  categoryNames: CategoryNames;
  messages: Pick<Messages, "recipeCard" | "tags" | "counts">;
};

export function RecipeCard({ recipe, locale, categoryNames, messages }: RecipeCardProps) {
  // Set only when the recipe has no translation and its text is still Greek.
  const lang = recipe.contentLocale === locale ? undefined : recipe.contentLocale;

  return (
    <Link
      href={localizePath(`/recipes/${recipe.id}`, locale)}
      className="group flex h-full flex-col rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        {recipe.imageUrl !== undefined ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={withBasePath(recipe.imageUrl)}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ChefHat className="h-10 w-10" aria-hidden="true" />
          </div>
        )}
        {recipe.hasMemory && (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-primary shadow-sm backdrop-blur">
            <BookHeart className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{messages.recipeCard.hasStory}</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <CategoryBadge recipe={recipe} names={categoryNames} variant="card" />
        <h3 lang={lang} className="mt-2 font-serif text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
          {recipe.title}
        </h3>
        <p lang={lang} className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {recipe.description}
        </p>

        {recipe.tags !== undefined && (
          <ul aria-label={messages.tags.label} className="mt-3 flex flex-wrap gap-1.5">
            {recipe.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-secondary-soft px-2 py-0.5 text-[0.6875rem] font-medium leading-4 text-secondary"
              >
                {tagName(tag, locale)}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-xs text-muted-foreground">
          {recipe.prepTime !== undefined && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
              <span lang={lang}>{recipe.prepTime}</span>
            </span>
          )}
          {recipe.servings !== undefined && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
              {formatCount(locale, messages.counts.servings, recipe.servings)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
            {formatCount(locale, messages.counts.ingredients, recipe.ingredients.length)}
          </span>
        </p>
      </div>
    </Link>
  );
}
