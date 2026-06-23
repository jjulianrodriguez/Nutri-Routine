import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface/90 text-charcoal backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <p className="font-heading text-3xl font-bold">
              Nutrición Con Enfoque
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-warm-brown">
              Dra. Mariana Rodríguez Méndez · Profesional en nutrición funcional e
              integrativa
              <br />
              Camila Rodríguez Méndez · Entrenadora
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <p className="font-semibold text-muted">Enlaces</p>
            <Link
              href="/login"
              className="text-warm-brown transition-colors hover:text-teal"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-warm-brown transition-colors hover:text-teal"
            >
              Registrarse
            </Link>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <p className="font-semibold text-muted">Contacto</p>
            <a
              href="https://wa.me/50688332426"
              target="_blank"
              rel="noopener noreferrer"
              className="text-warm-brown transition-colors hover:text-teal"
            >
              WhatsApp · 8833-2426
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-border-subtle pt-6">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Nutrición Con Enfoque · Dra. Mariana
            Rodríguez Méndez y Camila Rodríguez Méndez. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
