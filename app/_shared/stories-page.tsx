import type { Metadata } from "next";
import { getBook } from "@/lib/book";
import type { Locale } from "@/lib/i18n/config";
import { formatCount } from "@/lib/i18n/format";
import { getMessages } from "@/lib/i18n/messages";
import { languageAlternates } from "@/app/_shared/metadata";
import { PageHeader } from "@/components/page-heading";
import { StoryRow } from "@/components/story-card";

export function storiesMetadata(locale: Locale): Metadata {
  const t = getMessages(locale);
  return {
    title: t.nav.stories,
    description: t.stories.intro,
    alternates: languageAlternates("/stories", locale),
  };
}

/**
 * The journal: every family story in one language, newest recipe first, each
 * leading to its own page. app/(el)/stories and app/[locale]/stories render it.
 */
export async function StoriesPage({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const { stories, titles } = await getBook(locale);

  return (
    <main className="page-container grid gap-10 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-12">
      {/* On wide screens the heading stays in view beside the entries. */}
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <PageHeader
            eyebrow={t.stories.eyebrow}
            title={t.stories.title}
            intro={t.stories.intro}
            note={formatCount(locale, t.counts.stories, stories.length)}
          />
        </div>
      </div>

      <div className="border-b border-border lg:col-span-8">
        {stories.map((story) => (
          <StoryRow key={story.id} story={story} locale={locale} titles={titles} />
        ))}
      </div>
    </main>
  );
}
