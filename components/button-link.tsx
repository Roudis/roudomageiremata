import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const variants = {
  /** The page's main action, in aubergine. */
  primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  /** A second action beside it. */
  secondary: "border border-border bg-card text-foreground hover:border-primary/40 hover:text-primary",
  /** The main action on the aubergine story band. */
  feature: "bg-feature-accent text-feature hover:bg-feature-accent/90",
};

type ButtonLinkProps = {
  /** Already localized with localizePath. */
  href: string;
  variant: keyof typeof variants;
  children: ReactNode;
};

/** A link that looks like a button: the pill-shaped calls to action. */
export function ButtonLink({ href, variant, children }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors focus-ring-offset ${variants[variant]}`}
    >
      {children}
    </Link>
  );
}

type ArrowLinkProps = {
  /** Already localized with localizePath. */
  href: string;
  children: ReactNode;
  /** `feature` for the aubergine story band, where the page's purple would not show. */
  tone?: "page" | "feature";
};

/** A text link with an arrow, for "all recipes", "read the story", and the like. */
export function ArrowLink({ href, children, tone = "page" }: ArrowLinkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold underline-offset-4 hover:underline focus-ring ${
        tone === "feature" ? "text-feature-accent" : "text-primary"
      }`}
    >
      {children}
      <ArrowRight
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </Link>
  );
}
