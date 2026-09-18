import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecipePage, recipeMetadata, recipeStaticParams } from "@/app/_shared/recipe-page";
import { isTranslatedLocale } from "@/lib/i18n/config";

/** The route's params, in one place: Next 15 and later hand `params` over as a Promise. */
type RecipeParams = {
  locale: string;
  id: string;
};

type LocaleRecipeProps = {
  params: RecipeParams;
};

/** Every recipe id, generated once for each language that app/[locale]/layout.tsx lists. */
export function generateStaticParams(): Promise<{ id: string }[]> {
  return recipeStaticParams();
}

export async function generateMetadata({ params }: LocaleRecipeProps): Promise<Metadata> {
  return isTranslatedLocale(params.locale) ? recipeMetadata(params.id, params.locale) : {};
}

export default function LocaleRecipe({ params }: LocaleRecipeProps) {
  if (!isTranslatedLocale(params.locale)) notFound();

  return <RecipePage id={params.id} locale={params.locale} />;
}
