
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllRecipes, getRecipeById } from "@/lib/recipes";
import { CategoryBadge } from "@/components/category-badge";
import { RecipeHero } from "@/components/recipe-detail/recipe-hero";
import { RecipeStats } from "@/components/recipe-detail/recipe-stats";
import { RecipeMemory } from "@/components/recipe-detail/recipe-memory";
import { IngredientList } from "@/components/recipe-detail/ingredient-list";
import { StepList } from "@/components/recipe-detail/step-list";
import { ArrowLeft } from "lucide-react";

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
          className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-stone-500 transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg p-2 -ml-2"
          aria-label="Επιστροφή στη συλλογή"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50 backdrop-blur-sm border border-stone-200/50 shadow-sm transition-transform group-hover:-translate-x-1">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Πίσω στη Συλλογή
        </Link>
      </nav>

      <RecipeHero recipe={recipe} />

      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        {/* Left Column: Header & Notes */}
        <div className="flex flex-col gap-8">
          <section className="glass-panel relative overflow-hidden rounded-[2.5rem] p-10 sm:p-14 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100/40 via-orange-50/40 to-amber-100/40 opacity-70 mix-blend-overlay pointer-events-none" />
            <div className="relative z-10">
              <CategoryBadge recipe={recipe} variant="detail" />
              <h1 className="mt-6 text-5xl font-bold tracking-tight text-stone-900 sm:text-6xl lg:leading-[1.1] text-balance">
                {recipe.title}
              </h1>
              <p className="mt-8 text-xl leading-relaxed text-stone-600">
                {recipe.description}
              </p>
            </div>
          </section>

          <RecipeStats recipe={recipe} />

          {recipe.memory !== undefined && <RecipeMemory memory={recipe.memory} />}
        </div>

        {/* Right Column: Ingredients & Method */}
        <div className="flex flex-col gap-12">
          <IngredientList ingredients={recipe.ingredients} />

          <StepList steps={recipe.steps} />
        </div>
      </div>
    </main>
  );
}
