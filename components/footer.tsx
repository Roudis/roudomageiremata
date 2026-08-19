import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-stone-200/50 bg-white/40 backdrop-blur-md py-12 px-6 sm:px-10 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="text-sm text-stone-500 text-center sm:text-left font-medium">
          &copy; {currentYear} Ρουδομαγειρέματα.
        </p>
        <p className="flex items-center gap-2 text-sm text-stone-500 font-medium bg-rose-50/50 px-4 py-2 rounded-full ring-1 ring-rose-100">
          Φτιαγμένο με <Heart className="h-4 w-4 fill-rose-500 text-rose-500 animate-pulse" /> για την οικογένεια
        </p>
      </div>
    </footer>
  );
}
