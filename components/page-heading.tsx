import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  intro: string;
  /** A short line under the intro, such as how many stories there are. */
  note?: string;
};

/** The top of an index page: its label, its <h1>, and a sentence about it. */
export function PageHeader({ eyebrow, title, intro, note }: PageHeaderProps) {
  return (
    <header className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 text-balance font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">{intro}</p>
      {note !== undefined && <p className="mt-4 text-sm font-medium text-muted-foreground">{note}</p>}
    </header>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  /** Shown at the end of the row, usually an ArrowLink to the whole list. */
  action?: ReactNode;
};

/** The heading of a section inside a page: label, <h2>, and an optional link to more. */
export function SectionHeading({ eyebrow, title, intro, action }: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        {intro !== undefined && <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{intro}</p>}
      </div>
      {action}
    </div>
  );
}
