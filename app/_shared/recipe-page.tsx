import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook } from "@/lib/book";
import { getRecipeById, getRecipeIds } from "@/lib/recipes";
import {
  categoryLabel,
  formatRecipeDate,
  localizeRecipe,
  relatedRecipes,
  storiesMentioning,
  textLang,
  toRecipeSummary,
} from "@/lib/recipe-view";
import { recipesPath } from "@/lib/recipe-search";
import { withBasePath } from "@/lib/base-path";
import { LOCALE_DETAILS, SITE_NAME, localizePath, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { tagName } from "@/lib/tags";
import { languageAlternates } from "@/app/_shared/metadata";
import { CategoryBadge } from "@/components/category-badge";
import { BackLink, UntranslatedNotice } from "@/components/page-links";
import { StoryTeaser } from "@/components/story-card";
import { RecipeHero } from "@/components/recipe-detail/recipe-hero";
import { RecipeStats } from "@/components/recipe-detail/recipe-stats";
import { RecipeMemory } from "@/components/recipe-detail/recipe-memory";
import { IngredientList } from "@/components/recipe-detail/ingredient-list";
import { StepList } from "@/components/recipe-detail/step-list";
import { RelatedRecipes } from "@/components/recipe-detail/related-recipes";
import { Tag } from "lucide-react";

/**
 * The recipe ids that get a page, in every language; on GitHub Pages any other
 * path serves the 404 page. Do not add `export const dynamicParams = false` to
 * the routes: on Next 14 with `output: "export"` the dev server then throws
 * "missing generateStaticParams()" for every recipe.
 */
export async function recipeStaticParams(): Promise<{ id: string }[]> {
  const ids = await getRecipeIds();
  return ids.map((id) => ({ id }));
}

export async function recipeMetadata(id: string, locale: Locale): Promise<Metadata> {
  const found = await getRecipeById(id);

  if (!found) return {};

  const recipe = localizeRecipe(found, locale);
  const images =
    recipe.imageUrl !== undefined ? [{ url: withBasePath(recipe.imageUrl), alt: recipe.title }] : undefined;

  return {
    title: recipe.title,
    description: recipe.description,
    alternates: languageAlternates(`/recipes/${recipe.id}`, locale),
    // A page's openGraph replaces the layout's rather than merging into it, so the
    // site-level fields are repeated here.
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      siteName: SITE_NAME,
      locale: LOCALE_DETAILS[locale].openGraph,
      type: "article",
      images,
    },
  };
}

type RecipePageProps = {
  id: string;
  locale: Locale;
};

/** How many recipes from the same chapter the page suggests at the end. */
const RELATED_RECIPES = 3;

/** The longest ingredient list that still fits on a laptop screen, and so stays beside the steps. */
const STICKY_INGREDIENTS = 10;

/** A recipe in one language; app/(el)/recipes/[id] and app/[locale]/recipes/[id] render it. */
export async function RecipePage({ id, locale }: RecipePageProps) {
  const { recipes, stories, titles, categoryNames } = await getBook(locale);
  const recipe = recipes.find((candidate) => candidate.id === id);

  if (!recipe) {
    notFound();
  }

  const messages = getMessages(locale);
  const t = messages.recipe;
  // Set only when the recipe has no translation for this language and its text is still Greek.
  const lang = textLang(recipe, locale);
  const category = categoryLabel(recipe);
  // Other recipes' stories that link to this one.
  const mentionedIn = storiesMentioning(recipe.id, stories);

  return (
    <main className="page-container pt-6 sm:pt-10">
      <BackLink href={localizePath("/recipes", locale)}>{messages.nav.allRecipes}</BackLink>

      {lang !== undefined && <UntranslatedNotice>{t.untranslated}</UntranslatedNotice>}

      {/* auto-cols-fr puts the text and photo side by side, and gives the text the full width when there is no photo. */}
      <header className="mt-6 grid gap-8 lg:grid-flow-col lg:auto-cols-fr lg:items-center lg:gap-12">
        <div>
          {/* The chapter, which opens the recipe list filtered to it. */}
          <Link
            href={localizePath(recipesPath({ category }), locale)}
            className="inline-flex rounded-sm underline-offset-4 hover:underline focus-ring-offset"
          >
            <CategoryBadge recipe={recipe} names={categoryNames} variant="detail" />
          </Link>
          <h1
            lang={lang}
            className="mt-3 text-balance font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {recipe.title}
          </h1>
          <p lang={lang} className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {recipe.description}
          </p>
          {recipe.tags !== undefined && (
            <ul aria-label={messages.tags.label} className="mt-5 flex flex-wrap gap-2 print:hidden">
              {recipe.tags.map((tag) => (
                <li key={tag}>
                  {/* Opens the recipe list filtered to this tag; RecipeList reads ?tag= when it mounts. */}
                  <Link
                    href={localizePath(recipesPath({ tag }), locale)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-secondary-soft px-3 text-sm font-medium text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground focus-ring-offset"
                  >
                    <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                    {tagName(tag, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8">
            <RecipeStats recipe={recipe} locale={locale} lang={lang} />
          </div>
        </div>

        <RecipeHero recipe={recipe} />
      </header>

      {recipe.memory !== undefined && (
        <div className="mt-12 sm:mt-16">
          <RecipeMemory recipeId={recipe.id} memory={recipe.memory} locale={locale} titles={titles} lang={lang} />
        </div>
      )}

      {mentionedIn.length > 0 && (
        <section className="mt-10 print:hidden">
          <h2 className="eyebrow">{t.mentionedIn}</h2>
          <div className="mt-1 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            {mentionedIn.map((story) => (
              <StoryTeaser key={story.id} story={story} locale={locale} titles={titles} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 grid gap-12 sm:mt-16 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-4">
          {/*
            A short list stays in view beside the steps, scrolling on its own only on a
            screen too low for it. A long one is left in the page's flow, so its last
            ingredients are never hidden behind a second scrollbar.
          */}
          <div
            className={
              recipe.ingredients.length <= STICKY_INGREDIENTS
                ? "lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:rounded-xl print:static print:max-h-none"
                : undefined
            }
          >
            <IngredientList ingredients={recipe.ingredients} locale={locale} lang={lang} />
          </div>
        </aside>

        {/* Preparations, such as a sauce made separately, come before the main steps. */}
        <div className="space-y-12 sm:space-y-16 lg:col-span-8">
          {recipe.preparations?.map((preparation, index) => (
            <StepList key={index} steps={preparation.steps} title={preparation.title} locale={locale} lang={lang} />
          ))}
          <StepList steps={recipe.steps} locale={locale} lang={lang} />
          <p className="border-t border-border pt-6 text-sm text-muted-foreground">
            {t.updated} · <time dateTime={recipe.updatedAt}>{formatRecipeDate(recipe.updatedAt, locale)}</time>
          </p>
        </div>
      </div>

      <RelatedRecipes
        category={category}
        recipes={relatedRecipes(recipe, recipes, RELATED_RECIPES).map(toRecipeSummary)}
        locale={locale}
        categoryNames={categoryNames}
      />
    </main>
  );
}
