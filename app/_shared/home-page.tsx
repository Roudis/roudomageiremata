import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, Quote } from "lucide-react";
import { RecipeList } from "@/components/recipe-list";
import { getAllRecipes } from "@/lib/recipes";
import { getCategoryNames } from "@/lib/categories";
import { localizeRecipe, recipeOrder, toRecipeSummary } from "@/lib/recipe-view";
import { getCategories } from "@/lib/recipe-search";
import { withBasePath } from "@/lib/base-path";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { languageAlternates } from "@/app/_shared/metadata";

// The mosaic's first photo spans both rows; the other two stack beside it.
const mosaicCells = ["col-span-3 row-span-2", "col-span-2", "col-span-2"];

export function homeMetadata(locale: Locale): Metadata {
  return { alternates: languageAlternates("/", locale) };
}

/** The home page in one language; app/(el)/page.tsx and app/[locale]/page.tsx render it. */
export async function HomePage({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const [allRecipes, categoryNames] = await Promise.all([getAllRecipes(), getCategoryNames(locale)]);
  const recipes = allRecipes.map((recipe) => localizeRecipe(recipe, locale)).sort(recipeOrder(locale));
  const featured = recipes
    .flatMap(({ id, title, imageUrl, contentLocale }) =>
      imageUrl === undefined ? [] : [{ id, title, imageUrl, contentLocale }],
    )
    .slice(0, mosaicCells.length);

  const stats = [
    { value: recipes.length, label: t.home.statRecipes },
    { value: getCategories(recipes).length, label: t.home.statCategories },
    { value: recipes.filter((recipe) => recipe.memory !== undefined).length, label: t.home.statStories },
  ];

  return (
    <main className="page-container pt-10 sm:pt-16">
      <section className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="text-sm font-semibold text-secondary">{t.home.eyebrow}</p>
          <h1 className="mt-4 text-balance font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {t.home.headline} <em className="font-normal text-primary">{t.home.headlineEmphasis}</em>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {t.home.intro}
          </p>
          <a
            href="#recipe-grid"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t.home.browse}
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        {featured.length > 0 && (
          <div className="grid h-72 grid-cols-5 grid-rows-2 gap-3 sm:h-96 lg:col-span-5 lg:h-[28rem]">
            {featured.map((recipe, index) => (
              <Link
                key={recipe.id}
                href={localizePath(`/recipes/${recipe.id}`, locale)}
                className={`group relative overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${mosaicCells[index]}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={withBasePath(recipe.imageUrl)}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <span
                  lang={recipe.contentLocale === locale ? undefined : recipe.contentLocale}
                  className="absolute bottom-2 left-2 right-2 truncate rounded-md bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur sm:w-fit sm:max-w-[calc(100%-1rem)]"
                >
                  {recipe.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 grid gap-8 border-y border-border py-8 sm:mt-20 lg:grid-cols-12 lg:items-center lg:gap-12">
        <figure className="flex gap-4 lg:col-span-7">
          <Quote className="mt-1 h-6 w-6 shrink-0 fill-secondary-soft text-secondary" aria-hidden="true" />
          <blockquote className="text-pretty font-serif text-xl italic leading-relaxed sm:text-2xl">
            {t.home.quote}
          </blockquote>
        </figure>
        <dl className="grid grid-cols-3 gap-4 lg:col-span-5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-1 border-l-2 border-secondary/40 pl-4">
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="font-serif text-3xl font-semibold tabular-nums sm:text-4xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="recipe-grid" className="mt-16 scroll-mt-20 sm:mt-20">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{t.home.gridTitle}</h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{t.home.gridIntro}</p>
        </div>

        <RecipeList
          recipes={recipes.map(toRecipeSummary)}
          locale={locale}
          categoryNames={categoryNames}
          messages={{ recipeList: t.recipeList, recipeCard: t.recipeCard, counts: t.counts }}
        />
      </section>
    </main>
  );
}
