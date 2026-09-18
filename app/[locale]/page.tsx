import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage, homeMetadata } from "@/app/_shared/home-page";
import { isTranslatedLocale } from "@/lib/i18n/config";

type LocaleHomeProps = {
  params: { locale: string };
};

export function generateMetadata({ params }: LocaleHomeProps): Metadata {
  return isTranslatedLocale(params.locale) ? homeMetadata(params.locale) : {};
}

export default function LocaleHome({ params }: LocaleHomeProps) {
  if (!isTranslatedLocale(params.locale)) notFound();

  return <HomePage locale={params.locale} />;
}
