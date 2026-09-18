"use client";

import { useEffect, useMemo, useState } from "react";
import type { CategoryNames, RecipeSummary } from "@/types/recipe";
import type { Messages } from "@/lib/i18n/messages";
import { LOCALE_DETAILS, type Locale } from "@/lib/i18n/config";
import { formatCount } from "@/lib/i18n/format";
import { filterRecipes, getCategories, getTags } from "@/lib/recipe-search";
import { categoryDisplayName } from "@/lib/recipe-view";
import { isTagId, tagName, type TagId } from "@/lib/tags";
import { RecipeCard } from "@/components/recipe-card";
import { CategoryDot } from "@/components/category-badge";
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

const chipBase =
  "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const chipIdle = "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground";
const chipActive = "border-primary bg-primary text-primary-foreground";

// Tags are smaller and green, so they read as a second, lighter filter under the categories.
const tagChipBase =
  "inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const tagChipIdle = "border-border text-muted-foreground hover:border-secondary/50 hover:text-secondary";
const tagChipActive = "border-secondary bg-secondary text-secondary-foreground";

/** Puts the selected tag in the address as ?tag=, so reloading or sharing keeps the filter. */
function writeTagToUrl(tag: TagId | null) {
  const url = new URL(window.location.href);
  if (tag === null) url.searchParams.delete("tag");
  else url.searchParams.set("tag", tag);
  window.history.replaceState(window.history.state, "", url);
}

export function RecipeList({ recipes, locale, categoryNames, messages }: RecipeListProps) {
  const t = messages.recipeList;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<TagId | null>(null);

  // A recipe page's tags link here as ?tag=<id>. Read after mount: the static HTML has no query string.
  useEffect(() => {
    const tag = new URLSearchParams(window.location.search).get("tag");
    if (isTagId(tag)) setSelectedTag(tag);
  }, []);

  const selectTag = (tag: TagId | null) => {
    setSelectedTag(tag);
    writeTagToUrl(tag);
  };

  // Filtering keys on the Greek names; the chips show, and are sorted by, the page's language.
  const categories = useMemo(() => {
    const collator = new Intl.Collator(LOCALE_DETAILS[locale].intl);
    return getCategories(recipes)
      .map((label) => ({ label, name: categoryDisplayName(label, categoryNames) }))
      .sort((a, b) => collator.compare(a.name, b.name));
  }, [recipes, locale, categoryNames]);

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
          <div className="relative w-full sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-10 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25 [&::-webkit-search-cancel-button]:hidden"
              aria-label={t.searchLabel}
            />
            {searchQuery !== "" && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t.clearSearch}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <p aria-hidden="true" className="text-sm text-muted-foreground">
            {formatCount(locale, messages.counts.recipes, filteredRecipes.length)}
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
            {t.allCategories}
          </button>
          {categories.map(({ label, name }) => (
            <button
              type="button"
              key={label}
              onClick={() => setSelectedCategory(label)}
              aria-pressed={selectedCategory === label}
              className={`${chipBase} ${selectedCategory === label ? chipActive : chipIdle}`}
            >
              <CategoryDot label={label} />
              {name}
            </button>
          ))}
        </div>

        {tags.length > 0 && (
          <div
            role="group"
            aria-label={messages.tags.label}
            className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            <span aria-hidden="true" className="inline-flex shrink-0 items-center gap-1.5 pr-1 text-xs font-semibold text-muted-foreground">
              <Tags className="h-3.5 w-3.5" />
              {messages.tags.label}
            </span>
            {/* Pressing the selected tag again clears it. */}
            {tags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => selectTag(selectedTag === tag ? null : tag)}
                aria-pressed={selectedTag === tag}
                className={`${tagChipBase} ${selectedTag === tag ? tagChipActive : tagChipIdle}`}
              >
                {tagName(tag, locale)}
              </button>
            ))}
          </div>
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
                className="mt-2 inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
