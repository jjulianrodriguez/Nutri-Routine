import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";

import {
 CalendarArtwork,
 HeroDashboardPreview,
 MessagingArtwork,
 ProgressArtwork,
} from "./landing-interactive-demos";
import {
 LandingCard,
 LandingCta,
 LandingMotionProvider,
 LandingReveal,
} from "./landing-motion";

const inter = Inter({
 subsets: ["latin"],
 display: "swap",
 variable: "--font-vitalflow",
});

const brand = {
 background:
 "[--brand:var(--primary)] [--brand-hover:var(--primary-hover)]",
};

const whatsappHref = "https://wa.me/50688332426";

function BrandMark() {
 return (
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
 );
}

const navLinks = [
 { href: "/login", label: "Iniciar sesión" },
 { href: "/blog", label: "Blog" },
 { href: "/register", label: "Registrarse" },
];

function Header() {
 return (
 <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface)_95%,transparent)] backdrop-blur-sm">
 <LandingReveal direction="down" distance={12} duration={0.46}>
 <nav
 className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"
 aria-label="Navegación principal"
 >
 <BrandMark />

 <div className="hidden items-center gap-8 text-sm font-medium text-[var(--muted-foreground)] md:flex">
 {navLinks.map((link) => (
 <Link
 key={link.label}
 href={link.href}
 className="rounded-sm transition-colors duration-200 hover:text-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]"
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
 className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--brand)]"
 >
 {link.label}
 </Link>
 ))}
 </div>
 </div>
 </details>
 </nav>
 </LandingReveal>
 </header>
 );
}

function Hero() {
 return (
 <section className="relative flex min-h-[calc(100dvh-5rem)] items-center overflow-hidden bg-[var(--surface)] py-12 md:py-16">
 <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 text-left sm:gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-14 xl:gap-20">
 <div className="grid max-w-[38rem] gap-6 sm:gap-8 lg:max-w-none lg:gap-10">
 <LandingReveal direction="left" distance={28}>
 <h1 className="text-[2rem] font-extrabold leading-[1.04] tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
 Tu{" "}
 <span className="inline-block text-[1.2em] italic text-[var(--secondary)]">
 nutrición
 </span>{" "}
 y{" "}
 <span className="inline-block text-[1.2em] italic text-[var(--primary)]">
 entrenamiento,
 </span>{" "}
 acompañados de verdad.
 </h1>
 </LandingReveal>
 <LandingReveal direction="left" distance={24} delay={0.1}>
 <p className="max-w-xl text-left text-lg leading-relaxed text-[var(--muted-foreground)] md:text-xl">
 La Dra. Mariana Rodríguez Méndez y Camila Rodríguez Méndez unen
 nutrición funcional, entrenamiento personalizado y una app privada
 para que tus planes, conversaciones y avances estén siempre a mano.
 </p>
 </LandingReveal>
 <div className="flex flex-col items-start justify-start gap-4 sm:flex-row">
 <LandingCta
 href={whatsappHref}
 target="_blank"
 rel="noopener noreferrer"
 delay={0.18}
 className="inline-flex min-h-14 w-full items-center justify-center rounded-md bg-[var(--brand)] px-4 py-4 text-base font-semibold text-[var(--primary-foreground)] shadow-[0_14px_34px_-18px_rgb(var(--primary-rgb)_/_0.38)] transition-all duration-200 hover:bg-[var(--brand-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)] sm:w-auto sm:px-8 sm:text-lg"
 >
 Agendar una primera consulta
 </LandingCta>
 </div>
 </div>
 <LandingReveal
 className="w-full min-w-0"
 direction="right"
 distance={34}
 delay={0.12}
 >
 <HeroDashboardPreview />
 </LandingReveal>
 </div>
 </section>
 );
}

