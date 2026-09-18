import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipeById, getRecipeIds } from "@/lib/recipes";
import { getCategoryNames } from "@/lib/categories";
import { localizeRecipe } from "@/lib/recipe-view";
import { withBasePath } from "@/lib/base-path";
import { LOCALE_DETAILS, SITE_NAME, localizePath, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { tagName } from "@/lib/tags";
import { languageAlternates } from "@/app/_shared/metadata";
import { CategoryBadge } from "@/components/category-badge";
import { RecipeHero } from "@/components/recipe-detail/recipe-hero";
import { RecipeStats } from "@/components/recipe-detail/recipe-stats";
import { RecipeMemory } from "@/components/recipe-detail/recipe-memory";
import { IngredientList } from "@/components/recipe-detail/ingredient-list";
import { StepList } from "@/components/recipe-detail/step-list";
import { ArrowLeft, Languages, Tag } from "lucide-react";

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

/** A recipe in one language; app/(el)/recipes/[id] and app/[locale]/recipes/[id] render it. */
export async function RecipePage({ id, locale }: RecipePageProps) {
  const [found, categoryNames] = await Promise.all([getRecipeById(id), getCategoryNames(locale)]);

  if (!found) {
    notFound();
  }

  const messages = getMessages(locale);
  const t = messages.recipe;
  const recipe = localizeRecipe(found, locale);
  // Set only when the recipe has no translation for this language and its text is still Greek.
  const lang = recipe.contentLocale === locale ? undefined : recipe.contentLocale;

  return (
    <main className="page-container pt-6 sm:pt-10">
      <Link
        href={localizePath("/", locale)}
        className="group -ml-2 inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
        {t.back}
      </Link>

      {lang !== undefined && (
        <p className="mt-4 flex max-w-2xl items-start gap-2.5 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
          <Languages className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {t.untranslated}
        </p>
      )}

      {/* auto-cols-fr puts the text and photo side by side, and gives the text the full width when there is no photo. */}
      <header className="mt-6 grid gap-8 lg:grid-flow-col lg:auto-cols-fr lg:items-center lg:gap-12">
        <div>
          <CategoryBadge recipe={recipe} names={categoryNames} variant="detail" />
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
            <ul aria-label={messages.tags.label} className="mt-5 flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <li key={tag}>
                  {/* Opens the recipe list filtered to this tag; RecipeList reads ?tag= when it mounts. */}
                  <Link
                    href={localizePath(`/?tag=${tag}#recipe-grid`, locale)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-secondary-soft px-3 text-sm font-medium text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
          <RecipeMemory memory={recipe.memory} locale={locale} lang={lang} />
        </div>
      )}

      <div className="mt-12 grid gap-12 sm:mt-16 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-4">
          {/* Stays in view beside the steps, and scrolls on its own when it is taller than the screen. */}
          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:rounded-xl">
            <IngredientList ingredients={recipe.ingredients} locale={locale} lang={lang} />
          </div>
        </aside>

        <div className="lg:col-span-8">
          <StepList steps={recipe.steps} locale={locale} lang={lang} />
        </div>
      </div>
    </main>
  );
}
