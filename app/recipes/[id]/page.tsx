import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllRecipes, getRecipeById } from "@/lib/recipes";

type RecipeDetailPageProps = {
  params: {
    id: string;
  };
};

export async function generateStaticParams() {
  const recipes = await getAllRecipes();
  return recipes.map((recipe) => ({ id: recipe.id }));
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const recipe = await getRecipeById(params.id);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-sm font-semibold text-orange-700 transition hover:text-orange-800">
          ← Back to all recipes
        </Link>
      </div>

      <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_22px_65px_rgba(120,85,45,0.12)]">
        <div className="grid gap-8 bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 px-8 py-10 lg:grid-cols-[1.3fr_0.7fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-700">
              {recipe.category ?? "Family Favorite"}
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-stone-900 sm:text-5xl">{recipe.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-700">{recipe.description}</p>
          </div>

          <div className="rounded-[1.75rem] bg-white/75 p-6 shadow-inner">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Kitchen notes</h2>
            <dl className="mt-5 space-y-4 text-sm text-stone-700">
              <div className="flex items-center justify-between gap-4 border-b border-stone-200 pb-3">
                <dt>Prep time</dt>
                <dd className="font-semibold">{recipe.prepTime ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-stone-200 pb-3">
                <dt>Cook time</dt>
                <dd className="font-semibold">{recipe.cookTime ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-stone-200 pb-3">
                <dt>Servings</dt>
                <dd className="font-semibold">{recipe.servings ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Last updated</dt>
                <dd className="font-semibold">{new Date(recipe.updatedAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="grid gap-8 px-8 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <section className="rounded-[1.75rem] bg-stone-50 p-6">
            <h2 className="text-2xl font-semibold text-stone-900">Ingredients</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-stone-700">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-orange-400" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900">Method</h2>
            <ol className="mt-5 space-y-5">
              {recipe.steps.map((step, index) => (
                <li key={`${recipe.id}-step-${index}`} className="flex gap-4 rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-7 text-stone-700">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </section>

      {recipe.memory ? (
        <section className="mt-8 rounded-[2rem] bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 px-8 py-8 shadow-[0_16px_40px_rgba(120,85,45,0.1)] lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-700">Recipe memory</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[0.45fr_1fr]">
            <div>
              <h2 className="text-3xl font-semibold text-stone-900">{recipe.memory.title}</h2>
              {recipe.memory.date ? <p className="mt-3 text-sm text-stone-600">{recipe.memory.date}</p> : null}
            </div>
            <p className="text-base leading-8 text-stone-700">{recipe.memory.story}</p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
