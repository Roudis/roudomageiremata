import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Quote } from "lucide-react";
import { getBook } from "@/lib/book";
import { categoryLabel, textLang, toRecipeSummary } from "@/lib/recipe-view";
import { getCategoryOptions, recipesPath } from "@/lib/recipe-search";
import { withBasePath } from "@/lib/base-path";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { formatCount } from "@/lib/i18n/format";
import { getMessages } from "@/lib/i18n/messages";
import { languageAlternates } from "@/app/_shared/metadata";
import { ArrowLink, ButtonLink } from "@/components/button-link";
import { CategoryDot } from "@/components/category-badge";
import { SectionHeading } from "@/components/page-heading";
import { RecipeCard } from "@/components/recipe-card";
import { StoryFeature, StoryTeaser } from "@/components/story-card";

// The hero's three photos, laid out like prints left on the notebook: the first
// spans both rows, the other two stack beside it, each a little askew.
const snapshotFrames = ["col-span-3 row-span-2 -rotate-2", "col-span-2 rotate-2", "col-span-2 -rotate-1"];

/** How many of the newest recipes the home page shows; the fourth only fills the two-column tablet grid. */
const LATEST_RECIPES = 4;

export function homeMetadata(locale: Locale): Metadata {
  return { alternates: languageAlternates("/", locale) };
}

/**
 * The home page in one language, laid out like the opening pages of a book: the
 * cover, a few stories from the journal, the chapters, and the newest recipes.
 * app/(el)/page.tsx and app/[locale]/page.tsx render it.
 */
