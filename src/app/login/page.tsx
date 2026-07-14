import { LoginForm } from "@/components/app/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { BarChart3, Menu, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { redirect } from "next/navigation";

const inter = Inter({
 subsets: ["latin"],
 display: "swap",
 variable: "--font-vitalflow-login",
});

const navLinks = [
 { href: "/login", label: "Iniciar sesión" },
 { href: "/blog", label: "Blog" },
 { href: "/register", label: "Registrarse" },
];

export const metadata: Metadata = {
 title: "Iniciar sesión",
 description:
 "Acceso privado al seguimiento de Nutrición Con Enfoque para clientes y profesionales.",
};

type LoginPageProps = {
 searchParams?: Promise<{
 authError?: string;
 }>;
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
 aria-current={link.href === "/login" ? "page" : undefined}
 className={[
 "rounded-sm transition-colors duration-200 hover:text-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]",
 link.href === "/login" ? "text-[var(--brand)]" : "",
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
 aria-current={link.href === "/login" ? "page" : undefined}
 className={[
 "flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--brand)]",
 link.href === "/login"
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

export default async function LoginPage({ searchParams }: LoginPageProps) {
 const user = await getCurrentUser();

 if (user) {
 redirect("/app");
 }

 const params = await searchParams;
 const initialError =
 params?.authError === "confirmation"
 ? "No se pudo confirmar el email. Solicitá un nuevo enlace o intentá iniciar sesión."
 : undefined;

 return (
 <div
 className={`${inter.variable} landing-public min-h-dvh bg-[var(--background)] text-[var(--foreground)] [--brand:var(--primary)] [--brand-hover:var(--primary-hover)] [--font-landing-display:var(--font-vitalflow-login)] [--font-landing-sans:var(--font-vitalflow-login)] [--ln-cream:var(--background)] [--ln-night:var(--foreground)]`}
 >
 <Header />
 <main id="main-content" className="pt-20">
 <section className="min-h-[calc(100dvh-5rem)] bg-[var(--surface-muted)] py-12 sm:py-16 lg:py-20">
 <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.72fr)] lg:gap-20">
 <div className="hidden lg:block">
 <h1 className="max-w-2xl text-5xl font-extrabold tracking-tight text-[var(--foreground)] xl:text-6xl">
 Volvé a tu proceso con todo en orden.
 </h1>
 <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted-foreground)]">
 Consultá tus planes, hablá con Mariana y Camila y revisá tus avances
 desde el mismo lugar donde seguís tu nutrición y entrenamiento.
 </p>
 <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
 <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-sm">
 <MessageCircle
 className="size-6 text-[var(--brand)]"
 aria-hidden="true"
 />
 <p className="mt-4 font-bold text-[var(--foreground)]">
 Acompañamiento directo
 </p>
 <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
 Tus conversaciones y ajustes permanecen accesibles.
 </p>
 </div>
 <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-sm">
 <BarChart3 className="size-6 text-[var(--brand)]" aria-hidden="true" />
 <p className="mt-4 font-bold text-[var(--foreground)]">
 Progreso visible
 </p>
 <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
 Hábitos, sesiones y próximas consultas en un resumen claro.
 </p>
 </div>
 </div>
 </div>

 <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08),0_10px_10px_-5px_rgba(0,0,0,0.03)] sm:p-8">
 <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl lg:hidden">
 Bienvenida de vuelta
 </h1>
 <h2 className="hidden text-4xl font-bold text-[var(--foreground)] lg:block">
 Bienvenida de vuelta
 </h2>
 <p className="mb-8 mt-3 leading-7 text-[var(--muted-foreground)]">
 Tu espacio de seguimiento te está esperando.
 </p>
 <LoginForm initialError={initialError} />
 </div>
 </div>
 </section>
 </main>
 </div>
 );
}
