import type { Recipe } from "@/types/recipe";
import { categoryLabel } from "@/lib/recipe-view";

/** The pill looks different on a card and on a detail page, so each keeps its own classes. */
const variants = {
  card: "w-fit rounded-full bg-white/70 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-stone-700 shadow-sm",
  detail:
    "inline-block rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-orange-600 shadow-sm backdrop-blur-md border border-white/50",
};

type CategoryBadgeProps = {
  recipe: Pick<Recipe, "category">;
  variant: keyof typeof variants;
};

export function CategoryBadge({ recipe, variant }: CategoryBadgeProps) {
  return <span className={variants[variant]}>{categoryLabel(recipe)}</span>;
}
