"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Recipe } from "@/types/recipe";

type RecipeFormProps = {
  mode: "create" | "edit";
  recipe?: Recipe;
};

type FormState = {
  title: string;
  description: string;
  category: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  imageUrl: string;
  ingredients: string;
  steps: string;
  memoryTitle: string;
  memoryStory: string;
  memoryDate: string;
};

function buildInitialState(recipe?: Recipe): FormState {
  return {
    title: recipe?.title ?? "",
    description: recipe?.description ?? "",
    category: recipe?.category ?? "",
    prepTime: recipe?.prepTime ?? "",
    cookTime: recipe?.cookTime ?? "",
    servings: recipe?.servings ? String(recipe.servings) : "",
    imageUrl: recipe?.imageUrl ?? "",
    ingredients: recipe?.ingredients.join("\n") ?? "",
    steps: recipe?.steps.join("\n") ?? "",
    memoryTitle: recipe?.memory?.title ?? "",
    memoryStory: recipe?.memory?.story ?? "",
    memoryDate: recipe?.memory?.date ?? "",
  };
}

export function RecipeForm({ mode, recipe }: RecipeFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(() => buildInitialState(recipe));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageCopy = useMemo(
    () =>
      mode === "create"
        ? {
            title: "Add a new family favorite",
            subtitle: "Capture the ingredients, the little rituals, and the story that makes the dish unforgettable.",
            button: "Save recipe",
          }
        : {
            title: "Refresh the recipe notes",
            subtitle: "Update measurements, timing, or the memory that belongs with this dish.",
            button: "Update recipe",
          },
    [mode],
  );

  const handleChange = (field: keyof FormState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(mode === "create" ? "/api/recipes" : `/api/recipes/${recipe?.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formState.title,
          description: formState.description,
          category: formState.category,
          prepTime: formState.prepTime,
          cookTime: formState.cookTime,
          servings: formState.servings ? Number(formState.servings) : undefined,
          imageUrl: formState.imageUrl,
          ingredients: formState.ingredients.split("\n"),
          steps: formState.steps.split("\n"),
          memory: {
            title: formState.memoryTitle,
            story: formState.memoryStory,
            date: formState.memoryDate,
          },
        }),
      });

      const payload = (await response.json()) as { error?: string; recipe?: Recipe };

      if (!response.ok || !payload.recipe) {
        throw new Error(payload.error ?? "Something went wrong while saving the recipe.");
      }

      router.push(`/recipes/${payload.recipe.id}`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to save the recipe right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_18px_45px_rgba(120,85,45,0.14)] sm:p-10">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-700">Recipe journal</p>
        <h1 className="mt-3 text-4xl font-semibold text-stone-900">{pageCopy.title}</h1>
        <p className="mt-4 text-lg leading-8 text-stone-600">{pageCopy.subtitle}</p>
      </div>

      <form className="mt-10 space-y-10" onSubmit={handleSubmit}>
        <section className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-stone-700">Recipe title</span>
            <input
              required
              value={formState.title}
              onChange={(event) => handleChange("title", event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
              placeholder="Yiayia's lemon potatoes"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-stone-700">Description</span>
            <textarea
              required
              value={formState.description}
              onChange={(event) => handleChange("description", event.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
              placeholder="What makes this dish special at the table?"
            />
          </label>

          {[
            ["category", "Category", "Weeknight comfort"],
            ["prepTime", "Prep time", "25 mins"],
            ["cookTime", "Cook time", "1 hr"],
            ["servings", "Servings", "6"],
          ].map(([field, label, placeholder]) => (
            <label key={field} className="space-y-2">
              <span className="text-sm font-semibold text-stone-700">{label}</span>
              <input
                type={field === "servings" ? "number" : "text"}
                min={field === "servings" ? 1 : undefined}
                value={formState[field as keyof FormState]}
                onChange={(event) => handleChange(field as keyof FormState, event.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                placeholder={placeholder}
              />
            </label>
          ))}

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-stone-700">Optional image URL</span>
            <input
              type="url"
              value={formState.imageUrl}
              onChange={(event) => handleChange("imageUrl", event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
              placeholder="https://example.com/family-recipe.jpg"
            />
          </label>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-700">Ingredients</span>
            <textarea
              required
              value={formState.ingredients}
              onChange={(event) => handleChange("ingredients", event.target.value)}
              rows={8}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
              placeholder="One ingredient per line"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-stone-700">Steps</span>
            <textarea
              required
              value={formState.steps}
              onChange={(event) => handleChange("steps", event.target.value)}
              rows={8}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
              placeholder="One step per line"
            />
          </label>
        </section>

        <section className="rounded-[1.75rem] bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100 p-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">Attached memory</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">Keep the story beside the recipe</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Memories are optional, but they turn a good recipe into a keepsake.
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-stone-700">Memory title</span>
              <input
                value={formState.memoryTitle}
                onChange={(event) => handleChange("memoryTitle", event.target.value)}
                className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                placeholder="Sunday lunches on the balcony"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-stone-700">Memory date</span>
              <input
                value={formState.memoryDate}
                onChange={(event) => handleChange("memoryDate", event.target.value)}
                className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                placeholder="2004-09"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-stone-700">Story</span>
              <textarea
                value={formState.memoryStory}
                onChange={(event) => handleChange("memoryStory", event.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                placeholder="Tell the little story that belongs with this dish..."
              />
            </label>
          </div>
        </section>

        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <div className="flex flex-col gap-4 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-500">Recipes are stored locally in <code className="rounded bg-stone-100 px-2 py-1">data/recipes.json</code>.</p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isSubmitting ? "Saving..." : pageCopy.button}
          </button>
        </div>
      </form>
    </div>
  );
}
