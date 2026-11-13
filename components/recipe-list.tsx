"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CategoryNames, RecipeSummary } from "@/types/recipe";
import type { Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/config";
import { formatCount } from "@/lib/i18n/format";
import {
  NO_FILTERS,
  filterParams,
  filterRecipes,
  getCategoryOptions,
  getTags,
  parseFilterParams,
  type RecipeFilterParams,
} from "@/lib/recipe-search";
import { tagName } from "@/lib/tags";
import { RecipeCard } from "@/components/recipe-card";
import { CategoryDot } from "@/components/category-badge";
import { ChipRow, ChipRowLabel, FilterChip } from "@/components/filter-chips";
import { BookOpen, Search, Tags, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type RecipeListProps = {
  /** Already in the page's language and order. */
  recipes: RecipeSummary[];
  locale: Locale;
  categoryNames: CategoryNames;
  /** Only the sections this list and its cards render, so the page sends little text to the browser. */
  messages: Pick<Messages, "recipeList" | "recipeCard" | "tags" | "counts">;
};

/**
 * The search text, chapter, and tag, mirrored in the address as ?q=, ?category=,
 * and ?tag=. That keeps the filters when a visitor opens a recipe and comes back,
 * reloads, or shares the link, and it is how chapter and tag links elsewhere on
 * the site open the list already filtered. The address is read after mount: the
 * static HTML has no query string.
 */
function useUrlFilters(categories: readonly string[]): [RecipeFilterParams, (changes: Partial<RecipeFilterParams>) => void] {
  const [filters, setFilters] = useState(NO_FILTERS);
  // False until the address has been read, so the first render does not wipe it.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFilters(parseFilterParams(window.location.search, categories));
    setReady(true);
  }, [categories]);

  useEffect(() => {
    if (!ready) return;
    // After a pause, so typing in the search box does not rewrite the address on every key.
    const timer = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.search = filterParams(filters);
      if (url.href !== window.location.href) window.history.replaceState(window.history.state, "", url);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [filters, ready]);

  const update = useCallback((changes: Partial<RecipeFilterParams>) => {
    setFilters((current) => ({ ...current, ...changes }));
  }, []);

  return [filters, update];
}

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  messages: Messages["recipeList"];
};

function SearchField({ value, onChange, messages: t }: SearchFieldProps) {
  return (
    <div className="relative w-full sm:max-w-md">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        placeholder={t.searchPlaceholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-11 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25 [&::-webkit-search-cancel-button]:hidden"
        aria-label={t.searchLabel}
      />
      {value !== "" && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-ring"
          aria-label={t.clearSearch}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function RecipeList({ recipes, locale, categoryNames, messages }: RecipeListProps) {
  const t = messages.recipeList;

  const categories = useMemo(
    () => getCategoryOptions(recipes, categoryNames, locale),
    [recipes, categoryNames, locale],
  );
  const categoryLabels = useMemo(() => categories.map(({ label }) => label), [categories]);
  const tags = useMemo(() => getTags(recipes), [recipes]);

  const [filters, setFilters] = useUrlFilters(categoryLabels);
  const { query, category: selectedCategory, tag: selectedTag } = filters;
  const isFiltered = query !== "" || selectedCategory !== null || selectedTag !== null;

  const filteredRecipes = useMemo(
    () => filterRecipes(recipes, { query, category: selectedCategory, tag: selectedTag, locale }),
    [recipes, query, selectedCategory, selectedTag, locale],
  );

  const resetFilters = () => setFilters(NO_FILTERS);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField value={query} onChange={(value) => setFilters({ query: value })} messages={t} />

          <div className="flex items-center gap-4 text-sm">
            {/* Hidden from screen readers, which hear the count from the live region below. */}
            <p aria-hidden="true" className="text-muted-foreground">
              {formatCount(locale, messages.counts.recipes, filteredRecipes.length)}
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-ring"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                {t.resetFilters}
              </button>
            )}
          </div>
        </div>

        <ChipRow label={t.categoriesLabel}>
          <ChipRowLabel>
            <BookOpen className="h-3.5 w-3.5" />
            {t.categoriesLabel}
          </ChipRowLabel>
          <FilterChip tone="category" pressed={selectedCategory === null} onClick={() => setFilters({ category: null })}>
            {t.allCategories}
          </FilterChip>
          {categories.map(({ label, name }) => (
            <FilterChip
              key={label}
              tone="category"
              pressed={selectedCategory === label}
              onClick={() => setFilters({ category: label })}
            >
              <CategoryDot label={label} />
              {name}
            </FilterChip>
          ))}
        </ChipRow>

        {tags.length > 0 && (
          <ChipRow label={messages.tags.label}>
            <ChipRowLabel>
              <Tags className="h-3.5 w-3.5" />
              {messages.tags.label}
            </ChipRowLabel>
            {/* Pressing the selected tag again clears it. */}
            {tags.map((tag) => (
              <FilterChip
                key={tag}
                tone="tag"
                pressed={selectedTag === tag}
                onClick={() => setFilters({ tag: selectedTag === tag ? null : tag })}
              >
                {tagName(tag, locale)}
              </FilterChip>
            ))}
          </ChipRow>
        )}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {formatCount(locale, messages.counts.found, filteredRecipes.length)}
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
                {/* The page's <h1> is the only heading above the cards, so their titles are <h2>. */}
                <RecipeCard
                  recipe={recipe}
                  locale={locale}
                  categoryNames={categoryNames}
                  messages={messages}
                  headingLevel="h2"
                />
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
              <h2 className="font-serif text-xl font-semibold">{t.emptyTitle}</h2>
              <p className="max-w-sm text-sm text-muted-foreground">{t.emptyText}</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary focus-ring"
              >
                {t.resetFilters}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
