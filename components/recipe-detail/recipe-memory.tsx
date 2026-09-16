import type { Memory } from "@/types/recipe";

type RecipeMemoryProps = {
  memory: Memory;
};

/** The family story attached to a recipe. The page decides whether there is one. */
export function RecipeMemory({ memory }: RecipeMemoryProps) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] p-[2px] bg-gradient-to-br from-rose-300 via-orange-300 to-amber-300 shadow-xl group">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-300 via-orange-300 to-amber-300 opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative h-full w-full rounded-[2.4rem] bg-white/95 backdrop-blur-3xl p-10 sm:p-14">
        <span className="inline-block rounded-full bg-rose-100/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-rose-600">
          Αναμνηση Συνταγης
        </span>
        <div className="mt-8">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 text-balance">{memory.title}</h2>
          {memory.date !== undefined && (
            <p className="mt-2 font-medium text-rose-500/80">{memory.date}</p>
          )}
          <p className="mt-6 text-lg leading-relaxed text-stone-700 italic border-l-4 border-rose-200 pl-6">
            &ldquo;{memory.story}&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
