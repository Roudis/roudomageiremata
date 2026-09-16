import type { ReactNode } from "react";
import type { Recipe } from "@/types/recipe";
import { formatRecipeDate } from "@/lib/recipe-view";
import { CalendarDays, Clock, Flame, Users } from "lucide-react";

type StatTileProps = {
  /** Rendered as given, so the caller keeps the icon's colour. */
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

function StatTile({ icon, label, value }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 bg-card p-4">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

type RecipeStatsProps = {
  recipe: Pick<Recipe, "prepTime" | "cookTime" | "servings" | "updatedAt">;
};

export function RecipeStats({ recipe }: RecipeStatsProps) {
  const iconClass = "h-3.5 w-3.5 text-secondary";

  return (
    // gap-px over a border-coloured background draws the dividers however the tiles wrap.
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
      <StatTile icon={<Clock className={iconClass} aria-hidden="true" />} label="Προετοιμασία" value={recipe.prepTime ?? "—"} />
      <StatTile icon={<Flame className={iconClass} aria-hidden="true" />} label="Μαγείρεμα" value={recipe.cookTime ?? "—"} />
      <StatTile icon={<Users className={iconClass} aria-hidden="true" />} label="Μερίδες" value={recipe.servings ?? "—"} />
      <StatTile
        icon={<CalendarDays className={iconClass} aria-hidden="true" />}
        label="Ανανεώθηκε"
        value={formatRecipeDate(recipe.updatedAt)}
      />
    </dl>
  );
}
