"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const footerLinks = [
  { href: "/login", label: "Iniciar sesión" },
  { href: "/register", label: "Registrarse" },
];

export function Footer() {
  const reduceMotion = useReducedMotion();

  return (
    <footer className="relative overflow-hidden bg-charcoal text-cream">
      <div className="absolute inset-x-0 top-0 h-px bg-cream/14" />
      <div className="pointer-events-none absolute -right-36 top-10 h-[28rem] w-[34rem] rounded-[45%] bg-sage opacity-18" />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, ease: [0.22, 0.72, 0.18, 1] }}
          >
            <p className="text-sm font-bold uppercase text-cream/46">
              Nutrición Con Enfoque
            </p>
            <h2 className="mt-5 max-w-4xl font-serif text-6xl font-semibold leading-[0.88] text-cream sm:text-8xl lg:text-9xl">
              bienestar
              <br />
              <em className="font-serif italic text-sage">con enfoque</em>
            </h2>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, delay: reduceMotion ? 0 : 0.12, ease: [0.22, 0.72, 0.18, 1] }}
            className="grid gap-8 sm:grid-cols-2"
          >
            <div>
              <p className="text-xs font-bold uppercase text-cream/42">
                Equipo
              </p>
              <p className="mt-4 text-sm leading-7 text-cream/72">
                Dra. Mariana Rodríguez Méndez · Nutricionista funcional e
                integrativa
                <br />
                Camila Rodríguez Méndez · Entrenadora Personal
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-cream/42">
                Enlaces
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-cream/72 transition-none"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                ))}
                <a
                  href="https://wa.me/50688332426"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-cream/72 transition-none"
                >
                  WhatsApp · 8833-2426
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-14 grid gap-4 border-t border-cream/10 pt-6 text-xs text-cream/42 sm:grid-cols-[1fr_auto]">
          <p>
            © {new Date().getFullYear()} Nutrición Con Enfoque · Dra. Mariana
            Rodríguez Méndez y Camila Rodríguez Méndez. Todos los derechos
            reservados.
          </p>
          <p>Disponible por WhatsApp · Consultas presenciales y virtuales</p>
        </div>
      </div>
    </footer>
  );
}
