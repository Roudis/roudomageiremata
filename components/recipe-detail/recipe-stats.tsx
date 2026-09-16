import type { ReactNode } from "react";
import type { Recipe } from "@/types/recipe";
import { formatRecipeDate } from "@/lib/recipe-view";
import { CalendarDays, Clock, Utensils } from "lucide-react";

type StatTileProps = {
  /** Rendered as given, so the caller keeps the icon's colour. */
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

function StatTile({ icon, label, value }: StatTileProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white/40 p-4 border border-white/40">
      {icon}
      <span className="text-sm font-medium text-stone-500">{label}</span>
      <span className="font-bold text-stone-900">{value}</span>
    </div>
  );
}

type RecipeStatsProps = {
  recipe: Pick<Recipe, "prepTime" | "cookTime" | "servings" | "updatedAt">;
};

export function RecipeStats({ recipe }: RecipeStatsProps) {
  return (
    <section className="glass-panel flex flex-col gap-6 rounded-[2.5rem] p-8 sm:p-10">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Σημειωσεις της Κουζινας</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile icon={<Clock className="h-5 w-5 text-orange-400" />} label="Προετοιμασία" value={recipe.prepTime ?? "—"} />
        <StatTile icon={<Clock className="h-5 w-5 text-rose-400" />} label="Μαγείρεμα" value={recipe.cookTime ?? "—"} />
        <StatTile icon={<Utensils className="h-5 w-5 text-emerald-400" />} label="Μερίδες" value={recipe.servings ?? "—"} />
        <StatTile
          icon={<CalendarDays className="h-5 w-5 text-blue-400" />}
          label="Ανανεώθηκε"
          value={formatRecipeDate(recipe.updatedAt)}
        />
      </div>
    </section>
  );
}
