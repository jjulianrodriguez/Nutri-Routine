import { ArrowLeft, ArrowUpRight, BookOpen } from "lucide-react";
import Link from "next/link";

function BlogMark() {
  return (
    <Link
      href="/blog"
      aria-label="Blog · Poner nombre"
      className="group inline-flex items-center gap-3"
    >
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-full border border-[var(--blog-night)]/10 bg-[rgb(255_252_248_/_0.66)] text-[var(--blog-night)] shadow-[0_16px_44px_-34px_rgb(26_48_56_/_0.22)] backdrop-blur-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
      >
        <BookOpen className="size-4" />
      </span>
      <span className="leading-none">
        <span className="block text-base font-black text-[var(--blog-night)]">
          Diario
        </span>
        <span className="block text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--blog-muted)]">
          Poner nombre
        </span>
      </span>
    </Link>
  );
}

export function BlogNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--blog-night)]/8 bg-[rgb(255_252_248_/_0.76)] shadow-[0_18px_60px_-50px_rgb(26_48_56_/_0.22)] backdrop-blur-2xl">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <BlogMark />

        <nav className="flex items-center gap-2" aria-label="Blog">
          <Link
            href="/"
            className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--blog-night)]/10 bg-[rgb(255_252_248_/_0.62)] px-4 py-2 text-sm font-black text-[var(--blog-night)] shadow-[0_18px_48px_-38px_rgb(26_48_56_/_0.2)] backdrop-blur-xl transition-colors hover:border-[var(--blog-clay)]/30 hover:bg-[rgb(255_252_248_/_0.78)]"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Volver al inicio</span>
            <span className="sm:hidden">Inicio</span>
            <ArrowUpRight className="hidden size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:block" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
