import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecipesPage, recipesMetadata } from "@/app/_shared/recipes-page";
import { isTranslatedLocale } from "@/lib/i18n/config";

type LocaleRecipesProps = {
  params: { locale: string };
};

export function generateMetadata({ params }: LocaleRecipesProps): Metadata {
  return isTranslatedLocale(params.locale) ? recipesMetadata(params.locale) : {};
}

export default function LocaleRecipes({ params }: LocaleRecipesProps) {
  if (!isTranslatedLocale(params.locale)) notFound();

  return <RecipesPage locale={params.locale} />;
}
