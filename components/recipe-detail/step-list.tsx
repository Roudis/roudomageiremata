type StepListProps = {
  steps: string[];
};

export function StepList({ steps }: StepListProps) {
  return (
    <section>
      <h2 className="mb-10 text-3xl font-bold tracking-tight text-stone-900 px-4">Εκτέλεση</h2>
      <ol className="space-y-6">
        {steps.map((step, index) => (
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
  );
}
