import Link from "next/link";
import { Recipe } from "@/types/recipe";

const categoryStyles = [
  "from-amber-100 via-orange-50 to-rose-100",
  "from-lime-100 via-emerald-50 to-teal-100",
  "from-sky-100 via-cyan-50 to-blue-100",
  "from-fuchsia-100 via-rose-50 to-orange-100",
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
      className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_18px_45px_rgba(120,85,45,0.12)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(120,85,45,0.18)]"
    >
      <div className={`relative h-44 bg-gradient-to-br ${gradient} p-6`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_40%)]" />
        <div className="relative flex h-full flex-col justify-between">
          <span className="w-fit rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
            {recipe.category ?? "Family Favorite"}
          </span>
          <div>
            <p className="text-sm text-stone-600">
              {recipe.prepTime ? `${recipe.prepTime} prep` : "Made with love"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-800">{recipe.title}</h2>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <p className="text-sm leading-6 text-stone-600">{recipe.description}</p>

        <div className="flex flex-wrap gap-2 text-xs font-medium text-stone-500">
          {recipe.cookTime ? <span className="rounded-full bg-stone-100 px-3 py-1">{recipe.cookTime} cook</span> : null}
          {recipe.servings ? <span className="rounded-full bg-stone-100 px-3 py-1">Serves {recipe.servings}</span> : null}
          {recipe.memory ? <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">Includes a memory</span> : null}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4 text-sm font-semibold text-orange-700">
          <span>{recipe.ingredients.length} ingredients</span>
          <span className="transition group-hover:translate-x-1">Read recipe →</span>
        </div>
      </div>
    </Link>
  );
}
