import { Menu } from "lucide-react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

const inter = Inter({
 subsets: ["latin"],
 display: "swap",
 variable: "--font-vitalflow-blog",
});

const navLinks = [
 { href: "/login", label: "Iniciar sesión" },
 { href: "/blog", label: "Blog" },
 { href: "/register", label: "Registrarse" },
];

export const metadata: Metadata = {
 title: "Blog",
 description:
 "Artículos sobre nutrición funcional, entrenamiento, salud hormonal y bienestar.",
};

function Header() {
 return (
 <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface)_95%,transparent)] backdrop-blur-sm">
 <nav
 className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"
 aria-label="Navegación principal"
 >
 <Link
 href="/"
 aria-label="VitalFlow · Inicio"
 className="flex min-h-11 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]"
 >
 <span className="flex size-8 items-center justify-center rounded bg-[var(--brand)] text-xl font-bold text-[var(--primary-foreground)]">
 V
 </span>
 <span className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">
 VitalFlow
 </span>
 </Link>

 <div className="hidden items-center gap-8 text-sm font-medium text-[var(--muted-foreground)] md:flex">
 {navLinks.map((link) => (
 <Link
 key={link.label}
 href={link.href}
 aria-current={link.href === "/blog" ? "page" : undefined}
 className={[
 "rounded-sm transition-colors duration-200 hover:text-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]",
 link.href === "/blog" ? "text-[var(--brand)]" : "",
 ].join(" ")}
 >
 {link.label}
 </Link>
 ))}
 </div>

 <details className="group relative md:hidden">
 <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] [&::-webkit-details-marker]:hidden">
 <Menu className="size-6" aria-hidden="true" />
 <span className="sr-only">Abrir menú de navegación</span>
 </summary>
 <div className="absolute right-0 top-14 w-64 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-3 shadow-xl">
 <div className="flex flex-col">
 {navLinks.map((link) => (
 <Link
 key={link.label}
 href={link.href}
 aria-current={link.href === "/blog" ? "page" : undefined}
 className={[
 "flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--brand)]",
 link.href === "/blog"
 ? "text-[var(--brand)]"
 : "text-[var(--text-secondary)]",
 ].join(" ")}
 >
 {link.label}
 </Link>
 ))}
 </div>
 </div>
 </details>
 </nav>
 </header>
 );
}

function Footer() {
 return (
 <footer className="border-t border-[color-mix(in_srgb,var(--primary-foreground)_10%,transparent)] bg-[var(--brand)] py-8">
 <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-6 text-xs text-[color-mix(in_srgb,var(--primary-foreground)_65%,transparent)] sm:text-sm md:flex-row">
 <p className="mb-4 text-center md:mb-0 md:text-left">
 © {new Date().getFullYear()} VitalFlow · Mariana y Camila Rodríguez
 Méndez.
 </p>
 <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
 <Link
 href="/"
 className="rounded-sm transition-colors hover:text-[var(--primary-foreground)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-foreground)]"
 >
 Inicio
 </Link>
 <Link
 href="/login"
 className="rounded-sm transition-colors hover:text-[var(--primary-foreground)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-foreground)]"
 >
 Iniciar sesión
 </Link>
 <Link
 href="/register"
 className="rounded-sm transition-colors hover:text-[var(--primary-foreground)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-foreground)]"
 >
 Registrarse
 </Link>
 </div>
 </div>
 </footer>
 );
}

export default function BlogLayout({ children }: { children: ReactNode }) {
 return (
 <div
 className={`${inter.variable} landing-public flex min-h-dvh flex-col bg-[var(--background)] text-[var(--foreground)] [--brand:var(--primary)] [--brand-hover:var(--primary-hover)] [--font-landing-display:var(--font-vitalflow-blog)] [--font-landing-sans:var(--font-vitalflow-blog)] [--ln-cream:var(--background)] [--ln-night:var(--foreground)] [--blog-clay:var(--primary)] [--blog-cream:var(--background)] [--blog-forest:var(--secondary)] [--blog-mint:var(--secondary-soft)] [--blog-muted:var(--muted-foreground)] [--blog-night:var(--foreground)] [--blog-paper:var(--surface)] [--blog-peach:var(--primary)] [--blog-rose:var(--primary-soft)] [--blog-sage:var(--surface-muted)] [--blog-sand:var(--secondary-soft)]`}
 >
 <Header />
 <main id="main-content" className="flex-1 pt-20">
 {children}
 </main>
 <Footer />
 </div>
 );
}
