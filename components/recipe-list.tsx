"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CategoryNames, RecipeSummary } from "@/types/recipe";
import type { Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/config";
import { formatCount } from "@/lib/i18n/format";
import { filterRecipes, getCategoryOptions, getTags } from "@/lib/recipe-search";
import { isTagId, tagName, type TagId } from "@/lib/tags";
import { RecipeCard } from "@/components/recipe-card";
import { CategoryDot } from "@/components/category-badge";
import { ChipRow, FilterChip } from "@/components/filter-chips";
import { Search, Tags, X } from "lucide-react";
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
 * The selected tag, mirrored in the address as ?tag= so reloading or sharing keeps
 * the filter. A recipe page's tags link here as ?tag=<id>, which is read after
 * mount: the static HTML has no query string.
 */
function useTagParam(): [TagId | null, (tag: TagId | null) => void] {
  const [tag, setTag] = useState<TagId | null>(null);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("tag");
    if (isTagId(param)) setTag(param);
  }, []);

  const selectTag = useCallback((next: TagId | null) => {
    setTag(next);
    const url = new URL(window.location.href);
    if (next === null) url.searchParams.delete("tag");
    else url.searchParams.set("tag", next);
    window.history.replaceState(window.history.state, "", url);
  }, []);

  return [tag, selectTag];
}

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  messages: Messages["recipeList"];
};

function SearchField({ value, onChange, messages: t }: SearchFieldProps) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        placeholder={t.searchPlaceholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-10 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25 [&::-webkit-search-cancel-button]:hidden"
        aria-label={t.searchLabel}
      />
      {value !== "" && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-ring"
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, selectTag] = useTagParam();

  const categories = useMemo(
    () => getCategoryOptions(recipes, categoryNames, locale),
    [recipes, categoryNames, locale],
  );
  const tags = useMemo(() => getTags(recipes), [recipes]);

  const filteredRecipes = useMemo(
    () => filterRecipes(recipes, { query: searchQuery, category: selectedCategory, tag: selectedTag, locale }),
    [recipes, searchQuery, selectedCategory, selectedTag, locale],
  );

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    selectTag(null);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField value={searchQuery} onChange={setSearchQuery} messages={t} />

          {/* Hidden from screen readers, which hear the count from the live region below. */}
          <p aria-hidden="true" className="text-sm text-muted-foreground">
            {formatCount(locale, messages.counts.recipes, filteredRecipes.length)}
          </p>
        </div>

        <ChipRow>
          <FilterChip tone="category" pressed={selectedCategory === null} onClick={() => setSelectedCategory(null)}>
            {t.allCategories}
          </FilterChip>
          {categories.map(({ label, name }) => (
            <FilterChip
              key={label}
              tone="category"
              pressed={selectedCategory === label}
              onClick={() => setSelectedCategory(label)}
            >
              <CategoryDot label={label} />
              {name}
            </FilterChip>
          ))}
        </ChipRow>

        {tags.length > 0 && (
          <ChipRow label={messages.tags.label}>
            <span aria-hidden="true" className="inline-flex shrink-0 items-center gap-1.5 pr-1 text-xs font-semibold text-muted-foreground">
              <Tags className="h-3.5 w-3.5" />
              {messages.tags.label}
            </span>
            {/* Pressing the selected tag again clears it. */}
            {tags.map((tag) => (
              <FilterChip
                key={tag}
                tone="tag"
                pressed={selectedTag === tag}
                onClick={() => selectTag(selectedTag === tag ? null : tag)}
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
                <RecipeCard recipe={recipe} locale={locale} categoryNames={categoryNames} messages={messages} />
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
              <h3 className="font-serif text-xl font-semibold">{t.emptyTitle}</h3>
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
