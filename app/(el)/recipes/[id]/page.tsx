import type { Metadata } from "next";
import { RecipePage, recipeMetadata, recipeStaticParams } from "@/app/_shared/recipe-page";

/**
 * The route's params, in one place: Next 15 and later hand `params` to pages and
 * to generateMetadata as a Promise, which makes that upgrade a single edit here.
 */
type RecipeParams = {
  id: string;
};

type GreekRecipeProps = {
  params: RecipeParams;
};

export function generateStaticParams(): Promise<RecipeParams[]> {
  return recipeStaticParams();
}

export function generateMetadata({ params }: GreekRecipeProps): Promise<Metadata> {
  return recipeMetadata(params.id, "el");
}

export default function GreekRecipe({ params }: GreekRecipeProps) {
  return <RecipePage id={params.id} locale="el" />;
}
