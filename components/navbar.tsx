"use client";

import Link from "next/link";
import { Search, Menu, X, ChefHat } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 py-4 shadow-sm backdrop-blur-md border-b border-stone-200/50"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-12">
        <Link
          href="/"
          className="group flex items-center gap-3 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-full"
          aria-label="Αρχική σελίδα"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-orange-400 text-white shadow-md">
            <ChefHat className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-stone-900 hidden sm:block group-hover:text-orange-600 transition-colors">
            Ρουδομαγειρέματα
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {!isHome && (
            <Link
              href="/"
              className="text-sm font-semibold text-stone-600 hover:text-orange-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-md px-2 py-1"
            >
              Συνταγές
            </Link>
          )}
          {isHome && (
             <a
              href="#recipe-grid"
              className="text-sm font-semibold text-stone-600 hover:text-orange-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-md px-2 py-1"
            >
              Αναζήτηση
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