export async function HomePage({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const { recipes, stories, titles, categoryNames } = await getBook(locale);

  const latest = recipes.slice(0, LATEST_RECIPES).map(toRecipeSummary);
  // The hero shows photos of the recipes after the newest ones, so the same photo
  // does not open the page and then head the newest recipes further down.
  const withPhoto = recipes.flatMap(({ id, title, imageUrl, contentLocale }) =>
    imageUrl === undefined ? [] : [{ id, title, imageUrl, contentLocale }],
  );
  const snapshots =
    withPhoto.length >= 6 ? withPhoto.slice(3, 3 + snapshotFrames.length) : withPhoto.slice(0, snapshotFrames.length);

  const chapters = getCategoryOptions(recipes, categoryNames, locale).map((chapter) => ({
    ...chapter,
    count: recipes.filter((recipe) => categoryLabel(recipe) === chapter.label).length,
  }));
  const [leadStory, ...moreStories] = stories.slice(0, 4);

  const recipesHref = localizePath("/recipes", locale);
  const storiesHref = localizePath("/stories", locale);
  const stats = [
    { value: recipes.length, label: t.home.statRecipes, href: recipesHref },
    { value: chapters.length, label: t.home.statCategories, href: "#chapters" },
    { value: stories.length, label: t.home.statStories, href: storiesHref },
  ];

  return (
    <main className="page-container pt-10 sm:pt-16">
      <section className="grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1 className="mt-4 text-balance font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {t.home.headline} <em className="font-normal text-primary">{t.home.headlineEmphasis}</em>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">{t.home.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={recipesHref} variant="primary">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {t.home.browse}
            </ButtonLink>
            {leadStory !== undefined && (
              <ButtonLink href={storiesHref} variant="secondary">
                {t.home.readStories}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            )}
          </div>
        </div>

        {snapshots.length > 0 && (
          <div className="grid h-80 grid-cols-5 grid-rows-2 gap-3 px-1 sm:h-96 sm:gap-4 lg:col-span-5 lg:h-[28rem]">
            {snapshots.map((recipe, index) => (
              <Link
                key={recipe.id}
                href={localizePath(`/recipes/${recipe.id}`, locale)}
                className={`group flex min-h-0 flex-col rounded-sm bg-card p-1.5 shadow-md ring-1 ring-foreground/10 transition-transform duration-300 ease-out hover:z-10 hover:rotate-0 hover:scale-[1.02] motion-reduce:transition-none focus-ring-offset ${snapshotFrames[index]}`}
              >
                <img src={withBasePath(recipe.imageUrl)} alt="" className="min-h-0 w-full flex-1 object-cover" />
                <span
                  lang={textLang(recipe, locale)}
                  className="truncate px-1 pb-0.5 pt-2 font-serif text-xs italic text-muted-foreground sm:text-sm"
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
        <ul className="grid grid-cols-3 gap-4 lg:col-span-5">
          {stats.map((stat) => (
            <li key={stat.label} className="border-l-2 border-secondary/40 pl-4">
              <Link href={stat.href} className="group flex flex-col gap-1 rounded-sm focus-ring-offset">
                <span className="font-serif text-3xl font-semibold tabular-nums transition-colors group-hover:text-primary sm:text-4xl">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {leadStory !== undefined && (
        <section className="mt-16 sm:mt-24">
          <SectionHeading
            eyebrow={t.stories.eyebrow}
            title={t.stories.title}
            action={<ArrowLink href={storiesHref}>{t.nav.allStories}</ArrowLink>}
          />
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-12">
            {/* min-w-0 lets a long recipe name truncate instead of widening the column past a phone's screen. */}
            <div className="min-w-0 lg:col-span-7">
              <StoryFeature story={leadStory} locale={locale} titles={titles} />
            </div>
            {moreStories.length > 0 && (
              <div className="min-w-0 divide-y divide-border lg:col-span-5 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
                {moreStories.map((story) => (
                  <StoryTeaser key={story.id} story={story} locale={locale} titles={titles} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section id="chapters" className="mt-16 grid scroll-mt-24 gap-8 sm:mt-24 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">{t.home.chaptersEyebrow}</p>
          <h2 className="mt-2 text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.home.chaptersTitle}
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{t.home.chaptersIntro}</p>
        </div>
        {/* A table of contents: each chapter opens the recipe list filtered to it. */}
        <ol className="border-t border-border lg:col-span-8">
          {chapters.map((chapter, index) => (
            <li key={chapter.label} className="border-b border-border">
              <Link
                href={localizePath(recipesPath({ category: chapter.label }), locale)}
                className="group flex items-baseline gap-3 py-4 focus-ring sm:gap-4 sm:py-5"
              >
                <span aria-hidden="true" className="w-6 shrink-0 font-serif text-sm tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex min-w-0 items-baseline gap-2.5">
                  {/* The same dot the chapter has on cards and filter chips, lifted to the middle of the first line. */}
                  <span className="inline-flex shrink-0 -translate-y-[0.2em]">
                    <CategoryDot label={chapter.label} />
                  </span>
                  <span className="text-pretty font-serif text-lg font-semibold leading-snug transition-colors group-hover:text-primary sm:text-2xl">
                    {chapter.name}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="hidden min-w-8 flex-1 -translate-y-1 border-b-2 border-dotted border-foreground/25 sm:block"
                />
                <span className="ml-auto shrink-0 whitespace-nowrap text-sm tabular-nums text-muted-foreground sm:ml-0">
                  {formatCount(locale, t.counts.recipes, chapter.count)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 sm:mt-24">
        <SectionHeading
          eyebrow={t.home.latestEyebrow}
          title={t.home.latestTitle}
          action={<ArrowLink href={recipesHref}>{t.nav.allRecipes}</ArrowLink>}
        />
        {/* Three cards on phones and wide screens; the fourth evens out the two-column grid in between. */}
        <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 [&>*:nth-child(4)]:hidden sm:[&>*:nth-child(4)]:block lg:[&>*:nth-child(4)]:hidden">
          {latest.map((recipe) => (
            <div key={recipe.id}>
              <RecipeCard
                recipe={recipe}
                locale={locale}
                categoryNames={categoryNames}
                messages={{ recipeCard: t.recipeCard, tags: t.tags, counts: t.counts }}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
