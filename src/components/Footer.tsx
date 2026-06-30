"use client";

import { ArrowUpRight, MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const whatsappHref = "https://wa.me/50688332426";

const footerLinks = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/#enfoque", label: "Criterio" },
  { href: "/blog", label: "Blog" },
  { href: "/login", label: "Iniciar sesión" },
  { href: "/register", label: "Registrarse" },
];

const displayFontStyle = {
  fontFamily: "var(--font-landing-display)",
  fontWeight: 500,
} as const;

export function Footer() {
  const reduceMotion = useReducedMotion();

  return (
    <footer className="relative overflow-hidden border-t border-[var(--ln-night)]/8 bg-[var(--ln-cream)] text-[var(--ln-night)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgb(255_233_173_/_0.3),transparent_30rem),radial-gradient(circle_at_82%_6%,rgb(255_248_232_/_0.9),transparent_34rem),linear-gradient(180deg,var(--ln-paper)_0%,var(--ln-sand)_100%)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.18fr)_minmax(20rem,0.58fr)]">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.72, ease: [0.18, 0.82, 0.22, 1] }}
            className="relative overflow-hidden rounded-[2.4rem] border border-[rgb(255_252_248_/_0.72)] bg-[rgb(255_252_248_/_0.74)] p-6 shadow-[0_38px_120px_-84px_rgb(26_48_56_/_0.28)] backdrop-blur-2xl sm:p-8 lg:min-h-[35rem]"
          >
            <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-[42%_58%_48%_52%] bg-[var(--ln-mint)]/70 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-[linear-gradient(90deg,rgb(219_56_84_/_0.18),transparent)]" />

            <div className="relative flex flex-wrap items-start justify-between gap-6">
              <div className="inline-flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-[1.25rem] bg-[var(--ln-mint)] text-xs font-black uppercase tracking-[0.14em]">
                  nce
                </span>
                <div>
                  <p
                    style={displayFontStyle}
                    className="text-3xl leading-none tracking-[-0.025em]"
                  >
                    Nutrición Con Enfoque
                  </p>
                  <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.22em] text-[var(--ln-muted)]">
                    nutrición + entrenamiento
                  </p>
                </div>
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--ln-peach)] px-5 py-2.5 text-sm font-black text-[var(--ln-night)] shadow-[0_20px_58px_-36px_rgb(26_48_56_/_0.24)]"
              >
                <MessageCircle className="size-4" />
                WhatsApp
                <ArrowUpRight className="size-4" />
              </a>
            </div>

            <div className="relative mt-16 max-w-5xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--ln-forest)]">
                cerrar el ruido, abrir una ruta
              </p>
              <h2
                style={displayFontStyle}
                className="mt-5 max-w-5xl text-balance text-[clamp(4.4rem,10vw,9.2rem)] leading-[0.78] tracking-[-0.045em]"
              >
                cuidarte puede sentirse claro.
              </h2>
            </div>

            <div className="relative mt-12 grid gap-3 sm:grid-cols-3">
              {[
                "comer con calma",
                "entrenar con fuerza",
                "medir sin obsesión",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-[1.2rem] border border-[var(--ln-night)]/8 bg-[rgb(255_255_255_/_0.48)] px-4 py-3 text-sm font-black text-[var(--ln-muted)] backdrop-blur-xl"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.72,
              delay: reduceMotion ? 0 : 0.08,
              ease: [0.18, 0.82, 0.22, 1],
            }}
            className="grid gap-5"
          >
            <div className="rounded-[2rem] bg-[var(--ln-night)] p-6 text-[var(--ln-paper)] shadow-[0_34px_100px_-70px_rgb(26_48_56_/_0.42)] sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ln-peach)]">
                próximas consultas
              </p>
              <p className="mt-5 text-xl font-black leading-8">
                Una primera conversación para ordenar señales, objetivos y
                energía real.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[var(--ln-night)]/8 bg-[rgb(255_252_248_/_0.56)] p-6 shadow-[0_34px_100px_-78px_rgb(26_48_56_/_0.22)] backdrop-blur-xl sm:p-7">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--ln-forest)]">
                    Navegación
                  </p>
                  <div className="mt-4 flex flex-col gap-3 text-sm">
                    {footerLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="group inline-flex items-center gap-2 font-bold text-[var(--ln-muted)] transition-colors hover:text-[var(--ln-night)]"
                      >
                        {link.label}
                        <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--ln-forest)]">
                    Profesionales
                  </p>
                  <p className="mt-4 text-sm font-bold leading-7 text-[var(--ln-muted)]">
                    Dra. Mariana Rodríguez Méndez
                    <br />
                    Camila Rodríguez Méndez
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-[var(--ln-night)]/8 pt-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--ln-forest)]">
                  Contacto
                </p>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-black text-[var(--ln-night)]"
                >
                  +506 8833 2426
                  <ArrowUpRight className="size-3.5" />
                </a>
                <p className="mt-3 text-sm font-bold leading-6 text-[var(--ln-muted)]">
                  Consultas presenciales y virtuales desde Costa Rica.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-10 grid gap-4 border-t border-[var(--ln-night)]/10 pt-6 text-xs font-bold text-[var(--ln-muted)] sm:grid-cols-[1fr_auto]">
          <p>
            © {new Date().getFullYear()} Nutrición Con Enfoque · Dra. Mariana Rodríguez
            Méndez y Camila Rodríguez Méndez.
          </p>
          <p>Nutrición funcional · Entrenamiento · Bienestar integral</p>
        </div>
      </div>
    </footer>
  );
}
