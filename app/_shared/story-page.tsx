import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getBook } from "@/lib/book";
import { getAllRecipes } from "@/lib/recipes";
import { formatMemoryDate, textLang, toRecipeSummary } from "@/lib/recipe-view";
import { storyExcerpt, storyMentions, storyPlainText, type RecipeTitles } from "@/lib/story-text";
import type { RecipeWithStory } from "@/types/recipe";
import { withBasePath } from "@/lib/base-path";
import { LOCALE_DETAILS, SITE_NAME, localizePath, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { languageAlternates } from "@/app/_shared/metadata";
import { BackLink, UntranslatedNotice } from "@/components/page-links";
import { RecipeBanner } from "@/components/recipe-banner";
import { RecipeCard } from "@/components/recipe-card";
import { StoryRecipeLink } from "@/components/story-card";
import { StoryText } from "@/components/story-text";

// A large first letter, as a printed story would open.
const dropCap =
  "first-letter:float-left first-letter:mr-3 first-letter:mt-1.5 first-letter:font-serif first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-primary";

/**
 * The letter is two lines tall, so the opening paragraph gets one only when it is
 * long enough to wrap around it. Not for Japanese, which has no such convention.
 */
const DROP_CAP_MIN_LENGTH = 120;

function opensWithDropCap(story: RecipeWithStory, titles: RecipeTitles): boolean {
  const opening = story.memory.story.trim().split(/\n[ \t]*\n/)[0];
  return story.contentLocale !== "ja" && storyPlainText(opening, titles).length >= DROP_CAP_MIN_LENGTH;
}

/**
 * The ids that get a story page, in every language: the recipes that have a
 * story. As with recipes, do not add `export const dynamicParams = false`.
 */
export async function storyStaticParams(): Promise<{ id: string }[]> {
  const recipes = await getAllRecipes();
  return recipes.filter((recipe) => recipe.memory !== undefined).map((recipe) => ({ id: recipe.id }));
}

export async function storyMetadata(id: string, locale: Locale): Promise<Metadata> {
  const { stories, titles } = await getBook(locale);
  const story = stories.find((candidate) => candidate.id === id);

  if (!story) return {};

  const description = storyExcerpt(story.memory.story, titles, 180);
  const images =
    story.imageUrl !== undefined ? [{ url: withBasePath(story.imageUrl), alt: story.title }] : undefined;

  return {
    title: story.memory.title,
    description,
    alternates: languageAlternates(`/stories/${story.id}`, locale),
    // A page's openGraph replaces the layout's rather than merging into it, so the
    // site-level fields are repeated here.
    openGraph: {
      title: story.memory.title,
      description,
      siteName: SITE_NAME,
      locale: LOCALE_DETAILS[locale].openGraph,
      type: "article",
      images,
    },
  };
}

type StoryPageProps = {
  /** The id of the recipe the story belongs to. */
  id: string;
  locale: Locale;
};

/**
 * One family story in one language, set for reading, followed by the recipe it
 * belongs to and any other recipes it mentions. app/(el)/stories/[id] and
 * app/[locale]/stories/[id] render it.
 */
export async function StoryPage({ id, locale }: StoryPageProps) {
  const { recipes, stories, titles, categoryNames } = await getBook(locale);
  const index = stories.findIndex((candidate) => candidate.id === id);

  if (index === -1) {
    notFound();
  }

  const messages = getMessages(locale);
  const t = messages.stories;
  const story = stories[index];
  const { memory } = story;
  // Set only when the story has no translation for this language and its text is still Greek.
  const lang = textLang(story, locale);
  const cardMessages = { recipeCard: messages.recipeCard, tags: messages.tags, counts: messages.counts };

  // The other recipes the story links to, in the order it mentions them.
  const mentioned = storyMentions(memory.story).flatMap((mentionedId) => {
    const recipe = mentionedId === story.id ? undefined : recipes.find((candidate) => candidate.id === mentionedId);
    return recipe === undefined ? [] : [toRecipeSummary(recipe)];
  });

  // The journal lists the newest first, so "previous" is the newer neighbour.
  const neighbours = [
    { story: stories[index - 1], label: t.previous, Icon: ArrowLeft, align: "" },
    { story: stories[index + 1], label: t.next, Icon: ArrowRight, align: "sm:col-start-2 sm:items-end sm:text-right" },
  ];

  return (
    <main className="page-container pt-6 sm:pt-10">
      <BackLink href={localizePath("/stories", locale)}>{messages.nav.allStories}</BackLink>

      {lang !== undefined && <UntranslatedNotice>{t.untranslated}</UntranslatedNotice>}

      <article className="mx-auto mt-8 max-w-3xl sm:mt-12">
        <header>
          <p className="eyebrow">
            {t.label}
            {memory.date !== undefined && <> · {formatMemoryDate(memory.date, locale)}</>}
          </p>
          <h1
            lang={lang}
            className="mt-3 text-balance font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl"
          >
            {memory.title}
          </h1>
          <div className="mt-5">
            <StoryRecipeLink story={story} locale={locale} />
          </div>
        </header>

        {story.imageUrl !== undefined && (
          <div className="relative mt-8 overflow-hidden rounded-2xl bg-muted shadow-sm">
            <img
              src={withBasePath(story.imageUrl)}
              alt={story.title}
              lang={lang}
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/10" />
          </div>
        )}

        <StoryText
          story={memory.story}
          titles={titles}
          locale={locale}
          lang={lang}
          className="mt-10 space-y-6 font-serif text-lg leading-[1.8] sm:text-xl sm:leading-[1.8]"
          firstParagraphClassName={opensWithDropCap(story, titles) ? dropCap : ""}
        />
      </article>

      <section className="mx-auto mt-14 max-w-3xl border-t border-border pt-10 print:hidden">
        <h2 className="eyebrow">{t.recipe}</h2>
        <div className="mt-5">
          <RecipeBanner recipe={toRecipeSummary(story)} locale={locale} categoryNames={categoryNames} />
        </div>
      </section>

      {mentioned.length > 0 && (
        <section className="mx-auto mt-14 max-w-3xl print:hidden">
          <h2 className="eyebrow">{t.alsoMentioned}</h2>
          <div className="mt-5 grid gap-x-6 gap-y-10 sm:grid-cols-2">
            {mentioned.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                locale={locale}
                categoryNames={categoryNames}
                messages={cardMessages}
              />
            ))}
          </div>
        </section>
      )}

      {stories.length > 1 && (
        <nav
          aria-label={messages.nav.stories}
          className="mx-auto mt-14 grid max-w-3xl gap-6 border-t border-border pt-8 sm:grid-cols-2 print:hidden"
        >
          {neighbours.map(
            ({ story: neighbour, label, Icon, align }) =>
              neighbour !== undefined && (
                <Link
                  key={neighbour.id}
                  href={localizePath(`/stories/${neighbour.id}`, locale)}
                  className={`group flex flex-col gap-1.5 rounded-md focus-ring-offset ${align}`}
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {Icon === ArrowLeft && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                    {label}
                    {Icon === ArrowRight && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                  </span>
                  <span
                    lang={textLang(neighbour, locale)}
                    className="text-pretty font-serif text-lg font-semibold leading-snug transition-colors group-hover:text-primary"
                  >
                    {neighbour.memory.title}
                  </span>
                </Link>
              ),
          )}
        </nav>
      )}
    </main>
  );
}
