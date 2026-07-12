import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const footerLinks = [
 { href: "/", label: "Inicio" },
 { href: "/blog", label: "Blog" },
 { href: "/login", label: "Iniciar sesión" },
 { href: "/register", label: "Registrarse" },
];

export function BlogFooter() {
 return (
 <footer className="relative overflow-hidden border-t border-[var(--blog-night)]/8 bg-[var(--blog-paper)]">
 <div className="hidden" />
 <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end lg:px-10">
 <div>
 <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--blog-forest)]">
 Nutrición Con Enfoque
 </p>
 <p
 style={{
 fontFamily: "var(--font-landing-display)",
 fontWeight: 500,
 }}
 className="mt-4 max-w-2xl text-[clamp(3rem,7vw,5.8rem)] leading-[0.86] tracking-[-0.035em] text-[var(--blog-night)]"
 >
 lecturas para cuidar tu cuerpo con criterio.
 </p>
 <p className="mt-5 max-w-md text-sm font-bold leading-6 text-[var(--blog-muted)]">
 Nutrición funcional, entrenamiento y bienestar cotidiano con una
 mirada humana y aplicable.
 </p>
 </div>

 <div className="grid gap-4">
 <div className="flex flex-wrap gap-2">
 {footerLinks.map((link) => (
 <Link
 key={link.href}
 href={link.href}
 className="group inline-flex min-h-10 items-center gap-2 rounded-full border-[var(--blog-night)]/10 bg-[var(--blog-paper)] px-4 py-2 text-sm font-black text-[var(--blog-night)] shadow-[0_18px_48px_-40px_rgb(var(--raspberry-rgb)_/_0.2)] transition-colors hover:border-[var(--blog-clay)]/30 hover:bg-[var(--blog-rose)]"
 >
 {link.label}
 <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
 </Link>
 ))}
 </div>
 <p className="text-sm font-bold text-[var(--blog-muted)] md:text-right">
 © {new Date().getFullYear()} · Mariana Rodríguez Méndez + Camila
 Rodríguez Méndez
 </p>
 </div>
 </div>
 </footer>
 );
}
