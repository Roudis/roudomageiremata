import Link from "next/link";
import { notFound } from "next/navigation";
import { RecipeForm } from "@/components/recipe-form";
import { getRecipeById } from "@/lib/recipes";

export const dynamic = "force-dynamic";

type EditRecipePageProps = {
  params: {
    id: string;
  };
};

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const recipe = await getRecipeById(params.id);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10 sm:px-10">
      <Link href={`/recipes/${params.id}`} className="mb-6 text-sm font-semibold text-orange-700 transition hover:text-orange-800">
        ← Back to recipe details
      </Link>
      <RecipeForm mode="edit" recipe={recipe} />
    </main>
  );
}
