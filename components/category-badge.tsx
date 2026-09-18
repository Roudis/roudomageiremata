import type { CategoryNames, Recipe } from "@/types/recipe";
import { categoryColorIndex, categoryDisplayName, categoryLabel } from "@/lib/recipe-view";

// One dot colour per category, picked by categoryColorIndex: greens and purples to match
// the theme. Tailwind only scans app/ and components/, so these class strings have to
// live in a component file.
const dotColors = [
  "bg-lime-600",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-violet-400",
  "bg-green-700",
  "bg-fuchsia-600",
  "bg-teal-500",
];

/**
 * The coloured dot that identifies a category on cards, filters, and the detail page.
 * `label` is the Greek name, so a category keeps its colour in every language.
 */
export function CategoryDot({ label }: { label: string }) {
  const color = dotColors[categoryColorIndex(label, dotColors.length)];
  return <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${color}`} />;
}

/** The label is smaller on a card than on a detail page, so each keeps its own classes. */
const variants = {
  card: "text-xs font-medium",
  detail: "text-sm font-semibold",
};

type CategoryBadgeProps = {
  recipe: Pick<Recipe, "category">;
  /** Display names for the page's language, from getCategoryNames. */
  names: CategoryNames;
  variant: keyof typeof variants;
};

export function CategoryBadge({ recipe, names, variant }: CategoryBadgeProps) {
  const label = categoryLabel(recipe);

  return (
    <span className={`inline-flex items-center gap-2 text-secondary ${variants[variant]}`}>
      <CategoryDot label={label} />
      {categoryDisplayName(label, names)}
    </span>
  );
}
