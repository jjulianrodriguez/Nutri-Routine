import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

function BlogMark() {
  return (
    <Link
      href="/blog"
      aria-label="Blog · Nutrición Con Enfoque"
      className="inline-flex items-center gap-3"
    >
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-full border border-border bg-primary-soft text-charcoal shadow-soft"
      >
        <BookOpen className="size-4" />
      </span>
      <span className="leading-none">
        <span className="block font-heading text-lg font-bold text-charcoal">
          Diario
        </span>
        <span className="block text-[0.68rem] font-bold uppercase text-warm-brown">
          Con Enfoque
        </span>
      </span>
    </Link>
  );
}

export function BlogNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/78 shadow-soft backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <BlogMark />

        <nav className="flex items-center gap-2" aria-label="Blog">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/82 px-4 py-2.5 text-sm font-bold text-warm-brown shadow-soft backdrop-blur-md transition-colors hover:bg-primary-soft hover:text-charcoal"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Volver al inicio</span>
            <span className="sm:hidden">Inicio</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
