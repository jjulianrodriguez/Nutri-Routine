import {
  CalendarDays,
  Dumbbell,
  Leaf,
  NotebookTabs,
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

  return (
    <AppPanel
      title="Resumen personal"
      description="Tus secciones se activan segun los profesionales asignados en Supabase."
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
          Todavia no tenes servicios asignados. Cuando se asigne nutricion o
          entrenamiento, apareceran aca y en tu sidebar.
        </EmptyState>
      )}
    </AppPanel>
  );
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
          title={`Hola, ${access.displayName}. Tu dashboard esta listo.`}
          description="Esta vista muestra solo las areas que tenes asignadas: nutricion, entrenamiento o ambas."
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
            detail="Definidos por client_profiles"
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
              label="Rutinas"
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
            description="Tu progreso vive separado de los modulos clinicos para que puedas seguir tus avances sin ver herramientas administrativas."
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
              title="Rutina activa"
              description="Rutina actual e historial de entrenamiento."
              tone="accent"
            >
              <RecordList
                empty="No hay una rutina visible por ahora."
                records={data.currentWorkoutPlan ? [data.currentWorkoutPlan] : []}
              />
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
          label: "Modulo de nutricion",
        }
      : null,
    access.canManageTraining
      ? {
          description: "Clientes, rutinas, planes de entrenamiento y recursos.",
          href: "/app/entrenamiento",
          icon: Dumbbell,
          label: "Modulo de entrenamiento",
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
          description="Esta vista muestra clientes, planes y accesos administrativos segun la especialidad cargada en professional_profiles."
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
            detail="Segun client_profiles"
          />
          {access.canManageNutrition ? (
            <StatTile
              label="Planes alimenticios"
              value={String(data.dietPlansCount)}
              detail="Visibles para tu rol"
            />
          ) : null}
          {access.canManageTraining ? (
            <StatTile
              label="Planes de entrenamiento"
              value={String(data.workoutPlansCount)}
              detail="Visibles para tu rol"
            />
          ) : null}
          <StatTile
            label="Recursos enviados"
            value={String(data.resourcesCount)}
            detail="Disponibles por RLS"
          />
        </section>
      </FadeIn>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <FadeIn delay={0.1}>
          <AppPanel
            title="Accesos rapidos"
            description="Solo aparecen los modulos permitidos por tu especialidad."
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
            description="Ultimos recursos compartidos y movimientos visibles para tu rol."
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
            description="Perfil, cuenta y preferencias internas."
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
