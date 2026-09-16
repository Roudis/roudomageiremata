import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border">
      <div className="page-container flex flex-col gap-4 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-serif text-lg font-semibold">Ρουδομαγειρέματα</p>
          <p className="mt-1 text-sm text-muted-foreground">Οικογενειακές συνταγές και οι ιστορίες τους.</p>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          &copy; {currentYear} · Φτιαγμένο με
          <Heart className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
          <span className="sr-only">αγάπη</span>
          για την οικογένεια
        </p>
      </div>
    </footer>
  );
}
