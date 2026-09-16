import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="page-container flex min-h-[60vh] flex-col justify-center py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-secondary">Η συνταγή αγνοείται</p>
        <h1 className="mt-4 text-balance font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Ουπς! Αυτό το πιατάκι μας ξέφυγε από το κουτί των συνταγών.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Πάμε πίσω στη συλλογή να διαλέξουμε κάποιο άλλο αγαπημένο φαγητάκι.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Επιστροφή στη συλλογή
        </Link>
      </div>
    </main>
  );
}
