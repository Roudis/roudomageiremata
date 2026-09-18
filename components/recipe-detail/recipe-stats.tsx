import type { ReactNode } from "react";
import type { Recipe } from "@/types/recipe";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { formatRecipeDate } from "@/lib/recipe-view";
import { CalendarDays, Clock, Flame, Users } from "lucide-react";

type StatTileProps = {
  /** Rendered as given, so the caller keeps the icon's colour. */
  icon: ReactNode;
  label: string;
  value: ReactNode;
  /** The value's language when it differs from the page's. */
  lang?: Locale;
};

function StatTile({ icon, label, value, lang }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 bg-card p-4">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd lang={lang} className="font-semibold">
        {value}
      </dd>
    </div>
  );
}

type RecipeStatsProps = {
  recipe: Pick<Recipe, "prepTime" | "cookTime" | "servings" | "updatedAt">;
  locale: Locale;
  /** The times' language when it differs from the page's: Greek, for an untranslated recipe. */
  lang?: Locale;
};

export function RecipeStats({ recipe, locale, lang }: RecipeStatsProps) {
  const t = getMessages(locale).recipe;
  const iconClass = "h-3.5 w-3.5 text-secondary";

  return (
    // gap-px over a border-coloured background draws the dividers however the tiles wrap.
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
      <StatTile
        icon={<Clock className={iconClass} aria-hidden="true" />}
        label={t.prepTime}
        value={recipe.prepTime ?? "—"}
        lang={lang}
      />
      <StatTile
        icon={<Flame className={iconClass} aria-hidden="true" />}
        label={t.cookTime}
        value={recipe.cookTime ?? "—"}
        lang={lang}
      />
      <StatTile icon={<Users className={iconClass} aria-hidden="true" />} label={t.servings} value={recipe.servings ?? "—"} />
      <StatTile
        icon={<CalendarDays className={iconClass} aria-hidden="true" />}
        label={t.updated}
        value={formatRecipeDate(recipe.updatedAt, locale)}
      />
    </dl>
  );
}
