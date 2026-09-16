import type { Recipe } from "@/types/recipe";
import { withBasePath } from "@/lib/base-path";

type RecipeHeroProps = {
  recipe: Pick<Recipe, "imageUrl" | "title">;
};

/** The full-width image above the recipe. Renders nothing when the recipe has no image. */
export function RecipeHero({ recipe }: RecipeHeroProps) {
  if (recipe.imageUrl === undefined) return null;

  return (
    <div className="relative mb-12 h-[350px] sm:h-[450px] lg:h-[550px] w-full overflow-hidden rounded-[3rem] shadow-2xl group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={withBasePath(recipe.imageUrl)}
        alt={recipe.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
      <div className="absolute inset-0 rounded-[3rem] ring-1 ring-inset ring-black/10 pointer-events-none" />
    </div>
  );
}
