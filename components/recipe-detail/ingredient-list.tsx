import { formatIngredientCount } from "@/lib/recipe-view";
import { CheckCircle2 } from "lucide-react";

type IngredientListProps = {
  ingredients: string[];
};

export function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <section className="glass-panel rounded-[2.5rem] p-10 sm:p-12">
      <div className="mb-8 flex items-end justify-between border-b border-stone-200/50 pb-6">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900">Υλικά</h2>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500">
          {formatIngredientCount(ingredients.length)}
        </span>
      </div>
      <ul className="space-y-4">
        {ingredients.map((ingredient, i) => (
          <li key={i} className="group flex items-start gap-4 rounded-2xl p-2 transition-colors hover:bg-white/50">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500 shadow-sm transition-transform group-hover:scale-110">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-lg text-stone-700 leading-relaxed">{ingredient}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
