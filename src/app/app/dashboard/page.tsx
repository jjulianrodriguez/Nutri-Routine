import {
  ArrowRight,
  CalendarDays,
  Dumbbell,
  Leaf,
  NotebookTabs,
  Play,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { FadeIn } from "@/components/motion/fade-in";
import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import {
  getDashboardData,
  type AppRecordSummary,
  type DashboardData,
} from "@/lib/app/dashboard-data";

function RecordList({
  empty,
  records,
}: {
  empty: string;
  records: AppRecordSummary[];
}) {
  if (records.length === 0) {
    return <EmptyState>{empty}</EmptyState>;
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <article
          key={record.id}
          className="rounded-[20px] border border-border bg-background px-4 py-3"
        >
          <h3 className="font-bold text-charcoal">{record.title}</h3>
          {record.detail ? (
            <p className="mt-1 text-sm text-muted">{record.detail}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function TrainingActionCard({
  record,
}: {
  record: AppRecordSummary | null;
}) {
  if (!record) {
    return (
      <EmptyState>
        No hay una plantilla visible por ahora. Cuando tu entrenador la asigne,
        podras empezar desde aqui.
      </EmptyState>
    );
  }

  return (
    <Link
      href="/app/entrenamiento"
      className="group block rounded-[22px] border border-primary/30 bg-primary-soft/65 p-5 transition hover:border-primary/60 hover:shadow-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-extrabold text-charcoal">
            <Play className="size-3.5" aria-hidden="true" />
            Entrenamiento de hoy
          </span>
          <h3 className="mt-4 text-xl font-semibold text-charcoal">
            {record.title}
          </h3>
          {record.detail ? (
            <p className="mt-2 text-sm leading-6 text-muted">
              {record.detail}
            </p>
          ) : null}
        </div>
        <ArrowRight
          className="mt-1 size-5 shrink-0 text-warm-brown transition group-hover:translate-x-1 group-hover:text-charcoal"
          aria-hidden="true"
        />
      </div>
      <span className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-warm-brown transition group-hover:text-charcoal">
        Empezar entrenamiento de hoy
        <ArrowRight className="size-4" aria-hidden="true" />
      </span>
    </Link>
  );
}

function QuickLink({
  description,
  href,
  icon: Icon,
  label,
}: {
  description: string;
  href: string;
  icon: typeof Leaf;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[22px] border border-border bg-background p-4 transition hover:border-primary/40 hover:bg-primary-soft"
    >
      <Icon className="size-5 text-warm-brown transition group-hover:text-charcoal" />
      <h3 className="mt-4 font-extrabold text-charcoal">{label}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </Link>
  );
}

function ServicesSummary({ access }: { access: CurrentUserAccess }) {
  const services = [
    access.hasNutritionService ? "Nutricion" : null,
    access.hasTrainingService ? "Entrenamiento" : null,
  ].filter(Boolean);
  const description = access.hasTrainingService && !access.hasNutritionService
    ? "Tu plan de entrenamiento esta activo y esta vista se enfoca en tu avance."
    : access.hasNutritionService && !access.hasTrainingService
      ? "Tu plan de nutricion esta activo y esta vista se enfoca en tu seguimiento."
      : "Tus secciones activas aparecen segun los servicios asignados a tu cuenta.";

  return (
    <AppPanel
      title="Resumen personal"
      description={description}
      tone="primary"
    >
      {services.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <span
              key={service}
              className="rounded-full bg-surface px-4 py-2 text-sm font-extrabold text-charcoal"
            >
              {service}
            </span>
          ))}
        </div>
      ) : (
        <EmptyState>
          Todavia no tenes servicios asignados. Cuando un profesional active tu
          plan, aparecera aqui y en tu sidebar.
        </EmptyState>
      )}
    </AppPanel>
  );
}

function getClientDashboardDescription(access: CurrentUserAccess) {
  if (access.canViewTraining && !access.canViewNutrition) {
    return "Tu plan de entrenamiento esta activo. Aqui veras tu entrenamiento actual, recursos y recordatorios.";
  }

  if (access.canViewNutrition && !access.canViewTraining) {
    return "Tu plan de nutricion esta activo. Aqui veras tu plan actual, recursos y recordatorios.";
  }

  return "Aqui veras tus planes activos, recursos y recordatorios en un solo lugar.";
}

function ClientDashboard({
  access,
  data,
}: {
  access: CurrentUserAccess;
  data: DashboardData;
}) {
  const activeServices = [
    access.hasNutritionService,
    access.hasTrainingService,
  ].filter(Boolean).length;

  return (
    <>
      <FadeIn>
        <AppHeader
          eyebrow={access.roleLabel}
          title={`Hola, ${access.displayName}. Tu panel esta listo.`}
          description={getClientDashboardDescription(access)}
        />
      </FadeIn>

      <FadeIn delay={0.06}>
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Metricas personales"
        >
          <StatTile
            label="Servicios activos"
            value={String(activeServices)}
            detail="Segun los servicios de tu cuenta"
          />
          {access.canViewNutrition ? (
            <StatTile
              label="Planes de nutricion"
              value={String(data.dietPlansCount)}
              detail="Visibles para tu cuenta"
            />
          ) : null}
          {access.canViewTraining ? (
            <StatTile
              label="Plantillas"
              value={String(data.workoutPlansCount)}
              detail="Visibles para tu cuenta"
            />
          ) : null}
          <StatTile
            label="Recursos"
            value={String(data.resourcesCount)}
            detail="Disponibles en tu biblioteca"
          />
        </section>
      </FadeIn>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <FadeIn delay={0.1}>
          <ServicesSummary access={access} />
        </FadeIn>

        <FadeIn delay={0.14}>
          <AppPanel
            title="Progreso"
            description="Consulta tus avances en un espacio separado de las areas de nutricion y entrenamiento."
          >
            <Link
              href="/app/progreso"
              className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-extrabold text-charcoal"
            >
              Ver mi progreso
            </Link>
          </AppPanel>
        </FadeIn>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {access.canViewNutrition ? (
          <FadeIn delay={0.18}>
            <AppPanel
              title="Plan nutricional activo"
              description="Plan alimenticio actual e historial de planes."
            >
              <RecordList
                empty="No hay un plan alimenticio visible por ahora."
                records={data.currentDietPlan ? [data.currentDietPlan] : []}
              />
            </AppPanel>
          </FadeIn>
        ) : null}

        {access.canViewTraining ? (
          <FadeIn delay={0.22}>
            <AppPanel
              title="Tu entrenamiento actual"
              description="Hoy te toca revisar la plantilla asignada por tu entrenador."
              tone="accent"
            >
              <TrainingActionCard record={data.currentWorkoutPlan} />
            </AppPanel>
          </FadeIn>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <FadeIn delay={0.26}>
          <AppPanel
            title="Recursos recientes"
            description="Material compartido para tus servicios activos."
          >
            <RecordList
              empty="No hay recursos recientes visibles para tu cuenta."
              records={data.recentResources}
            />
          </AppPanel>
        </FadeIn>

        <FadeIn delay={0.3}>
          <AppPanel
            title="Citas y recordatorios"
            description="Accede a tus proximas citas y recordatorios desde el calendario."
            tone="primary"
          >
            <div className="grid gap-3">
              <QuickLink
                description="Ver proximas citas y recordatorios."
                href="/app/calendario"
                icon={CalendarDays}
                label="Calendario"
              />
            </div>
          </AppPanel>
        </FadeIn>
      </div>
    </>
  );
}

function AdminDashboard({
  access,
  data,
}: {
  access: CurrentUserAccess;
  data: DashboardData;
}) {
  const quickLinks = [
    access.canManageNutrition
      ? {
          description: "Clientes, dietas, planes alimenticios y recursos.",
          href: "/app/nutricion",
          icon: Leaf,
          label: "Nutricion",
        }
      : null,
    access.canManageTraining
      ? {
          description:
            "Clientes, entrenamientos, plantillas y recursos.",
          href: "/app/entrenamiento",
          icon: Dumbbell,
          label: "Entrenamiento",
        }
      : null,
    access.canManageClientPlans
      ? {
          description: "Usuarios registrados y activacion de planes.",
          href: "/app/clientes",
          icon: Users,
          label: "Usuarios y planes",
        }
      : null,
    {
      description: "Biblioteca compartida y materiales enviados.",
      href: "/app/recursos",
      icon: NotebookTabs,
      label: "Recursos",
    },
  ].filter(Boolean) as Array<{
    description: string;
    href: string;
    icon: typeof Leaf;
    label: string;
  }>;

  return (
    <>
      <FadeIn>
        <AppHeader
          eyebrow={access.roleLabel}
          title={`Hola, ${access.displayName}. Tu gestion esta organizada por area.`}
          description="Esta vista reune clientes, planes y accesos segun tu area profesional."
        />
      </FadeIn>

      <FadeIn delay={0.06}>
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Metricas administrativas"
        >
          <StatTile
            label="Clientes asignados"
            value={String(data.assignedClientsCount)}
            detail="Segun tus clientes asignados"
          />
          {access.canManageNutrition ? (
            <StatTile
              label="Planes alimenticios"
              value={String(data.dietPlansCount)}
              detail="Disponibles segun tu area profesional"
            />
          ) : null}
          {access.canManageTraining ? (
            <StatTile
              label="Planes de entrenamiento"
              value={String(data.workoutPlansCount)}
              detail="Disponibles segun tu area profesional"
            />
          ) : null}
          <StatTile
            label="Recursos enviados"
            value={String(data.resourcesCount)}
            detail="Disponibles segun tus permisos"
          />
        </section>
      </FadeIn>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <FadeIn delay={0.1}>
          <AppPanel
            title="Accesos rapidos"
            description="Solo aparecen las secciones disponibles para tu area profesional."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {quickLinks.map((link) => (
                <QuickLink key={link.href} {...link} />
              ))}
            </div>
          </AppPanel>
        </FadeIn>

        <FadeIn delay={0.14}>
          <AppPanel
            title="Actividad reciente"
            description="Ultimos recursos compartidos y actividad disponible para tu cuenta."
            tone="accent"
          >
            <RecordList
              empty="No hay actividad reciente visible para tu cuenta."
              records={data.recentResources}
            />
          </AppPanel>
        </FadeIn>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <FadeIn delay={0.18}>
          <AppPanel
            title="Calendario"
            description="Consultas, recordatorios y agenda compartida."
          >
            <QuickLink
              description="Abrir calendario administrativo."
              href="/app/calendario"
              icon={CalendarDays}
              label="Ver calendario"
            />
          </AppPanel>
        </FadeIn>

        <FadeIn delay={0.22}>
          <AppPanel
            title="Configuracion"
            description="Perfil, cuenta y preferencias personales."
          >
            <QuickLink
              description="Administrar tu configuracion."
              href="/app/configuracion"
              icon={Settings}
              label="Configurar"
            />
          </AppPanel>
        </FadeIn>
      </div>
    </>
  );
}

export default async function DashboardPage() {
  const access = await requireRouteAccess("/app/dashboard");
  const data = await getDashboardData(access);

  return (
    <AppScreen>
      {access.isClient ? (
        <ClientDashboard access={access} data={data} />
      ) : (
        <AdminDashboard access={access} data={data} />
      )}
    </AppScreen>
  );
}
