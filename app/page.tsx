import { RecipeCard } from "@/components/recipe-card";
import { getAllRecipes } from "@/lib/recipes";

export default async function Home() {
  const recipes = await getAllRecipes();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-12 sm:px-10 lg:px-12 animate-fade-in-up">
      <header className="mb-12 text-center sm:text-left">
        <p className="inline-flex items-center rounded-full bg-rose-100/50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700 shadow-sm ring-1 ring-rose-200/50 backdrop-blur-sm">
          Ρούδομαγειρέματα
        </p>
      </header>
      
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass-panel flex flex-col justify-center rounded-[2.5rem] p-10 sm:p-14 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <h1 className="relative z-10 max-w-2xl text-5xl font-bold tracking-tight text-stone-900 sm:text-7xl leading-[1.1]">
            Κάποιες αναμνήσεις μας είναι γεμάτες γεύσεις <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">και κάποιες γεύσεις είναι γεμάτες αναμνήσεις μας.</span>
          </h1>
          <p className="relative z-10 mt-8 max-w-xl text-lg leading-relaxed text-stone-600">
            Τα Ρουδομαγειρέματα είναι μια μικρή συλλογή από συνταγές που έχουν γεύση σπίτι ή και ταξίδια.
          </p>

          <div className="relative z-10 mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#recipe-grid"
              className="inline-flex items-center justify-center rounded-full bg-stone-900 px-8 py-4 text-sm font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-200"
            >
              Ξεφύλλισε τις συνταγές μας
            </a>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          <div className="glass-panel rounded-[2rem] p-8 flex flex-col justify-between group hover:border-orange-200 transition-colors duration-300">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Το Τετραδιακι Μας</p>
            <div className="mt-6">
              <p className="text-6xl font-bold tracking-tighter text-stone-900 group-hover:text-orange-600 transition-colors duration-300">{recipes.length}</p>
              <p className="mt-2 text-sm font-medium text-stone-500">Αγαπημένα οικογενειακά πιατάκια.</p>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] bg-gradient-to-br from-rose-50/50 to-orange-50/50 p-8 flex flex-col justify-between hover:border-rose-200 transition-colors duration-300">
             <div className="rounded-2xl bg-white/60 p-5 shadow-sm backdrop-blur-md">
              <p className="text-sm font-medium italic leading-relaxed text-stone-700">
                &ldquo;Κάποιες συνταγές ξεκινάνε με λαδάκι και κρεμμυδάκι, αλλά οι καλύτερες αρχίζουν με κάποιον να λέει, &apos;Θυμάσαι τότε που...;&apos;&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="recipe-grid" className="mt-24 scroll-mt-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Οι συνταγές της οικογένειας</h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-stone-600">
              Κάθε πρόσωπο της οικογένειας έχει τη δική του θέση εδώ. Ανακάλυψε τις ιστορίες και τα πιατάκια που τους κάνουν ξεχωριστούς!
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-20">
          {Object.entries(
            recipes.reduce((acc, recipe) => {
              const cat = recipe.category ?? "Άλλο";
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(recipe);
              return acc;
            }, {} as Record<string, typeof recipes>)
          ).map(([category, categoryRecipes], catIndex) => (
            <div key={category} className="animate-fade-in-up" style={{ animationDelay: `${catIndex * 150}ms`, animationFillMode: "both" }}>
              <div className="mb-8 border-b border-stone-200/50 pb-4">
                <h3 className="text-2xl font-bold tracking-tight text-stone-800">
                  {category}
                </h3>
              </div>
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {categoryRecipes.map((recipe, index) => (
                  <div key={recipe.id} className="h-full">
                    <RecipeCard recipe={recipe} index={index} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
