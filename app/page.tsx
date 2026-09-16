import Link from "next/link";
import { ArrowDown, Quote } from "lucide-react";
import { RecipeList } from "@/components/recipe-list";
import { getAllRecipes } from "@/lib/recipes";
import { toRecipeSummary } from "@/lib/recipe-view";
import { getCategories } from "@/lib/recipe-search";
import { withBasePath } from "@/lib/base-path";

// The mosaic's first photo spans both rows; the other two stack beside it.
const mosaicCells = ["col-span-3 row-span-2", "col-span-2", "col-span-2"];

export default async function Home() {
  const recipes = await getAllRecipes();
  const featured = recipes
    .flatMap(({ id, title, imageUrl }) => (imageUrl === undefined ? [] : [{ id, title, imageUrl }]))
    .slice(0, mosaicCells.length);

  const stats = [
    { value: recipes.length, label: "Συνταγές" },
    { value: getCategories(recipes).length, label: "Κατηγορίες" },
    { value: recipes.filter((recipe) => recipe.memory !== undefined).length, label: "Ιστορίες" },
  ];

  return (
    <main className="page-container pt-10 sm:pt-16">
      <section className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="text-sm font-semibold text-secondary">Το οικογενειακό τετράδιο συνταγών</p>
          <h1 className="mt-4 text-balance font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Κάποιες αναμνήσεις μας είναι γεμάτες γεύσεις,{" "}
            <em className="font-normal text-primary">και κάποιες γεύσεις είναι γεμάτες αναμνήσεις μας.</em>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Τα Ρουδομαγειρέματα είναι μια μικρή συλλογή από συνταγές που έχουν γεύση σπίτι ή και ταξίδια.
          </p>
          <a
            href="#recipe-grid"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Ξεφύλλισε τις συνταγές μας
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        {featured.length > 0 && (
          <div className="grid h-72 grid-cols-5 grid-rows-2 gap-3 sm:h-96 lg:col-span-5 lg:h-[28rem]">
            {featured.map((recipe, index) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className={`group relative overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${mosaicCells[index]}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={withBasePath(recipe.imageUrl)}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute bottom-2 left-2 right-2 truncate rounded-md bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur sm:w-fit sm:max-w-[calc(100%-1rem)]">
                  {recipe.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 grid gap-8 border-y border-border py-8 sm:mt-20 lg:grid-cols-12 lg:items-center lg:gap-12">
        <figure className="flex gap-4 lg:col-span-7">
          <Quote className="mt-1 h-6 w-6 shrink-0 fill-secondary-soft text-secondary" aria-hidden="true" />
          <blockquote className="text-pretty font-serif text-xl italic leading-relaxed sm:text-2xl">
            Κάποιες συνταγές ξεκινάνε με λαδάκι και κρεμμυδάκι, αλλά οι καλύτερες αρχίζουν με κάποιον να λέει «Θυμάσαι
            τότε που…;»
          </blockquote>
        </figure>
        <dl className="grid grid-cols-3 gap-4 lg:col-span-5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-1 border-l-2 border-secondary/40 pl-4">
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="font-serif text-3xl font-semibold tabular-nums sm:text-4xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="recipe-grid" className="mt-16 scroll-mt-20 sm:mt-20">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Οι συνταγές της οικογένειας
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Κάθε πρόσωπο της οικογένειας έχει τη δική του θέση εδώ. Ανακάλυψε τις ιστορίες και τα πιατάκια που τους
            κάνουν ξεχωριστούς!
          </p>
        </div>

        <RecipeList recipes={recipes.map(toRecipeSummary)} />
      </section>
    </main>
  );
}
