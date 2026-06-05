import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Flame,
  HeartPulse,
  Leaf,
  MessageCircle,
  NotebookTabs,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { getAppUserProfile } from "@/components/app/session-profile";
import type { AppRole } from "@/components/app/SidebarNav";
import { requireUserContext } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

const professionalStats = [
  {
    label: "Clientes activos",
    value: "34",
    detail: "+6 este mes",
    icon: Users,
  },
  {
    label: "Citas esta semana",
    value: "18",
    detail: "6 virtuales",
    icon: CalendarDays,
  },
  {
    label: "Planes por revisar",
    value: "9",
    detail: "Prioridad alta",
    icon: NotebookTabs,
  },
  {
    label: "Adherencia promedio",
    value: "84%",
    detail: "+7% vs. abril",
    icon: TrendingUp,
  },
];

const professionalAgenda = [
  {
    time: "08:30",
    name: "Natalia Vega",
    type: "Seguimiento nutricional",
    mode: "Virtual",
  },
  {
    time: "10:00",
    name: "Andrés Salazar",
    type: "Ajuste de fuerza",
    mode: "Gimnasio",
  },
  {
    time: "13:30",
    name: "Sofía Jiménez",
    type: "Primera consulta integral",
    mode: "Presencial",
  },
  {
    time: "16:00",
    name: "María Fernanda Ruiz",
    type: "Revisión de hábitos",
    mode: "Virtual",
  },
];

const clientFocus = [
  {
    name: "Natalia Vega",
    goal: "Energía sostenida y salud digestiva",
    progress: 78,
    tag: "Nutrición",
  },
  {
    name: "Andrés Salazar",
    goal: "Fuerza base y movilidad de cadera",
    progress: 64,
    tag: "Entrenamiento",
  },
  {
    name: "Sofía Jiménez",
    goal: "Plan combinado de recomposición",
    progress: 52,
    tag: "Integral",
  },
];

const professionalTasks = [
  "Actualizar menú de ciclo para 4 clientes",
  "Enviar video de técnica de peso muerto",
  "Revisar síntomas digestivos reportados",
  "Preparar check-in grupal del viernes",
];

const clientStats = [
  {
    label: "Adherencia semanal",
    value: "86%",
    detail: "5 de 6 hábitos cumplidos",
    icon: CheckCircle2,
  },
  {
    label: "Sesiones completadas",
    value: "3/4",
    detail: "Próxima: fuerza tren inferior",
    icon: Dumbbell,
  },
  {
    label: "Energía reportada",
    value: "8.4",
    detail: "Promedio de 7 días",
    icon: Flame,
  },
  {
    label: "Próxima cita",
    value: "Jue",
    detail: "9:00 a. m. virtual",
    icon: CalendarDays,
  },
];

const dailyPlan = [
  {
    title: "Desayuno",
    description: "Proteína + fibra + grasa saludable",
    status: "Listo",
  },
  {
    title: "Movimiento",
    description: "40 min fuerza con movilidad final",
    status: "Hoy",
  },
  {
    title: "Hidratación",
    description: "2.3 L con electrolitos si entrenás",
    status: "En progreso",
  },
];

const clientProgress = [
  { label: "Sueño", value: 74 },
  { label: "Digestión", value: 81 },
  { label: "Fuerza", value: 68 },
];

function StatCard({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted">{label}</p>
          <p className="mt-3 font-serif text-4xl font-semibold leading-none text-charcoal">
            {value}
          </p>
        </div>
        <div className="grid size-11 place-items-center rounded-full bg-primary-soft text-charcoal">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-sm font-bold text-warm-brown">{detail}</p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-semibold leading-tight text-charcoal sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}

function ProgressPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-4 shadow-soft">
      <div className="flex items-center gap-4">
        <div
          className="grid size-16 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--primary) 0 ${value}%, var(--surface-secondary) ${value}% 100%)`,
          }}
        >
          <div className="grid size-12 place-items-center rounded-full bg-surface text-sm font-extrabold text-charcoal">
            {value}%
          </div>
        </div>
        <div>
          <p className="font-extrabold text-charcoal">{label}</p>
          <p className="mt-1 text-sm text-muted">Tendencia positiva</p>
        </div>
      </div>
    </div>
  );
}

