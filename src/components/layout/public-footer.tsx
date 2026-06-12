import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-charcoal/10 bg-espresso text-sand-soft">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <p className="font-serif text-3xl font-semibold">
              Nutrición Con Enfoque
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-sand-soft/80">
              Dra. Mariana Rodríguez Méndez · Profesional en nutrición funcional e
              integrativa
              <br />
              Camila Rodríguez Méndez · Profesional en entrenamiento
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <p className="font-semibold text-stone-soft/60">Enlaces</p>
            <Link
              href="/login"
              className="text-sand-soft/80 transition-colors hover:text-sand"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-sand-soft/80 transition-colors hover:text-sand"
            >
              Registrarse
            </Link>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <p className="font-semibold text-stone-soft/60">Contacto</p>
            <a
              href="https://wa.me/50688332426"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sand-soft/80 transition-colors hover:text-sand"
            >
              WhatsApp · 8833-2426
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-stone-soft/10 pt-6">
          <p className="text-xs text-stone-soft/50">
            © {new Date().getFullYear()} Nutrición Con Enfoque · Dra. Mariana
            Rodríguez Méndez y Camila Rodríguez Méndez. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
