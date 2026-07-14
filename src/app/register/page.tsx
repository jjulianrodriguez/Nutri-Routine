import { RegisterForm } from "@/components/app/auth/register-form";
import { getCurrentUser } from "@/lib/auth/session";
import { KeyRound, Menu, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { redirect } from "next/navigation";

const inter = Inter({
 subsets: ["latin"],
 display: "swap",
 variable: "--font-vitalflow-register",
});

const navLinks = [
 { href: "/login", label: "Iniciar sesión" },
 { href: "/blog", label: "Blog" },
 { href: "/register", label: "Registrarse" },
];

export const metadata: Metadata = {
 title: "Crear cuenta",
 description:
 "Registro privado con código entregado por tu profesional de Nutrición Con Enfoque.",
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
 aria-current={link.href === "/register" ? "page" : undefined}
 className={[
 "rounded-sm transition-colors duration-200 hover:text-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]",
 link.href === "/register" ? "text-[var(--brand)]" : "",
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
 aria-current={link.href === "/register" ? "page" : undefined}
 className={[
 "flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--brand)]",
 link.href === "/register"
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

export default async function RegisterPage() {
 const user = await getCurrentUser();

 if (user) {
 redirect("/app");
 }

 return (
 <div
 className={`${inter.variable} landing-public min-h-dvh bg-[var(--background)] text-[var(--foreground)] [--brand:var(--primary)] [--brand-hover:var(--primary-hover)] [--font-landing-display:var(--font-vitalflow-register)] [--font-landing-sans:var(--font-vitalflow-register)] [--ln-cream:var(--background)] [--ln-night:var(--foreground)]`}
 >
 <Header />
 <main id="main-content" className="pt-20">
 <section className="min-h-[calc(100dvh-5rem)] bg-[var(--surface-muted)] py-12 sm:py-16 lg:py-20">
 <div className="mx-auto grid max-w-7xl items-start gap-12 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.72fr)] lg:gap-20 xl:grid-cols-[minmax(0,0.78fr)_minmax(36rem,1.22fr)] xl:gap-16">
 <div className="hidden pt-4 lg:block">
 <h1 className="max-w-2xl text-5xl font-extrabold tracking-tight text-[var(--foreground)] xl:text-6xl">
 Tu acompañamiento empieza en un espacio pensado para vos.
 </h1>
 <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted-foreground)]">
 Creá tu cuenta con el código que recibiste de Mariana o Camila y reuní
 tu nutrición, entrenamiento y seguimiento en una experiencia privada.
 </p>
 <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
 <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-sm">
 <KeyRound className="size-6 text-[var(--brand)]" aria-hidden="true" />
 <p className="mt-4 font-bold text-[var(--foreground)]">
 Acceso por código
 </p>
 <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
 El registro está reservado para clientes invitados.
 </p>
 </div>
 <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-sm">
 <ShieldCheck
 className="size-6 text-[var(--brand)]"
 aria-hidden="true"
 />
 <p className="mt-4 font-bold text-[var(--foreground)]">
 Seguimiento privado
 </p>
 <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
 Tus planes y conversaciones se mantienen en tu cuenta.
 </p>
 </div>
 </div>
 </div>

 <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08),0_10px_10px_-5px_rgba(0,0,0,0.03)] sm:p-8">
 <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl lg:hidden">
 Empezá con calma
 </h1>
 <h2 className="hidden text-4xl font-bold text-[var(--foreground)] lg:block">
 Empezá con calma
 </h2>
 <p className="mb-8 mt-3 leading-7 text-[var(--muted-foreground)]">
 Usá el código privado entregado por tu profesional.
 </p>
 <div className="xl:[&>form]:grid xl:[&>form]:grid-cols-2 xl:[&>form]:items-start xl:[&>form]:gap-x-6 xl:[&>form]:gap-y-5 xl:[&>form]:space-y-0 xl:[&>form>*:nth-child(1)]:col-start-1 xl:[&>form>*:nth-child(1)]:row-start-1 xl:[&>form>*:nth-child(2)]:col-start-1 xl:[&>form>*:nth-child(2)]:row-start-2 xl:[&>form>*:nth-child(3)]:col-start-1 xl:[&>form>*:nth-child(3)]:row-start-3 xl:[&>form>*:nth-child(4)]:col-start-2 xl:[&>form>*:nth-child(4)]:row-start-1 xl:[&>form>*:nth-child(5)]:col-start-2 xl:[&>form>*:nth-child(5)]:row-start-2 xl:[&>form>*:nth-child(n+6)]:col-span-2">
 <RegisterForm />
 </div>
 </div>
 </div>
 </section>
 </main>
 </div>
 );
}
