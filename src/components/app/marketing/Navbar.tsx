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
 { href: "/#proceso", label: "Cómo funciona" },
 { href: "/#confianza", label: "Confianza" },
 { href: "/blog", label: "Blog" },
 { href: "/login", label: "Iniciar sesión" },
];

function LandingWordmark() {
 return (
 <Link
 href="/"
 aria-label="Nutrición Con Enfoque · Inicio"
 className="flex min-w-0 items-center gap-3 rounded-full px-1 pr-2 text-[var(--ln-night)]"
 >
 <span className="grid size-10 shrink-0 place-items-center rounded-full border-[var(--ln-night)]/10 bg-[var(--ln-cream)] shadow-[0_16px_42px_-32px_rgb(var(--raspberry-rgb)_/_0.26)]">
 <svg viewBox="0 0 40 40" className="size-8" fill="none" aria-hidden="true">
 <path
 d="M19.8 8.2C14.2 12.7 10.9 18.8 12.3 25.2C17.9 24.4 24.7 20.3 27.7 12.4C25.5 10 22.8 8.7 19.8 8.2Z"
 fill="var(--ln-peach)"
 />
 <path
 d="M13.7 27.8C17.1 21.6 21.8 16.8 27.6 12.4"
 stroke="var(--ln-night)"
 strokeLinecap="round"
 strokeWidth="1.35"
 />
 <path
 d="M25.6 25.7C22.7 28.7 18.4 30.1 13.1 29.2"
 stroke="var(--ln-forest)"
 strokeLinecap="round"
 strokeWidth="3"
 />
 </svg>
 </span>
 <span className="hidden leading-none min-[390px]:block">
 <span className="block [font-family:var(--font-landing-display)] text-2xl leading-none">
 Nutrición
 </span>
 <span className="block text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--ln-muted)]">
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
 stiffness: 135,
 mass: 0.46,
 });
 const y = useTransform(progress, [0, 0.18], [0, 7]);
 const navShadow = useTransform(
 progress,
 [0, 0.16],
 [
 "0 18px 58px -48px rgb(var(--primary-rgb) / 0.16)",
 "0 22px 64px -50px rgb(var(--primary-rgb) / 0.22)",
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
 className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-full border-[var(--ln-night)]/10 bg-[var(--ln-paper)] px-3 py-3 sm:px-4"
 >
 <LandingWordmark />

 <nav
 className="hidden items-center gap-1 rounded-full border-[var(--ln-night)]/8 bg-[var(--ln-paper)] p-1 lg:flex"
 aria-label="Navegación principal"
 >
 {navLinks.map((link) => (
 <Link
 key={link.href}
 href={link.href}
 className="group relative isolate rounded-full px-4 py-2.5 text-xs font-black uppercase tracking-[0.13em] text-[var(--ln-muted)] transition-colors duration-200 hover:text-[var(--ln-night)] focus-visible:text-[var(--ln-night)]"
 >
 <span className="absolute inset-x-4 bottom-1.5 h-px origin-center scale-x-0 bg-[var(--ln-clay)]/80 transition-transform duration-200 group-hover:scale-x-100 group-focus-visible:scale-x-100" />
 {link.label}
 </Link>
 ))}
 </nav>

 <div className="flex flex-1 items-center justify-end gap-2 lg:flex-none">
 <Link
 href="/register"
 className="hidden min-h-11 items-center justify-center rounded-full border-[var(--ln-night)]/10 bg-[var(--ln-paper)] px-4 py-2.5 text-xs font-black uppercase tracking-[0.13em] text-[var(--ln-night)] transition-colors duration-200 hover:border-[var(--ln-night)]/16 hover:bg-[var(--ln-rose)] lg:inline-flex"
 >
 Registrarse
 </Link>
 <motion.a
 href={whatsappHref}
 target="_blank"
 rel="noopener noreferrer"
 whileHover={reduceMotion ? undefined : { y: -1 }}
 whileTap={reduceMotion ? undefined : { scale: 0.99 }}
 className="hidden min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--ln-clay)] px-5 py-2.5 text-xs font-black uppercase tracking-[0.13em] !text-[var(--ln-paper)] shadow-[0_14px_36px_-30px_rgb(var(--raspberry-rgb)_/_0.34)] transition-colors duration-200 hover:bg-[var(--ln-clay-hover)] lg:inline-flex"
 >
 <MessageCircle className="size-4" />
 Agendar
 <ArrowUpRight className="size-4" />
 </motion.a>
 <button
 type="button"
 onClick={() => setMenuOpen((value) => !value)}
 className="inline-flex size-12 items-center justify-center rounded-[1.2rem] bg-[var(--ln-clay)] !text-[var(--ln-paper)] shadow-[0_14px_36px_-30px_rgb(var(--raspberry-rgb)_/_0.34)] transition-colors duration-200 hover:bg-[var(--ln-clay-hover)] lg:hidden"
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
 className="fixed inset-0 z-40 bg-[var(--ln-sage)] px-4 pt-24 lg:hidden"
 >
 <motion.nav
 initial={reduceMotion ? { y: 0 } : { y: -14 }}
 animate={{ y: 0 }}
 exit={reduceMotion ? { y: 0 } : { y: -14 }}
 transition={{ duration: 0.28, ease: [0.22, 0.72, 0.18, 1] }}
 className="overflow-hidden rounded-[2rem] border-[var(--ln-night)]/10 bg-[var(--ln-paper)] p-4 shadow-[0_36px_100px_-64px_rgb(var(--raspberry-rgb)_/_0.34)]"
 aria-label="Navegación móvil"
 >
 {[...navLinks, { href: "/register", label: "Registrarse" }].map(
 (link, index) => (
 <Link
 key={link.href}
 href={link.href}
 onClick={() => setMenuOpen(false)}
 className="flex items-center justify-between border-b border-[var(--ln-night)]/8 px-2 py-4 [font-family:var(--font-landing-display)] text-4xl leading-none text-[var(--ln-night)] transition-colors duration-200 hover:text-[var(--ln-clay)] last:border-b-0"
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
 className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--ln-clay)] px-5 py-3.5 text-sm font-black !text-[var(--ln-paper)] shadow-[0_14px_36px_-30px_rgb(var(--raspberry-rgb)_/_0.34)] transition-colors duration-200 hover:bg-[var(--ln-clay-hover)]"
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
