"use client";

import { useState, useMemo } from "react";
import type { RecipeSummary } from "@/types/recipe";
import { filterRecipes, getCategories } from "@/lib/recipe-search";
import { RecipeCard } from "@/components/recipe-card";
import { CategoryDot } from "@/components/category-badge";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type RecipeListProps = {
  recipes: RecipeSummary[];
};

const chipBase =
  "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const chipIdle = "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground";
const chipActive = "border-primary bg-primary text-primary-foreground";

export function RecipeList({ recipes }: RecipeListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => getCategories(recipes), [recipes]);

  const filteredRecipes = useMemo(
    () => filterRecipes(recipes, { query: searchQuery, category: selectedCategory }),
    [recipes, searchQuery, selectedCategory],
  );

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Αναζήτηση συνταγής ή υλικού…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-10 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25 [&::-webkit-search-cancel-button]:hidden"
              aria-label="Αναζήτηση συνταγής"
            />
            {searchQuery !== "" && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Καθαρισμός αναζήτησης"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <p aria-hidden="true" className="text-sm text-muted-foreground">
            {filteredRecipes.length === 1 ? "1 συνταγή" : `${filteredRecipes.length} συνταγές`}
          </p>
        </div>

        {/* One scrolling row on phones, wrapped on wider screens. */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            aria-pressed={selectedCategory === null}
            className={`${chipBase} ${selectedCategory === null ? chipActive : chipIdle}`}
          >
            Όλες
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
              className={`${chipBase} ${selectedCategory === cat ? chipActive : chipIdle}`}
            >
              <CategoryDot label={cat} />
              {cat}
            </button>
          ))}
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {`Βρέθηκαν ${filteredRecipes.length} συνταγές`}
      </p>

      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                key={recipe.id}
                className="h-full"
              >
                <RecipeCard recipe={recipe} />
              </motion.div>
            ))
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full flex flex-col items-start gap-3 rounded-xl border border-dashed border-border px-6 py-12 sm:items-center sm:text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                <Search className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-serif text-xl font-semibold">Δε βρέθηκαν συνταγές</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Δοκίμασε να αλλάξεις τους όρους αναζήτησης ή να επιλέξεις άλλη κατηγορία.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Καθαρισμός φίλτρων
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
