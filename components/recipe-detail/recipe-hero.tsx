import type { Recipe } from "@/types/recipe";
import { withBasePath } from "@/lib/base-path";

type RecipeHeroProps = {
  recipe: Pick<Recipe, "imageUrl" | "title">;
};

/** The recipe's photo beside its title. Renders nothing when the recipe has no image. */
export function RecipeHero({ recipe }: RecipeHeroProps) {
  if (recipe.imageUrl === undefined) return null;

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={withBasePath(recipe.imageUrl)} alt={recipe.title} className="h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/10" />
    </div>
  );
}
