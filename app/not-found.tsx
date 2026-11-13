import { ArrowLeft } from "lucide-react";
import { RootLayout } from "@/app/_shared/root-layout";
import { ButtonLink } from "@/components/button-link";

/**
 * The 404 page, which GitHub Pages serves for any unknown path in any language.
 * It is Greek, the site's main language, and renders its own <html> because
 * app/layout.tsx only passes children through. The language menu links to each
 * language's home page.
 */
export default function NotFound() {
  return (
    <RootLayout locale="el" switcherPath="/">
      <main className="page-container flex min-h-[60vh] flex-col justify-center py-16">
        <div className="max-w-2xl">
          <p className="eyebrow">Η συνταγή αγνοείται</p>
          <h1 className="mt-4 text-balance font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Ουπς! Αυτό το πιατάκι μας ξέφυγε από το κουτί των συνταγών.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Πάμε πίσω στη συλλογή να διαλέξουμε κάποιο άλλο αγαπημένο φαγητάκι.
          </p>
          <div className="mt-8">
            <ButtonLink href="/" variant="primary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Επιστροφή στη συλλογή
            </ButtonLink>
          </div>
        </div>
      </main>
    </RootLayout>
  );
}
