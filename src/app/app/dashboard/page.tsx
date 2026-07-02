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
import {
  AssignedProfessionalCards,
  RelationshipBadge,
} from "@/components/app/relationship-badges";
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
  trainerName,
}: {
  record: AppRecordSummary | null;
  trainerName: string | null;
}) {
  if (!record) {
    return (
      <EmptyState>
        No hay una plantilla visible por ahora. Cuando{" "}
        {trainerName ?? "tu profesional de entrenamiento"} la asigne, podras
        empezar desde aquí.
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
    access.hasNutritionService ? "Nutrición" : null,
    access.hasTrainingService ? "Entrenamiento" : null,
  ].filter(Boolean);
  const description = access.hasTrainingService && !access.hasNutritionService
    ? "Tu plan de entrenamiento esta activo y esta vista se enfoca en tu avance."
    : access.hasNutritionService && !access.hasTrainingService
      ? "Tu plan de nutrición está activo y esta vista se enfoca en tu seguimiento."
      : "Tus secciones activas aparecen según los servicios asignados a tu cuenta.";

  return (
    <AppPanel
      title="Resumen personal"
      description={description}
      tone="primary"
    >
      {services.length > 0 ? (
        <div className="space-y-4">
          <AssignedProfessionalCards
            assignedNutritionistId={access.assignedNutritionistId}
            assignedNutritionistName={access.assignedNutritionistName}
            assignedTrainerId={access.assignedTrainerId}
            assignedTrainerName={access.assignedTrainerName}
          />
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <RelationshipBadge
                key={service}
                className="px-3 py-1.5 text-sm"
                tone="neutral"
              >
                {service}
              </RelationshipBadge>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState>
          Todavia no tenes servicios asignados. Cuando un profesional active tu
          plan, aparecerá aquí y en tu sidebar.
        </EmptyState>
      )}
    </AppPanel>
  );
}

function getClientDashboardDescription(access: CurrentUserAccess) {
  if (access.canViewTraining && !access.canViewNutrition) {
    return "Tu plan de entrenamiento está activo. Aquí verás tu entrenamiento actual, recursos y recordatorios.";
  }

  if (access.canViewNutrition && !access.canViewTraining) {
    return "Tu plan de nutrición está activo. Aquí verás tu plan actual, recursos y recordatorios.";
  }

  return "Aquí verás tus planes activos, recursos y recordatorios en un solo lugar.";
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
          className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Metricas personales"
        >
          <StatTile
            label="Servicios activos"
            value={String(activeServices)}
            detail="Segun los servicios de tu cuenta"
          />
          {access.canViewNutrition ? (
            <StatTile
              label="Planes de nutrición"
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

      <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <FadeIn delay={0.1}>
          <ServicesSummary access={access} />
        </FadeIn>

        <FadeIn delay={0.14}>
          <AppPanel
            title="Progreso"
            description="Consulta tus avances en un espacio separado de las áreas de nutrición y entrenamiento."
            tone="warm"
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

      <div className="grid items-start gap-6 xl:grid-cols-2">
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
              description={`Hoy te toca revisar la plantilla asignada por ${
                access.assignedTrainerName ?? "tu profesional de entrenamiento"
              }.`}
              tone="accent"
            >
              <TrainingActionCard
                record={data.currentWorkoutPlan}
                trainerName={access.assignedTrainerName}
              />
            </AppPanel>
          </FadeIn>
        ) : null}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
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
            description="Accede a tus próximas citas y recordatorios desde el calendario."
            tone="primary"
          >
            <div className="grid gap-3">
              <QuickLink
                description="Ver próximas citas y recordatorios."
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
          label: "Nutrición",
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
          title={`Hola, ${access.displayName}. Tu gestión está organizada por área.`}
          description={
            access.isAdmin
              ? "Esta vista reúne clientes, planes y accesos de toda la operación."
              : "Esta vista reúne clientes, planes y accesos según tu área profesional."
          }
        />
      </FadeIn>

      <FadeIn delay={0.06}>
        <section
          className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Metricas administrativas"
        >
          <StatTile
            label={access.isAdmin ? "Clientes gestionables" : "Clientes asignados"}
            value={String(data.assignedClientsCount)}
            detail={
              access.isAdmin
                ? "Acceso universal de administración"
                : "Según tus clientes asignados"
            }
          />
          {access.canManageNutrition ? (
            <StatTile
              label="Planes alimenticios"
              value={String(data.dietPlansCount)}
              detail="Disponibles según tu área profesional"
            />
          ) : null}
          {access.canManageTraining ? (
            <StatTile
              label="Planes de entrenamiento"
              value={String(data.workoutPlansCount)}
              detail="Disponibles según tu área profesional"
            />
          ) : null}
          <StatTile
            label="Recursos enviados"
            value={String(data.resourcesCount)}
            detail="Disponibles segun tus permisos"
          />
        </section>
      </FadeIn>

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_0.9fr]">
        <FadeIn delay={0.1}>
          <AppPanel
            title="Accesos rapidos"
            description="Solo aparecen las secciones disponibles para tu área profesional."
          >
            <div className="grid items-start gap-3 sm:grid-cols-2">
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

      <div className="grid items-start gap-6 xl:grid-cols-2">
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
            title="Configuración"
            description="Perfil, cuenta y preferencias personales."
          >
            <QuickLink
              description="Administrar tu configuración."
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
