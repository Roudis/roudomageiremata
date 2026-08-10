import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="rounded-[2rem] border border-white/70 bg-white/90 px-10 py-12 shadow-[0_20px_60px_rgba(120,85,45,0.12)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-700">Η συνταγη αγνοειται</p>
        <h1 className="mt-4 text-4xl font-semibold text-stone-900">Ουπς! Αυτό το πιατάκι μας ξέφυγε από το κουτί των συνταγών.</h1>
        <p className="mt-4 text-base leading-8 text-stone-600">
          Πάμε πίσω στη συλλογή να διαλέξουμε κάποιο άλλο αγαπημένο φαγητάκι.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
        >
          Επιστροφή στο σπίτι
        </Link>
      </div>
    </main>
  );
}
