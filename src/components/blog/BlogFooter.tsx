import Link from "next/link";

export function BlogFooter() {
  return (
    <footer className="border-t border-stone-soft bg-cream">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 px-5 py-10 sm:flex-row sm:px-8">
        <p className="font-serif text-xl font-semibold text-espresso">
          Nutrición Con Enfoque
        </p>
        
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="font-medium text-stone transition-colors hover:text-terracotta"
          >
            Inicio
          </Link>
          <p className="text-stone-soft/80">|</p>
          <p className="text-stone">
            © {new Date().getFullYear()} Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
