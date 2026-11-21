import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryPage, storyMetadata, storyStaticParams } from "@/app/_shared/story-page";
import { isTranslatedLocale } from "@/lib/i18n/config";

/** The route's params, in one place: Next 15 and later hand `params` over as a Promise. */
type StoryParams = {
  locale: string;
  id: string;
};

type LocaleStoryProps = {
  params: StoryParams;
};

/** Every story id, generated once for each language that app/[locale]/layout.tsx lists. */
export function generateStaticParams(): Promise<{ id: string }[]> {
  return storyStaticParams();
}

export async function generateMetadata({ params }: LocaleStoryProps): Promise<Metadata> {
  return isTranslatedLocale(params.locale) ? storyMetadata(params.id, params.locale) : {};
}

export default function LocaleStory({ params }: LocaleStoryProps) {
  if (!isTranslatedLocale(params.locale)) notFound();

  return <StoryPage id={params.id} locale={params.locale} />;
}
