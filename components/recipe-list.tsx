"use client";

import { useState, useMemo } from "react";
import { Recipe } from "@/types/recipe";
import { RecipeCard } from "@/components/recipe-card";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type RecipeListProps = {
  initialRecipes: Recipe[];
};

export function RecipeList({ initialRecipes }: RecipeListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(initialRecipes.map((r) => r.category ?? "Άλλο"));
    return Array.from(cats).sort();
  }, [initialRecipes]);

  // Filter recipes based on search query and selected category
  const filteredRecipes = useMemo(() => {
    return initialRecipes.filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory ? (recipe.category ?? "Άλλο") === selectedCategory : true;

      return matchesSearch && matchesCategory;
    });
  }, [initialRecipes, searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col gap-10">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-white/50 p-6 rounded-[2rem] backdrop-blur-md shadow-sm border border-stone-200/50">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input
            type="text"
            placeholder="Αναζήτηση συνταγής ή υλικού..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full bg-white pl-12 pr-4 py-3 text-sm shadow-sm ring-1 ring-stone-200/50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow"
            aria-label="Αναζήτηση συνταγής"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              selectedCategory === null
                ? "bg-stone-900 text-white shadow-md"
                : "bg-white text-stone-600 hover:bg-stone-100 ring-1 ring-stone-200/50"
            }`}
          >
            Ολα
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-white text-stone-600 hover:bg-orange-50 ring-1 ring-stone-200/50 hover:text-orange-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Grid with Framer Motion */}
      <motion.div 
        layout
        className="grid gap-8 md:grid-cols-2 xl:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={recipe.id}
                className="h-full"
              >
                <RecipeCard recipe={recipe} index={index} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400 mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Δε βρέθηκαν συνταγές</h3>
              <p className="text-stone-500 max-w-sm">
                Δοκίμασε να αλλάξεις τους όρους αναζήτησης ή να επιλέξεις άλλη κατηγορία.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
