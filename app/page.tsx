import { RecipeCard } from "@/components/recipe-card";
import { getAllRecipes } from "@/lib/recipes";

export default async function Home() {
  const recipes = await getAllRecipes();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <section className="grid gap-10 rounded-[2rem] bg-white/70 px-8 py-10 shadow-[0_24px_70px_rgba(120,85,45,0.12)] backdrop-blur md:grid-cols-[1.3fr_0.7fr] md:px-12 md:py-14">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-700">Family recipe guide</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-stone-900 sm:text-6xl">
            Recipes that keep the meal and the memory on the same page.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
            Roudomageirikes is a cozy recipe journal for the dishes that shaped home—filled with ingredients, step-by-step notes, and the little stories told while the oven warmed up.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="#recipe-grid"
              className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
            >
              Browse the collection
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100 p-8 text-stone-700 shadow-inner">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-700">At the table</p>
          <div className="mt-6 space-y-5">
            <div>
              <p className="text-3xl font-semibold text-stone-900">{recipes.length}</p>
              <p className="mt-1 text-sm leading-6">Treasured dishes ready to cook, share, and pass to the next generation.</p>
            </div>
            <div className="rounded-3xl bg-white/80 p-5">
              <p className="text-sm leading-7">
                &ldquo;Some recipes begin with olive oil and onions, but the best ones start with somebody saying, ‘Do you remember when...?’&rdquo;
              </p>
            </div>
            <ul className="space-y-3 text-sm">
              <li>• Browse ingredients and step-by-step instructions</li>
              <li>• Each recipe is paired with a family memory</li>
              <li>• A living archive, passed down through the generations</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="recipe-grid" className="mt-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Recipe collection</p>
            <h2 className="mt-2 text-3xl font-semibold text-stone-900">Beloved Greek and family favorites</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-stone-600">
            Each card leads to a full recipe page with ingredients, directions, and the story that keeps the dish close.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe, index) => (
            <RecipeCard key={recipe.id} recipe={recipe} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
