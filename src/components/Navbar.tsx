"use client";

import { ArrowUpRight, Menu, MessageCircle, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const whatsappHref = "https://wa.me/50688332426";

const navLinks = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/#enfoque", label: "Criterio" },
  { href: "/blog", label: "Blog" },
  { href: "/login", label: "Acceso" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    damping: 34,
    stiffness: 135,
    mass: 0.46,
  });
  const y = useTransform(progress, [0, 0.18], [0, 7]);
  const navShadow = useTransform(
    progress,
    [0, 0.16],
    [
      "0 24px 92px -72px rgb(75 53 53 / 0.22)",
      "0 28px 96px -66px rgb(75 53 53 / 0.32)",
    ],
  );

  return (
    <>
      <motion.header
        style={reduceMotion ? undefined : { y }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6"
      >
        <motion.div
          style={reduceMotion ? undefined : { boxShadow: navShadow }}
          className="ml-auto flex w-fit max-w-5xl items-center justify-between gap-3 rounded-full border border-[rgb(255_255_255_/_0.78)] bg-[rgb(255_255_255_/_0.82)] px-3 py-3 backdrop-blur-2xl sm:px-4 md:mx-auto md:w-full"
        >
          <nav
            className="hidden items-center gap-1 rounded-full border border-[var(--ln-night)]/8 bg-[rgb(255_255_255_/_0.56)] p-1 backdrop-blur-xl md:flex"
            aria-label="Navegación principal"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative isolate overflow-hidden rounded-full px-4 py-2.5 text-xs font-black uppercase tracking-[0.13em] text-[var(--ln-muted)] transition-colors duration-300 hover:text-[var(--ln-night)]"
              >
                <span className="absolute inset-x-2 bottom-1 top-auto -z-10 h-px origin-left scale-x-0 bg-[var(--ln-clay)] transition-transform duration-300 group-hover:scale-x-100" />
                <span className="absolute inset-0 -z-20 rounded-full bg-[var(--ln-sage)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
            <Link
              href="/register"
              className="hidden min-h-11 items-center justify-center rounded-full border border-[var(--ln-night)]/9 bg-[rgb(255_255_255_/_0.58)] px-4 py-2.5 text-xs font-black uppercase tracking-[0.13em] text-[var(--ln-night)] transition-colors duration-300 hover:bg-[var(--ln-mint)] sm:inline-flex"
            >
              Registrarse
            </Link>
            <motion.a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={reduceMotion ? undefined : { y: -2, scale: 1.012 }}
              whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              className="hidden min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--ln-peach)] px-5 py-2.5 text-xs font-black uppercase tracking-[0.13em] text-[var(--ln-night)] shadow-[0_18px_54px_-36px_rgb(26_48_56_/_0.24)] sm:inline-flex"
            >
              <MessageCircle className="size-4" />
              Agendar
              <ArrowUpRight className="size-4" />
            </motion.a>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="inline-flex size-12 items-center justify-center rounded-[1.2rem] bg-[var(--ln-peach)] text-[var(--ln-night)] shadow-[0_18px_54px_-36px_rgb(26_48_56_/_0.24)] transition-transform hover:scale-[1.02] md:hidden"
              aria-expanded={menuOpen}
              aria-controls="landing-mobile-menu"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </motion.div>
      </motion.header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="landing-mobile-menu"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[rgb(26_48_56_/_0.22)] px-4 pt-24 backdrop-blur-md md:hidden"
          >
            <motion.nav
              initial={reduceMotion ? { y: 0 } : { y: -14 }}
              animate={{ y: 0 }}
              exit={reduceMotion ? { y: 0 } : { y: -14 }}
              transition={{ duration: 0.28, ease: [0.22, 0.72, 0.18, 1] }}
              className="overflow-hidden rounded-[2rem] border border-[rgb(255_252_248_/_0.8)] bg-[rgb(255_252_248_/_0.96)] p-4 shadow-[0_36px_100px_-64px_rgb(26_48_56_/_0.34)] backdrop-blur-2xl"
              aria-label="Navegación móvil"
            >
              {[...navLinks, { href: "/register", label: "Registrarse" }].map(
                (link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between border-b border-[var(--ln-night)]/8 px-2 py-4 [font-family:var(--font-landing-display)] text-4xl leading-none text-[var(--ln-night)] last:border-b-0"
                  >
                    <span>{link.label}</span>
                    <span className="text-sm font-black text-[var(--ln-clay)]">
                      0{index + 1}
                    </span>
                  </Link>
                ),
              )}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--ln-peach)] px-5 py-3.5 text-sm font-black text-[var(--ln-night)] shadow-[0_18px_54px_-36px_rgb(26_48_56_/_0.24)]"
              >
                Agendar consulta
                <ArrowUpRight className="size-4" />
              </a>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
