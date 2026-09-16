import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipeById, getRecipeIds } from "@/lib/recipes";
import { withBasePath } from "@/lib/base-path";
import { CategoryBadge } from "@/components/category-badge";
import { RecipeHero } from "@/components/recipe-detail/recipe-hero";
import { RecipeStats } from "@/components/recipe-detail/recipe-stats";
import { RecipeMemory } from "@/components/recipe-detail/recipe-memory";
import { IngredientList } from "@/components/recipe-detail/ingredient-list";
import { StepList } from "@/components/recipe-detail/step-list";
import { ArrowLeft } from "lucide-react";

/**
 * The route's params, in one place: Next 15 and later hand `params` to pages and
 * to generateMetadata as a Promise, which makes that upgrade a single edit here.
 */
type RecipeParams = {
  id: string;
};

type RecipeDetailPageProps = {
  params: RecipeParams;
};

/**
 * Only these ids get a page; on GitHub Pages any other path serves the 404 page.
 * Do not add `export const dynamicParams = false`: on Next 14 with `output: "export"`
 * the dev server then throws "missing generateStaticParams()" for every recipe.
 */
export async function generateStaticParams(): Promise<RecipeParams[]> {
  const ids = await getRecipeIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: RecipeDetailPageProps): Promise<Metadata> {
  const recipe = await getRecipeById(params.id);

  if (!recipe) return {};

  const images =
    recipe.imageUrl !== undefined ? [{ url: withBasePath(recipe.imageUrl), alt: recipe.title }] : undefined;

  return {
    title: recipe.title,
    description: recipe.description,
    // A page's openGraph replaces the layout's rather than merging into it, so the
    // site-level fields are repeated here.
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      siteName: "Ρουδομαγειρέματα",
      locale: "el_GR",
      type: "article",
      images,
    },
  };
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const recipe = await getRecipeById(params.id);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="page-container pt-6 sm:pt-10">
      <Link
        href="/"
        className="group -ml-2 inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
        Όλες οι συνταγές
      </Link>

      {/* auto-cols-fr puts the text and photo side by side, and gives the text the full width when there is no photo. */}
      <header className="mt-6 grid gap-8 lg:grid-flow-col lg:auto-cols-fr lg:items-center lg:gap-12">
        <div>
          <CategoryBadge recipe={recipe} variant="detail" />
          <h1 className="mt-3 text-balance font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {recipe.title}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">{recipe.description}</p>
          <div className="mt-8">
            <RecipeStats recipe={recipe} />
          </div>
        </div>

        <RecipeHero recipe={recipe} />
      </header>

      {recipe.memory !== undefined && (
        <div className="mt-12 sm:mt-16">
          <RecipeMemory memory={recipe.memory} />
        </div>
      )}

      <div className="mt-12 grid gap-12 sm:mt-16 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-4">
          {/* Stays in view beside the steps, and scrolls on its own when it is taller than the screen. */}
          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:rounded-xl">
            <IngredientList ingredients={recipe.ingredients} />
          </div>
        </aside>

        <div className="lg:col-span-8">
          <StepList steps={recipe.steps} />
        </div>
      </div>
    </main>
  );
}
