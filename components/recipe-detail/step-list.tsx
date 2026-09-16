type StepListProps = {
  steps: string[];
};

export function StepList({ steps }: StepListProps) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">Εκτέλεση</h2>
        <span className="text-sm text-muted-foreground">{steps.length === 1 ? "1 βήμα" : `${steps.length} βήματα`}</span>
      </div>
      <ol className="mt-6">
        {steps.map((step, index) => (
          <li key={index} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-border py-6 sm:grid-cols-[3.5rem_1fr]">
            <span aria-hidden="true" className="font-serif text-3xl font-semibold leading-none text-primary tabular-nums sm:text-4xl">
              {index + 1}
            </span>
            <p className="text-pretty text-lg leading-relaxed">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
