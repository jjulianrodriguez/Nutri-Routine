import Link from "next/link";

export function BlogFooter() {
  return (
    <footer className="border-t border-border bg-surface/82 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-end lg:px-10">
        <div>
          <p className="font-heading text-2xl font-bold text-charcoal">
            Nutrición Con Enfoque
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-warm-brown">
            Lecturas sobre nutrición funcional, entrenamiento, salud hormonal y
            bienestar cotidiano.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-warm-brown">
          <Link href="/" className="underline decoration-sage decoration-2 underline-offset-4">
            Inicio
          </Link>
          <Link
            href="/blog"
            className="underline decoration-sage decoration-2 underline-offset-4"
          >
            Blog
          </Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
