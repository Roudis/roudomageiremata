import Link from "next/link";
import { Recipe } from "@/types/recipe";
import { Clock, ChefHat, Heart, ArrowRight, Utensils } from "lucide-react";

const categoryStyles = [
  "from-rose-400/20 via-orange-300/10 to-amber-200/20 group-hover:from-rose-400/30 group-hover:via-orange-300/20 group-hover:to-amber-200/30",
  "from-emerald-400/20 via-teal-300/10 to-cyan-200/20 group-hover:from-emerald-400/30 group-hover:via-teal-300/20 group-hover:to-cyan-200/30",
  "from-sky-400/20 via-blue-300/10 to-indigo-200/20 group-hover:from-sky-400/30 group-hover:via-blue-300/20 group-hover:to-indigo-200/30",
  "from-fuchsia-400/20 via-pink-300/10 to-rose-200/20 group-hover:from-fuchsia-400/30 group-hover:via-pink-300/20 group-hover:to-rose-200/30",
];

type RecipeCardProps = {
  recipe: Recipe;
  index: number;
};

export function RecipeCard({ recipe, index }: RecipeCardProps) {
  const gradient = categoryStyles[index % categoryStyles.length];

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(225,29,72,0.1)] relative"
    >
      <div className={`relative h-48 bg-gradient-to-br ${gradient} p-8 transition-colors duration-500 overflow-hidden`}>
        {recipe.imageUrl && (
          <img src={recipe.imageUrl} alt={recipe.title} className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-700" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.8),transparent_50%)] mix-blend-overlay" />
        <div className="relative flex h-full flex-col justify-between z-10">
          <div className="flex justify-between items-start">
            <span className="w-fit rounded-full bg-white/70 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-stone-700 shadow-sm">
              {recipe.category ?? "Αγαπημενο της Οικογενειας"}
            </span>
            {recipe.memory && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-500 shadow-sm">
                <Heart className="h-4 w-4 fill-rose-500" />
              </span>
            )}
          </div>
          <div className="mt-auto">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 group-hover:text-rose-600 transition-colors duration-300 line-clamp-2">
              {recipe.title}
            </h2>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-8 bg-gradient-to-b from-white/20 to-white/40">
        <p className="text-sm leading-relaxed text-stone-600 line-clamp-3">
          {recipe.description}
        </p>

        <div className="flex flex-wrap gap-3 text-xs font-medium text-stone-600 mt-auto pt-4">
          {recipe.prepTime && (
            <span className="flex items-center gap-1.5 rounded-xl bg-white/50 px-3 py-2 shadow-sm border border-white/20">
              <Clock className="h-3.5 w-3.5 text-orange-500" />
              {recipe.prepTime}
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1.5 rounded-xl bg-white/50 px-3 py-2 shadow-sm border border-white/20">
              <Utensils className="h-3.5 w-3.5 text-emerald-500" />
              {recipe.servings}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-stone-200/50 pt-5 mt-2">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500">
            <ChefHat className="h-4 w-4" />
            {recipe.ingredients.length} υλικά
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white transition-transform duration-300 group-hover:scale-110 group-hover:bg-rose-600">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
