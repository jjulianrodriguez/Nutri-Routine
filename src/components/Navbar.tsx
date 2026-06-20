"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
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

const navLinks = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/#enfoque", label: "Enfoque" },
  { href: "/login", label: "Iniciar sesión" },
  { href: "/register", label: "Registrarse" },
];

function BrandSigil() {
  return (
    <Link
      href="/"
      aria-label="Nutrición Con Enfoque · Inicio"
      className="group grid grid-cols-[2.5rem_1fr] items-center gap-3"
    >
      <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-charcoal shadow-soft">
        <span className="absolute h-8 w-5 rotate-45 rounded-[100%_0_100%_0] bg-sage transition-transform duration-300 group-hover:scale-110" />
        <span className="relative size-1.5 rounded-full bg-charcoal" />
      </span>
      <span className="leading-none">
        <span className="block font-heading text-lg font-bold text-charcoal">
          Nutrición
        </span>
        <span className="block text-[0.68rem] font-bold uppercase text-warm-brown">
          Con Enfoque
        </span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    damping: 34,
    stiffness: 130,
    mass: 0.45,
  });
  const y = useTransform(progress, [0, 0.18], [0, 10]);
  const navOpacity = useTransform(progress, [0, 0.08], [0.94, 0.78]);

  return (
    <>
      <motion.header
        style={reduceMotion ? undefined : { y, opacity: navOpacity }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 rounded-full border border-border bg-surface/76 px-3 py-3 shadow-card backdrop-blur-2xl sm:grid-cols-[1fr_auto_1fr] sm:px-4">
          <BrandSigil />

          <nav
            className="hidden items-center rounded-full border border-border bg-surface/72 px-2 py-1 shadow-soft backdrop-blur-xl md:flex"
            aria-label="Navegación principal"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative rounded-full px-4 py-2 text-sm font-bold text-warm-brown transition-none"
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute inset-0 rounded-full bg-sage opacity-0 transition-opacity duration-200 group-hover:opacity-45" />
              </Link>
            ))}
          </nav>

          <div className="flex justify-end">
            <motion.a
              href="https://wa.me/50688332426"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
              className="hidden items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-white shadow-soft transition-none sm:inline-flex"
            >
              Agendar consulta
              <ArrowUpRight className="size-4" />
            </motion.a>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="inline-flex size-11 items-center justify-center rounded-full bg-charcoal text-white shadow-soft transition-transform hover:scale-[1.02] md:hidden"
              aria-expanded={menuOpen}
              aria-controls="nce-mobile-menu"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="nce-mobile-menu"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-charcoal/24 px-4 pt-24 backdrop-blur-md md:hidden"
          >
            <motion.nav
              initial={reduceMotion ? { y: 0 } : { y: -12 }}
              animate={{ y: 0 }}
              exit={reduceMotion ? { y: 0 } : { y: -12 }}
              className="overflow-hidden rounded-[28px] border border-border bg-surface/88 p-4 shadow-premium backdrop-blur-2xl"
              aria-label="Navegación móvil"
            >
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between border-b border-border px-2 py-4 font-heading text-3xl font-bold text-charcoal last:border-b-0"
                >
                  <span>{link.label}</span>
                  <span className="text-sm font-bold text-warm-brown">
                    0{index + 1}
                  </span>
                </Link>
              ))}
              <a
                href="https://wa.me/50688332426"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-extrabold text-white shadow-soft"
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
