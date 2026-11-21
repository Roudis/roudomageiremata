import Link from "next/link";
import { BookHeart, UtensilsCrossed } from "lucide-react";
import type { RecipeWithStory } from "@/types/recipe";
import { withBasePath } from "@/lib/base-path";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { formatMemoryDate, storyImageUrl, textLang } from "@/lib/recipe-view";
import { storyExcerpt, type RecipeTitles } from "@/lib/story-text";
import { ArrowLink } from "@/components/button-link";

/**
 * The ways a story appears in a list. Each is a server component that takes the
 * recipe the story belongs to: the story page lives at /stories/<recipe id>. A
 * story is shown with its own photo, or its recipe's when it has none.
 */
type StoryProps = {
  story: RecipeWithStory;
  locale: Locale;
  /** Recipe titles in the page's language, which the excerpt shows in place of `[[recipe-id]]`. */
  titles: RecipeTitles;
};

const storyPath = (story: RecipeWithStory, locale: Locale) => localizePath(`/stories/${story.id}`, locale);
const recipePath = (story: RecipeWithStory, locale: Locale) => localizePath(`/recipes/${story.id}`, locale);

/** "Recipe <title>", linking to the recipe the story belongs to. */
export function StoryRecipeLink({ story, locale }: Pick<StoryProps, "story" | "locale">) {
  const t = getMessages(locale).stories;

  return (
    <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
      <UtensilsCrossed className="h-3.5 w-3.5 shrink-0 text-secondary" aria-hidden="true" />
      <span className="shrink-0">{t.recipeLabel}</span>
      <Link
        href={recipePath(story, locale)}
        lang={textLang(story, locale)}
        className="truncate rounded-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline focus-ring"
      >
        {story.title}
      </Link>
    </p>
  );
}

/** An entry in the journal at /stories: the story's photo, its title, and how it starts. */
export function StoryRow({ story, locale, titles }: StoryProps) {
  const t = getMessages(locale).stories;
  const lang = textLang(story, locale);
  const href = storyPath(story, locale);
  const imageUrl = storyImageUrl(story);

  return (
    <article className="grid grid-cols-[5rem_1fr] gap-4 border-t border-border py-7 sm:grid-cols-[13rem_1fr] sm:gap-8 sm:py-9">
      {/* The title below is the link screen readers and the keyboard use; the photo is a second way in for the mouse. */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="group block aspect-square self-start overflow-hidden rounded-lg bg-muted sm:aspect-[4/3] sm:rounded-xl"
      >
        {imageUrl !== undefined ? (
          <img
            src={withBasePath(imageUrl)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground">
            <BookHeart className="h-7 w-7" />
          </span>
        )}
      </Link>

      <div className="min-w-0">
        {story.memory.date !== undefined && (
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">{formatMemoryDate(story.memory.date, locale)}</p>
        )}
        <h2 lang={lang} className="text-pretty font-serif text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
          <Link href={href} className="rounded-sm transition-colors hover:text-primary focus-ring">
            {story.memory.title}
          </Link>
        </h2>
        <p lang={lang} className="mt-2 line-clamp-3 text-pretty leading-relaxed text-muted-foreground">
          {storyExcerpt(story.memory.story, titles, 360)}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <ArrowLink href={href}>{t.read}</ArrowLink>
          <StoryRecipeLink story={story} locale={locale} />
        </div>
      </div>
    </article>
  );
}

/** A story in a short list, such as the home page's or a recipe's "also in these stories": title, two lines, recipe. */
export function StoryTeaser({ story, locale, titles }: StoryProps) {
  const lang = textLang(story, locale);

  return (
    <article className="min-w-0 py-5">
      <h3 lang={lang} className="text-pretty font-serif text-lg font-semibold leading-snug tracking-tight">
        <Link href={storyPath(story, locale)} className="rounded-sm transition-colors hover:text-primary focus-ring">
          {story.memory.title}
        </Link>
      </h3>
      <p lang={lang} className="mb-2.5 mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {storyExcerpt(story.memory.story, titles, 220)}
      </p>
      <StoryRecipeLink story={story} locale={locale} />
    </article>
  );
}

/** The newest story, on the aubergine band that opens the home page's journal section. */
export function StoryFeature({ story, locale, titles }: StoryProps) {
  const t = getMessages(locale).stories;
  const lang = textLang(story, locale);
  const href = storyPath(story, locale);

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-feature p-7 text-feature-foreground sm:p-10">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-3 select-none font-serif text-[7rem] leading-[0.8] text-feature-accent/15 sm:right-9 sm:top-6 sm:text-[9rem]"
      >
        &rdquo;
      </span>
      <p className="flex items-center gap-2 text-sm font-semibold text-feature-accent">
        <BookHeart className="h-4 w-4" aria-hidden="true" />
        {story.memory.date !== undefined ? formatMemoryDate(story.memory.date, locale) : t.label}
      </p>
      <h3 lang={lang} className="mt-4 text-balance font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
        <Link
          href={href}
          className="rounded-sm underline-offset-4 hover:underline focus-ring focus-visible:ring-feature-accent"
        >
          {story.memory.title}
        </Link>
      </h3>
      <p lang={lang} className="mt-4 line-clamp-5 text-pretty font-serif text-lg leading-relaxed text-feature-foreground/90">
        {storyExcerpt(story.memory.story, titles, 460)}
      </p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-8 gap-y-5 pt-8">
        <ArrowLink href={href} tone="feature">
          {t.read}
        </ArrowLink>
        <Link
          href={recipePath(story, locale)}
          className="group flex min-w-0 items-center gap-3 rounded-full focus-ring focus-visible:ring-feature-accent"
        >
          {story.imageUrl !== undefined && (
            <img
              src={withBasePath(story.imageUrl)}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-feature-accent/40"
            />
          )}
          <span className="min-w-0">
            <span className="block text-xs text-feature-foreground/70">{t.recipeLabel}</span>
            <span lang={lang} className="block truncate text-sm font-semibold underline-offset-4 group-hover:underline">
              {story.title}
            </span>
          </span>
        </Link>
      </div>
    </article>
  );
}
