import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          aria-label="Αρχική σελίδα"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-serif text-lg font-semibold text-primary-foreground"
          >
            Ρ
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
            Ρουδομαγειρέματα
          </span>
        </Link>

        <nav>
          <Link
            href="/#recipe-grid"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Συνταγές</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
