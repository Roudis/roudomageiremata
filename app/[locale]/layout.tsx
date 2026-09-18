import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RootLayout, rootMetadata } from "@/app/_shared/root-layout";
import { TRANSLATED_LOCALES, isTranslatedLocale, type TranslatedLocale } from "@/lib/i18n/config";

/**
 * Every language except Greek, under its code: "/en", "/en/recipes/<id>". Greek
 * lives in app/(el). Next 15 and later hand `params` over as a Promise.
 */
type LocaleParams = {
  locale: string;
};

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: LocaleParams;
}>;

export function generateStaticParams(): { locale: TranslatedLocale }[] {
  return TRANSLATED_LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: LocaleLayoutProps): Metadata {
  return isTranslatedLocale(params.locale) ? rootMetadata(params.locale) : {};
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // Only reachable in `npm run dev`: the static export has pages for TRANSLATED_LOCALES only.
  if (!isTranslatedLocale(params.locale)) notFound();

  return <RootLayout locale={params.locale}>{children}</RootLayout>;
}
