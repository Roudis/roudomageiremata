import Link from "next/link";
import { RecipeForm } from "@/components/recipe-form";

export const dynamic = "force-dynamic";

export default function NewRecipePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10 sm:px-10">
      <Link href="/" className="mb-6 text-sm font-semibold text-orange-700 transition hover:text-orange-800">
        ← Back to the recipe collection
      </Link>
      <RecipeForm mode="create" />
    </main>
  );
}
