import type { Memory } from "@/types/recipe";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { formatMemoryDate } from "@/lib/recipe-view";
import type { RecipeTitles } from "@/lib/story-text";
import { ButtonLink } from "@/components/button-link";
import { StoryText } from "@/components/story-text";
import { ArrowRight, BookHeart } from "lucide-react";

type RecipeMemoryProps = {
  /** The recipe the story belongs to, which is also the story page's id. */
  recipeId: string;
  memory: Memory;
  locale: Locale;
  /** Recipe titles in the page's language, for the recipes the story mentions. */
  titles: RecipeTitles;
  /** The story's language when it differs from the page's: Greek, for an untranslated recipe. */
  lang?: Locale;
};

/**
 * The start of the family story attached to a recipe, with a link to the whole
 * story on its own page, so a long story does not push the ingredients far down
 * for someone who came to cook. The page decides whether there is a story.
 */
export function RecipeMemory({ recipeId, memory, locale, titles, lang }: RecipeMemoryProps) {
  const t = getMessages(locale).recipe;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-feature px-6 py-8 text-feature-foreground sm:px-10 sm:py-10 print:hidden">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-2 select-none font-serif text-[7rem] leading-[0.8] text-feature-accent/15 sm:right-10 sm:top-6 sm:text-[9rem]"
      >
        &rdquo;
      </span>
      <p className="flex items-center gap-2 text-sm font-semibold text-feature-accent">
        <BookHeart className="h-4 w-4" aria-hidden="true" />
        {t.story}
      </p>
      <h2 lang={lang} className="mt-3 text-balance font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
        {memory.title}
      </h2>
      <StoryText
        story={memory.story}
        titles={titles}
        locale={locale}
        currentRecipeId={recipeId}
        tone="feature"
        inline
        lang={lang}
        className="mt-3 line-clamp-4 max-w-3xl text-pretty font-serif text-lg leading-relaxed text-feature-foreground/90"
      />
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <ButtonLink href={localizePath(`/stories/${recipeId}`, locale)} variant="feature">
          {t.readStory}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ButtonLink>
        {memory.date !== undefined && (
          <p className="text-sm text-feature-foreground/70">{formatMemoryDate(memory.date, locale)}</p>
        )}
      </div>
    </section>
  );
}
