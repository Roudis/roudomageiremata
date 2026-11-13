import { RecipesPage, recipesMetadata } from "@/app/_shared/recipes-page";

export const metadata = recipesMetadata("el");

export default function GreekRecipes() {
  return <RecipesPage locale="el" />;
}
