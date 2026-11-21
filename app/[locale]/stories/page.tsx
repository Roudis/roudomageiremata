import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoriesPage, storiesMetadata } from "@/app/_shared/stories-page";
import { isTranslatedLocale } from "@/lib/i18n/config";

type LocaleStoriesProps = {
  params: { locale: string };
};

export function generateMetadata({ params }: LocaleStoriesProps): Metadata {
  return isTranslatedLocale(params.locale) ? storiesMetadata(params.locale) : {};
}

export default function LocaleStories({ params }: LocaleStoriesProps) {
  if (!isTranslatedLocale(params.locale)) notFound();

  return <StoriesPage locale={params.locale} />;
}