function ProfessionalVisual({
 type,
}: {
 type: "training" | "nutrition";
}) {
 const isTraining = type === "training";

 return (
 <div
 className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] sm:aspect-[16/11]"
 role="group"
 aria-label={
 isTraining
 ? "Presentación de Camila Rodríguez Méndez"
 : "Presentación de la Dra. Mariana Rodríguez Méndez"
 }
 >
 <Image
 src={
 isTraining
 ? "/landing/personal-trainer.png"
 : "/landing/nutritionist.png"
 }
 alt={
 isTraining
 ? "Entrenadora profesional preparando una sesión de entrenamiento personalizado"
 : "Nutricionista profesional preparando un plan de alimentación personalizado"
 }
 fill
 className="object-cover"
 sizes="(max-width: 767px) 100vw, 50vw"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--foreground)_25%,transparent)] via-transparent to-transparent" />
 <div className="absolute left-3 top-3 rounded-md border border-[color-mix(in_srgb,var(--surface)_45%,transparent)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--foreground)] shadow-sm backdrop-blur sm:left-5 sm:top-5 sm:text-xs">
 {isTraining ? "Camila Rodríguez Méndez" : "Dra. Mariana Rodríguez Méndez"}
 </div>
 </div>
 );
}

function TrainerSection() {
 return (
 <section
 id="profesionales"
 className="bg-[var(--surface-muted)] py-16 md:py-24"
 >
 <div className="mx-auto max-w-7xl px-6">
 <div className="grid items-center gap-12 md:grid-cols-2 md:gap-24">
 <LandingReveal
 className="order-2 flex flex-col gap-2 md:order-1"
 direction="left"
 distance={30}
 >
 <h2 className="mb-6 text-3xl font-bold text-[var(--foreground)] md:text-4xl">
 Entrena con Camila, a tu ritmo y con un plan hecho para ti.
 </h2>
 <p className="text-lg leading-relaxed text-[var(--muted-foreground)]">
 Camila Rodríguez Méndez convierte tus objetivos en sesiones claras,
 progresivas y adaptadas a tu realidad. Tendrás una guía cercana para
 aprender a moverte con confianza, desarrollar fuerza y sostener una
 rutina que sí encaje en tu semana.
 </p>
 <p className="mt-5 text-lg leading-relaxed text-[var(--muted-foreground)]">
 Desde la app puedes consultar tu entrenamiento, registrar lo que
 completas y conversar con Camila cuando necesites resolver una duda o
 ajustar el proceso. Tu acompañamiento no termina al salir de la sesión.
 </p>
 </LandingReveal>
 <LandingReveal
 className="order-1 md:order-2"
 direction="right"
 distance={30}
 delay={0.08}
 >
 <ProfessionalVisual type="training" />
 </LandingReveal>
 </div>
 </div>
 </section>
 );
}

function NutritionistSection() {
 return (
 <section className="bg-[var(--surface)] py-16 md:py-24">
 <div className="mx-auto max-w-7xl px-6">
 <div className="grid items-center gap-12 md:grid-cols-2 md:gap-24">
 <LandingReveal direction="left" distance={30} delay={0.08}>
 <ProfessionalVisual type="nutrition" />
 </LandingReveal>
 <LandingReveal className="flex flex-col gap-2" direction="right" distance={30}>
 <h2 className="mb-6 text-3xl font-bold text-[var(--foreground)] md:text-4xl">
 Cuida tu nutrición con la guía de la Dra. Mariana.
 </h2>
 <p className="text-lg leading-relaxed text-[var(--muted-foreground)]">
 La Dra. Mariana Rodríguez Méndez te acompaña a entender tus hábitos y a
 construir una alimentación posible, sin planes genéricos ni soluciones
 desconectadas de tu día a día. Cada recomendación parte de tus señales,
 tus objetivos y tu contexto.
 </p>
 <p className="mt-5 text-lg leading-relaxed text-[var(--muted-foreground)]">
 Tu plan nutricional, documentos, hábitos y revisiones quedan reunidos en
 la app. Así puedes ver qué sigue, compartir avances y recibir ajustes de
 Mariana con una atención realmente personalizada.
 </p>
 </LandingReveal>
 </div>
 </div>
 </section>
 );
}

const suiteCards = [
 {
 title: "Habla con tus profesionales",
 description:
 "Resuelve dudas y recibe seguimiento directo de Mariana y Camila en un mismo lugar.",
 artwork: <MessagingArtwork />,
 },
 {
 title: "Tus citas, siempre a la vista",
 description:
 "Consulta citas, recordatorios y próximas revisiones desde el calendario de la app.",
 artwork: <CalendarArtwork />,
 },
 {
 title: "Mira cómo avanzas",
 description:
 "Revisa hábitos, entrenamientos y próximas consultas en un resumen fácil de entender.",
 artwork: <ProgressArtwork />,
 },
];

