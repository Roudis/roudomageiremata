import type { Locale } from "@/lib/i18n/config";
import { formatCount } from "@/lib/i18n/format";
import { getMessages } from "@/lib/i18n/messages";

type StepListProps = {
  steps: string[];
  locale: Locale;
  /** The steps' language when it differs from the page's: Greek, for an untranslated recipe. */
  lang?: Locale;
};

export function StepList({ steps, locale, lang }: StepListProps) {
  const t = getMessages(locale);

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{t.recipe.steps}</h2>
        <span className="text-sm text-muted-foreground">{formatCount(locale, t.counts.steps, steps.length)}</span>
      </div>
      <ol lang={lang} className="mt-6">
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
