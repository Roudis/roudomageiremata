import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Languages } from "lucide-react";

type BackLinkProps = {
  /** Already localized with localizePath. */
  href: string;
  children: ReactNode;
};

/** The link at the top of a recipe or story back to the list it came from. */
export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="group -ml-2 inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-ring print:hidden"
    >
      <ArrowLeft
        className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
        aria-hidden="true"
      />
      {children}
    </Link>
  );
}

/** The note on a recipe or story that has no translation for the page's language and so shows in Greek. */
export function UntranslatedNotice({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 flex max-w-2xl items-start gap-2.5 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground print:hidden">
      <Languages className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      {children}
    </p>
  );
}