function ProfessionalSuite() {
 return (
 <section
 id="professional-suite"
 className="bg-[var(--surface-muted)] py-20 md:py-32"
 >
<div className="mx-auto grid max-w-7xl gap-16 px-6">
<div className="flex flex-col items-center gap-8 text-center md:gap-10">
 <LandingReveal>
 <h2 className="text-3xl text-center font-bold text-[var(--foreground)] md:text-4xl">
 Tu acompañamiento, siempre a mano.
 </h2>
 </LandingReveal>
 <LandingReveal delay={0.1}>
<p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-[var(--muted-foreground)]">
 La app reúne lo importante de tu proceso para que sepas qué hacer,
 puedas comunicarte y veas tus avances sin perder el hilo.
 </p>
 </LandingReveal>
 </div>
 <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
 {suiteCards.map((card, index) => (
 <LandingCard
 key={card.title}
 delay={index * 0.08}
 className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-2 shadow-sm"
 >
 <div className="mb-4 overflow-hidden rounded-xl">{card.artwork}</div>
 <div className="px-4 pb-6">
 <h3 className="mb-2 text-xl font-bold text-[var(--foreground)]">
 {card.title}
 </h3>
 <p className="text-sm text-[var(--muted-foreground)]">
 {card.description}
 </p>
 </div>
 </LandingCard>
 ))}
 </div>
 </div>
 </section>
 );
}

function FinalCta() {
 return (
 <section className="bg-[var(--brand)] py-20 text-[var(--primary-foreground)]">
<div className="mx-auto flex flex-col items-center max-w-7xl gap-8 px-6 text-center md:gap-10">
 <LandingReveal>
<h2 className="text-3xl font-bold text-[var(--primary-foreground)] md:text-5xl">
 ¿Listo para comenzar un proceso hecho para ti?
 </h2>
 </LandingReveal>
 <LandingReveal delay={0.1}>
<p className="mx-auto max-w-2xl text-center text-lg text-[color-mix(in_srgb,var(--primary-foreground)_80%,transparent)] md:text-xl">
 Agenda una primera conversación y descubre cómo Mariana y Camila pueden
 acompañar tu nutrición, tu entrenamiento y tu bienestar desde un mismo
 lugar.
 </p>
 </LandingReveal>
 <LandingCta
 href={whatsappHref}
 target="_blank"
 rel="noopener noreferrer"
 delay={0.18}
className="inline-flex min-h-14 items-center justify-center justify-self-center rounded-md bg-[var(--surface)] px-10 py-4 text-lg font-bold transition-colors duration-200 hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-foreground)] text-(--primary)"
 >
 Agendar una consulta
 </LandingCta>
 </div>
 </section>
 );
}

function Footer() {
 return (
 <footer className="border-t border-[color-mix(in_srgb,var(--primary-foreground)_10%,transparent)] bg-[var(--brand)] py-8">
 <LandingReveal
 className="mx-auto flex max-w-7xl flex-col items-center justify-between px-6 text-xs text-[color-mix(in_srgb,var(--primary-foreground)_65%,transparent)] sm:text-sm md:flex-row"
 distance={12}
 duration={0.5}
 >
 <div className="mb-4 md:mb-0">
 Mariana y Camila Rodríguez Méndez.
 </div>
 <div className="flex space-x-6">
 {["Política de privacidad", "Términos del servicio", "Contacto"].map(
 (label) => (
 <Link
 key={label}
 href="/"
 className="rounded-sm transition-colors duration-200 hover:text-[var(--primary-foreground)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-foreground)]"
 >
 {label}
 </Link>
 ),
 )}
 </div>
 </LandingReveal>
 </footer>
 );
}

export default function HomePage() {
 return (
 <LandingMotionProvider>
 <div
 className={
 inter.variable +
 " landing-public min-h-dvh bg-[var(--background)] text-[var(--foreground)] [--font-landing-display:var(--font-vitalflow)] [--font-landing-sans:var(--font-vitalflow)] [--ln-cream:var(--background)] [--ln-night:var(--foreground)] " +
 brand.background
 }
 >
 <Header />
 <main id="main-content" className="pt-20">
 <Hero />
 <TrainerSection />
 <NutritionistSection />
 <ProfessionalSuite />
 <FinalCta />
 </main>
 <Footer />
 </div>
 </LandingMotionProvider>
 );
}
