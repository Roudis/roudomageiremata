import { formatIngredientCount } from "@/lib/recipe-view";

type IngredientListProps = {
  ingredients: string[];
};

/**
 * Ingredients as plain checkboxes, so a cook can tick off what is ready. The ticks
 * are native form state: no client JavaScript, and they reset on reload.
 */
export function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">Υλικά</h2>
        <span className="rounded-full bg-secondary-soft px-2.5 py-0.5 text-xs font-semibold text-secondary">
          {formatIngredientCount(ingredients.length)}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Τσέκαρε ό,τι έχεις ήδη ετοιμάσει.</p>
      <ul className="mt-4 divide-y divide-border">
        {ingredients.map((ingredient, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3 py-3">
              <input type="checkbox" className="peer mt-1 h-4 w-4 shrink-0 cursor-pointer accent-secondary" />
              <span className="leading-relaxed transition-colors peer-checked:text-muted-foreground peer-checked:line-through">
                {ingredient}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
