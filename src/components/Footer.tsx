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
    <footer className="relative overflow-hidden border-t border-border bg-surface/90 text-charcoal backdrop-blur-md">
      <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
      <div className="pointer-events-none absolute -right-36 top-10 h-[28rem] w-[34rem] rounded-[45%] bg-primary opacity-18" />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, ease: [0.22, 0.72, 0.18, 1] }}
          >
            <p className="text-sm font-bold uppercase text-muted">
              Nutrición Con Enfoque
            </p>
            <h2 className="mt-5 max-w-4xl font-heading text-6xl font-bold leading-[0.9] sm:text-8xl lg:text-9xl">
              <span className="text-charcoal">bienestar</span>
              <br />
              <em className="font-heading italic text-teal">con enfoque</em>
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
              <p className="text-xs font-bold uppercase text-muted">
                Equipo
              </p>
              <p className="mt-4 text-sm leading-7 text-warm-brown">
                Dra. Mariana Rodríguez Méndez
                <br />
                Camila Rodríguez Méndez
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-muted">
                Enlaces
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-warm-brown transition-none hover:text-teal"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                ))}
                <a
                  href="https://wa.me/50688332426"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-warm-brown transition-none hover:text-teal"
                >
                  WhatsApp
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-14 grid gap-4 border-t border-border-subtle pt-6 text-xs text-muted sm:grid-cols-[1fr_auto]">
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
