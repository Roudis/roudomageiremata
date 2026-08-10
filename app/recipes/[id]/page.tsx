import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllRecipes, getRecipeById } from "@/lib/recipes";
import { ArrowLeft, Clock, Utensils, CalendarDays, CheckCircle2 } from "lucide-react";

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
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-12 sm:px-10 lg:px-12 animate-fade-in-up">
      <nav className="mb-8 flex items-center">
        <Link 
          href="/" 
          className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-stone-500 transition-colors hover:text-orange-600"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50 backdrop-blur-sm border border-stone-200/50 shadow-sm transition-transform group-hover:-translate-x-1">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Πίσω στη Συλλογή
        </Link>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        {/* Left Column: Header & Notes */}
        <div className="flex flex-col gap-8">
          <section className="glass-panel relative overflow-hidden rounded-[2.5rem] p-10 sm:p-14">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100/40 via-orange-50/40 to-amber-100/40 opacity-70 mix-blend-overlay" />
            <div className="relative z-10">
              <span className="inline-block rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-orange-600 shadow-sm backdrop-blur-md border border-white/50">
                {recipe.category ?? "Αγαπημενο της Οικογενειας"}
              </span>
              <h1 className="mt-6 text-5xl font-bold tracking-tight text-stone-900 sm:text-6xl lg:leading-[1.1]">
                {recipe.title}
              </h1>
              <p className="mt-8 text-xl leading-relaxed text-stone-600">
                {recipe.description}
              </p>
            </div>
          </section>

          <section className="glass-panel flex flex-col gap-6 rounded-[2.5rem] p-8 sm:p-10">
             <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Σημειωσεις της Κουζινας</h2>
             <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex flex-col gap-2 rounded-2xl bg-white/40 p-4 border border-white/40">
                  <Clock className="h-5 w-5 text-orange-400" />
                  <span className="text-sm font-medium text-stone-500">Προετοιμασία</span>
                  <span className="font-bold text-stone-900">{recipe.prepTime ?? "—"}</span>
                </div>
                <div className="flex flex-col gap-2 rounded-2xl bg-white/40 p-4 border border-white/40">
                  <Clock className="h-5 w-5 text-rose-400" />
                  <span className="text-sm font-medium text-stone-500">Μαγείρεμα</span>
                  <span className="font-bold text-stone-900">{recipe.cookTime ?? "—"}</span>
                </div>
                <div className="flex flex-col gap-2 rounded-2xl bg-white/40 p-4 border border-white/40">
                  <Utensils className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-medium text-stone-500">Μερίδες</span>
                  <span className="font-bold text-stone-900">{recipe.servings ?? "—"}</span>
                </div>
                <div className="flex flex-col gap-2 rounded-2xl bg-white/40 p-4 border border-white/40">
                  <CalendarDays className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-medium text-stone-500">Ανανεώθηκε</span>
                  <span className="font-bold text-stone-900">{new Date(recipe.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
             </div>
          </section>

          {recipe.memory && (
            <section className="relative overflow-hidden rounded-[2.5rem] p-[2px] bg-gradient-to-br from-rose-300 via-orange-300 to-amber-300 shadow-xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-300 via-orange-300 to-amber-300 opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative h-full w-full rounded-[2.4rem] bg-white/95 backdrop-blur-3xl p-10 sm:p-14">
                <span className="inline-block rounded-full bg-rose-100/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-rose-600">
                  Αναμνηση Συνταγης
                </span>
                <div className="mt-8">
                  <h2 className="text-3xl font-bold tracking-tight text-stone-900">{recipe.memory.title}</h2>
                  {recipe.memory.date && (
                    <p className="mt-2 font-medium text-rose-500/80">{recipe.memory.date}</p>
                  )}
                  <p className="mt-6 text-lg leading-relaxed text-stone-700 italic border-l-4 border-rose-200 pl-6">
                    &ldquo;{recipe.memory.story}&rdquo;
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Ingredients & Method */}
        <div className="flex flex-col gap-12">
          <section className="glass-panel rounded-[2.5rem] p-10 sm:p-12">
            <div className="mb-8 flex items-end justify-between border-b border-stone-200/50 pb-6">
              <h2 className="text-3xl font-bold tracking-tight text-stone-900">Υλικά</h2>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500">
                {recipe.ingredients.length} υλικά
              </span>
            </div>
            <ul className="space-y-4">
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i} className="group flex items-start gap-4 rounded-2xl p-2 transition-colors hover:bg-white/50">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500 shadow-sm transition-transform group-hover:scale-110">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-lg text-stone-700 leading-relaxed">{ingredient}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-10 text-3xl font-bold tracking-tight text-stone-900 px-4">Εκτέλεση</h2>
            <ol className="space-y-6">
              {recipe.steps.map((step, index) => (
                <li key={index} className="glass-panel group flex gap-6 rounded-[2rem] p-8 transition-all hover:shadow-lg hover:border-orange-200/50">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-rose-100 text-lg font-bold text-orange-700 shadow-inner">
                    {index + 1}
                  </span>
                  <p className="pt-2 text-lg leading-relaxed text-stone-700 group-hover:text-stone-900 transition-colors">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </main>
  );
}
