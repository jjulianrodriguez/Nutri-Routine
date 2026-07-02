import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { HomeMark } from "@/components/layout/home-mark";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/78 shadow-soft backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <HomeMark />

        <nav
          className="hidden items-center gap-7 text-sm font-semibold text-stone lg:flex"
          aria-label="Navegación principal"
        >
          <a className="transition-colors hover:text-espresso" href="#servicios">
            Servicios
          </a>
          <a className="transition-colors hover:text-espresso" href="#proceso">
            Cómo funciona
          </a>
          <a className="transition-colors hover:text-espresso" href="#enfoque">
            Enfoque
          </a>
          <a className="transition-colors hover:text-espresso" href="#confianza">
            Confianza
          </a>
          <Link className="transition-colors hover:text-espresso" href="/login">
            Iniciar sesión
          </Link>
          <Link
            className="transition-colors hover:text-espresso"
            href="/register"
          >
            Registrarse
          </Link>
        </nav>

        <a
          href="https://wa.me/50688332426"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-soft transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-glow sm:px-5"
        >
          <span className="hidden sm:inline">Agendar consulta</span>
          <span className="sm:hidden">Agendar</span>
          <ArrowUpRight className="size-4" />
        </a>
      </div>
    </header>
  );
}
