import type { Memory } from "@/types/recipe";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { formatMemoryDate } from "@/lib/recipe-view";
import { BookHeart } from "lucide-react";

type RecipeMemoryProps = {
  memory: Memory;
  locale: Locale;
  /** The story's language when it differs from the page's: Greek, for an untranslated recipe. */
  lang?: Locale;
};

/** The family story attached to a recipe. The page decides whether there is one. */
export function RecipeMemory({ memory, locale, lang }: RecipeMemoryProps) {
  const t = getMessages(locale).recipe;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-feature px-6 py-10 text-feature-foreground sm:px-12 sm:py-14">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-2 select-none font-serif text-[7rem] leading-[0.8] text-feature-accent/15 sm:right-10 sm:top-6 sm:text-[10rem]"
      >
        &rdquo;
      </span>
      <p className="flex items-center gap-2 text-sm font-semibold text-feature-accent">
        <BookHeart className="h-4 w-4" aria-hidden="true" />
        {t.story}
      </p>
      <h2 lang={lang} className="mt-4 text-balance font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{memory.title}</h2>
      <blockquote
        lang={lang}
        className="mt-4 max-w-3xl text-pretty font-serif text-xl italic leading-relaxed text-feature-foreground/90 sm:text-2xl"
      >
        {t.quoteOpen}
        {memory.story}
        {t.quoteClose}
      </blockquote>
      {memory.date !== undefined && (
        <p className="mt-6 text-sm text-feature-foreground/70">{formatMemoryDate(memory.date, locale)}</p>
      )}
    </section>
  );
}
