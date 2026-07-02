"use client";

import { ArrowUpRight, MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const whatsappHref = "https://wa.me/50688332426";

const footerLinks = [
 { href: "/#servicios", label: "Servicios" },
 { href: "/#proceso", label: "Cómo funciona" },
 { href: "/#enfoque", label: "Criterio" },
 { href: "/#confianza", label: "Confianza" },
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
 <div className="hidden" />
 <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
 <div className="grid gap-5 lg:grid-cols-[minmax(0,1.18fr)_minmax(20rem,0.58fr)]">
 <motion.div
 initial={reduceMotion ? false : { opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-80px" }}
 transition={{ duration: 0.72, ease: [0.18, 0.82, 0.22, 1] }}
 className="relative overflow-hidden rounded-[2.4rem] border-[var(--ln-night)]/10 bg-[var(--ln-paper)] p-6 shadow-[0_38px_120px_-84px_rgb(var(--raspberry-rgb)_/_0.28)] sm:p-8 lg:min-h-[35rem]"
 >
 <div className="hidden" />
 <div className="hidden" />

 <div className="relative flex flex-wrap items-start justify-between gap-6">
 <div className="inline-flex items-center gap-3">
 <span className="grid size-12 place-items-center rounded-[1.25rem] bg-[var(--ln-mint)]">
 <svg
 viewBox="0 0 40 40"
 className="size-9"
 fill="none"
 aria-hidden="true"
 >
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
 className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--ln-clay)] px-5 py-2.5 text-sm font-black text-[var(--ln-paper)] shadow-[0_20px_58px_-36px_rgb(var(--raspberry-rgb)_/_0.34)]"
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
 className="rounded-[1.2rem] border-[var(--ln-night)]/8 bg-[var(--ln-paper)] px-4 py-3 text-sm font-black text-[var(--ln-muted)]"
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
 <div className="rounded-[2rem] bg-[var(--ln-night)] p-6 text-[var(--ln-paper)] shadow-[0_34px_100px_-70px_rgb(var(--raspberry-rgb)_/_0.42)] sm:p-7">
 <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ln-peach)]">
 próximas consultas
 </p>
 <p className="mt-5 text-xl font-black leading-8">
 Una primera conversación para ordenar señales, objetivos y
 energía real.
 </p>
 </div>

 <div className="rounded-[2rem] border-[var(--ln-night)]/8 bg-[var(--ln-paper)] p-6 shadow-[0_34px_100px_-78px_rgb(var(--raspberry-rgb)_/_0.22)] sm:p-7">
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
 <br />
 Acceso privado con código entregado por tu profesional.
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