function HeroBanner({
  displayName,
  role,
  roleLabel,
}: {
  displayName: string;
  role: AppRole;
  roleLabel: string;
}) {
  const isClient = role === "client";

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border bg-surface px-5 py-6 shadow-soft sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary-soft blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 size-64 rounded-full bg-accent-soft blur-3xl" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div>
          <p className="inline-flex rounded-full border border-primary/35 bg-primary-soft px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-charcoal">
            {roleLabel}
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[0.94] text-charcoal sm:text-6xl lg:text-7xl">
            {isClient ? "Tu plan para hoy está listo." : "Tu consulta, organizada con enfoque."}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-warm-brown sm:text-lg">
            Hola, {displayName}.{" "}
            {isClient
              ? "Acá tenés una vista clara de tu nutrición, entrenamiento y próximos pasos."
              : "Acá tenés el pulso de tus clientes, agenda y seguimientos prioritarios."}
          </p>
        </div>

        <div className="rounded-[26px] border border-charcoal/10 bg-background/80 p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
            Enfoque de hoy
          </p>
          <div className="mt-4 flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-charcoal">
              <Sparkles className="size-4" />
            </div>
            <p className="text-sm font-bold leading-6 text-charcoal">
              {isClient
                ? "Cumplí tus básicos: proteína, movimiento y descanso con intención."
                : "Priorizá los casos con cambios recientes antes de abrir nuevos planes."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfessionalDashboard({
  displayName,
  roleLabel,
}: {
  displayName: string;
  roleLabel: string;
}) {
  return (
    <div className="space-y-8">
      <FadeIn>
        <HeroBanner
          displayName={displayName}
          role="professional"
          roleLabel={roleLabel}
        />
      </FadeIn>

      <FadeIn delay={0.08}>
        <section
          id="seguimiento"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Métricas profesionales"
        >
          {professionalStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>
      </FadeIn>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <FadeIn delay={0.12}>
          <section
            id="agenda"
            className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader eyebrow="Agenda" title="Próximas consultas" />
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-sm font-extrabold text-charcoal">
                <Clock3 className="size-4" />
                Hoy
              </span>
            </div>

            <div className="mt-6 divide-y divide-border">
              {professionalAgenda.map((item) => (
                <article
                  key={`${item.time}-${item.name}`}
                  className="grid gap-3 py-4 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center"
                >
                  <p className="font-serif text-2xl font-semibold text-charcoal">
                    {item.time}
                  </p>
                  <div>
                    <h3 className="font-sans text-base font-extrabold text-charcoal">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted">{item.type}</p>
                  </div>
                  <span className="w-fit rounded-full border border-border bg-background px-3 py-1 text-xs font-extrabold text-warm-brown">
                    {item.mode}
                  </span>
                </article>
              ))}
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.16}>
          <section
            id="clientes"
            className="rounded-[28px] border border-border bg-accent-soft p-5 shadow-soft sm:p-6"
          >
            <SectionHeader eyebrow="Clientes" title="Casos para mirar" />
            <div className="mt-6 space-y-4">
              {clientFocus.map((client) => (
                <article
                  key={client.name}
                  className="rounded-[22px] border border-charcoal/10 bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-sans text-base font-extrabold text-charcoal">
                        {client.name}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {client.goal}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold text-charcoal">
                      {client.tag}
                    </span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-surface-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${client.progress}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </FadeIn>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <FadeIn delay={0.2}>
          <section
            id="nutricion"
            className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6"
          >
            <SectionHeader eyebrow="Nutrición" title="Planes en edición" />
            <div className="mt-6 space-y-3">
              {["Rotación antiinflamatoria", "Menú alto en proteína", "Protocolo digestivo"].map(
                (item, index) => (
                  <div
                    key={item}
                    className="flex items-center justify-between gap-4 rounded-[20px] border border-border bg-background px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-full bg-primary-soft text-sm font-extrabold text-charcoal">
                        {index + 1}
                      </div>
                      <p className="font-bold text-charcoal">{item}</p>
                    </div>
                    <ArrowUpRight className="size-4 text-muted" />
                  </div>
                ),
              )}
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.24}>
          <section
            id="entrenamiento"
            className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6"
          >
            <SectionHeader eyebrow="Entrenamiento" title="Seguimientos pendientes" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {professionalTasks.map((task) => (
                <div
                  key={task}
                  className="flex min-h-24 items-start gap-3 rounded-[20px] border border-border bg-background p-4"
                >
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-warm-brown" />
                  <p className="text-sm font-bold leading-6 text-charcoal">{task}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>
      </div>

      <FadeIn delay={0.28}>
        <section
          id="recursos"
          className="rounded-[28px] border border-border bg-primary-soft p-5 shadow-soft sm:p-6"
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
            <div>
              <SectionHeader eyebrow="Biblioteca" title="Material listo para compartir" />
              <p className="mt-3 max-w-2xl leading-7 text-warm-brown">
                Guías de compras, plantillas de hábitos y videos cortos de técnica
                preparados para enviar según el objetivo de cada cliente.
              </p>
            </div>
            <div
              id="mensajes"
              className="rounded-[24px] border border-charcoal/10 bg-surface p-5"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="size-5 text-warm-brown" />
                <p className="font-extrabold text-charcoal">12 mensajes abiertos</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">
                5 requieren ajuste de plan y 3 son reportes post-entrenamiento.
              </p>
            </div>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}

function ClientDashboard({
  displayName,
  roleLabel,
}: {
  displayName: string;
  roleLabel: string;
}) {
  return (
    <div className="space-y-8">
      <FadeIn>
        <HeroBanner displayName={displayName} role="client" roleLabel={roleLabel} />
      </FadeIn>

      <FadeIn delay={0.08}>
        <section
          id="progreso"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Métricas personales"
        >
          {clientStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>
      </FadeIn>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <FadeIn delay={0.12}>
          <section
            id="plan"
            className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader eyebrow="Plan de hoy" title="Tus básicos del día" />
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-extrabold text-charcoal">
                <Leaf className="size-4" />
                En curso
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              {dailyPlan.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[22px] border border-border bg-background p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-sans text-base font-extrabold text-charcoal">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {item.description}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-charcoal">
                      {item.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.16}>
          <section
            id="rutina"
            className="rounded-[28px] border border-border bg-accent-soft p-5 shadow-soft sm:p-6"
          >
            <SectionHeader eyebrow="Entrenamiento" title="Rutina asignada" />
            <div className="mt-6 rounded-[24px] border border-charcoal/10 bg-surface p-5">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-full bg-primary text-charcoal">
                  <Dumbbell className="size-5" />
                </div>
                <div>
                  <h3 className="font-sans text-lg font-extrabold text-charcoal">
                    Fuerza tren inferior
                  </h3>
                  <p className="mt-1 text-sm text-muted">45 min · intensidad media</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  ["4", "series"],
                  ["7", "ejercicios"],
                  ["8/10", "esfuerzo"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-[18px] border border-border bg-background p-3"
                  >
                    <p className="font-serif text-2xl font-semibold text-charcoal">
                      {value}
                    </p>
                    <p className="mt-1 text-xs font-bold text-muted">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <FadeIn delay={0.2}>
          <section
            id="habitos"
            className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6"
          >
            <SectionHeader eyebrow="Hábitos" title="Señales de bienestar" />
            <div className="mt-6 space-y-4">
              {clientProgress.map((item) => (
                <ProgressPill key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.24}>
          <section
            id="citas"
            className="rounded-[28px] border border-border bg-primary-soft p-5 shadow-soft sm:p-6"
          >
            <SectionHeader eyebrow="Acompañamiento" title="Próximos pasos" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: CalendarDays,
                  title: "Consulta con Mariana",
                  detail: "Jueves · 9:00 a. m. · virtual",
                },
                {
                  icon: MessageCircle,
                  title: "Mensaje pendiente",
                  detail: "Enviar registro de digestión de 3 días",
                },
                {
                  icon: HeartPulse,
                  title: "Check-in semanal",
                  detail: "Peso, energía, sueño y hambre",
                },
                {
                  icon: NotebookTabs,
                  title: "Recurso sugerido",
                  detail: "Lista de compras para desayunos altos en proteína",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-[22px] border border-charcoal/10 bg-surface p-4"
                  >
                    <Icon className="size-5 text-warm-brown" />
                    <h3 className="mt-4 font-sans text-base font-extrabold text-charcoal">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
                  </article>
                );
              })}
            </div>
          </section>
        </FadeIn>
      </div>

      <FadeIn delay={0.28}>
        <section
          id="objetivos"
          className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6"
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
            <div>
              <SectionHeader eyebrow="Objetivos" title="Tu enfoque del mes" />
              <p className="mt-3 max-w-2xl leading-7 text-warm-brown">
                Construir constancia sin perfeccionismo: cumplir tus comidas base,
                entrenar tres veces por semana y registrar cómo se siente tu cuerpo.
              </p>
            </div>
            <div
              id="recursos"
              className="rounded-[24px] border border-border bg-background p-5"
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                Recurso destacado
              </p>
              <p className="mt-3 font-extrabold leading-6 text-charcoal">
                Guía rápida para armar platos con proteína, fibra y color.
              </p>
            </div>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}

export default async function DashboardPage() {
  const { profile: databaseProfile, user } = await requireUserContext();
  const profile = getAppUserProfile(user, databaseProfile);
  const role = profile.role;
  const roleLabel = role === "client" ? "Cliente" : profile.roleLabel;

  return (
    <div
      className={cn(
        "relative min-h-dvh overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        "bg-[radial-gradient(circle_at_top_right,var(--primary-soft),transparent_30rem)]",
      )}
    >
      <div className="mx-auto max-w-7xl">
        {role === "client" ? (
          <ClientDashboard
            displayName={profile.displayName}
            roleLabel={roleLabel}
          />
        ) : (
          <ProfessionalDashboard
            displayName={profile.displayName}
            roleLabel={roleLabel}
          />
        )}
      </div>
    </div>
  );
}
