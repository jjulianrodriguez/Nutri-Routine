import {
 Activity,
 ArrowRight,
 Bell,
 CalendarClock,
 CheckCircle2,
 ClipboardCheck,
 Dumbbell,
 Leaf,
 NotebookTabs,
 Users,
 type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import {
 AssignedProfessionalCards,
 RelationshipBadge,
} from "@/components/app/shared/relationship-badges";
import {
 AppHeader,
 AppPanel,
 AppScreen,
 StatTile,
} from "@/components/app/layouts/AppScreen";
import { Button } from "@/components/ui/actions/button";
import { EmptyState } from "@/components/ui/feedback/state-block";
import { FadeIn } from "@/components/ui/utilities/fade-in";
import {
 getDashboardData,
 type AppRecordSummary,
 type DashboardData,
 type SectionRecord,
} from "@/lib/app/dashboard-data";
import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getNutritionHabitTrackerData } from "@/lib/habits/data";
import type { HabitWeekStats } from "@/lib/habits/utils";
import type { AppNotification } from "@/lib/notifications/data";

function ActionLink({
 href,
 label,
}: {
 href: string;
 label: string;
}) {
 return (
 <Button asChild variant="outline" size="sm">
 <Link href={href}>
 {label}
 <ArrowRight className="size-4" aria-hidden="true" />
 </Link>
 </Button>
 );
}

function RecordList({
 actionHref,
 actionLabel,
 empty,
 icon: Icon,
 records,
}: {
 actionHref: string;
 actionLabel: string;
 empty: string;
 icon: LucideIcon;
 records: SectionRecord[] | AppRecordSummary[];
}) {
 return (
 <div className="space-y-4">
 {records.length > 0 ? (
 <div className="divide-y divide-border-subtle">
 {records.map((record) => (
 <article key={record.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
 <span className="grid size-9 shrink-0 place-items-center rounded-full bg-background text-muted-foreground">
 <Icon className="size-4" aria-hidden="true" />
 </span>
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-start justify-between gap-2">
 <h3 className="font-extrabold text-foreground">{record.title}</h3>
 {"meta" in record && record.meta ? (
 <RelationshipBadge tone="neutral">{record.meta}</RelationshipBadge>
 ) : null}
 </div>
 {record.detail ? (
 <p className="mt-1 text-sm leading-6 text-muted">{record.detail}</p>
 ) : null}
 </div>
 </article>
 ))}
 </div>
 ) : (
 <EmptyState>{empty}</EmptyState>
 )}
 <ActionLink href={actionHref} label={actionLabel} />
 </div>
 );
}

function NotificationList({
 empty,
 notifications,
}: {
 empty: string;
 notifications: AppNotification[];
}) {
 if (notifications.length === 0) {
 return (
 <div className="space-y-4">
 <EmptyState>{empty}</EmptyState>
 <ActionLink href="/app/notificaciones" label="Ver notificaciones" />
 </div>
 );
 }

 return (
 <div className="space-y-4">
 <div className="divide-y divide-border-subtle">
 {notifications.map((notification) => (
 <Link
 key={notification.id}
 href={
 notification.destination_path.startsWith("/app/")
 ? notification.destination_path
 : "/app/notificaciones"
 }
 className="group flex items-start gap-3 py-3 outline-none first:pt-0 last:pb-0 focus-visible:rounded-control focus-visible:ring-3 focus-visible:ring-focus-ring/25"
 >
 <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-background text-muted-foreground transition-colors group-hover:bg-primary-soft group-hover:text-foreground">
 <Bell className="size-4" aria-hidden="true" />
 {notification.groupUnreadCount > 0 ? (
 <span className="absolute right-0 top-0 size-2.5 rounded-full border-2 border-surface bg-primary" aria-hidden="true" />
 ) : null}
 </span>
 <span className="min-w-0 flex-1">
 <span className="block text-sm font-bold leading-6 text-foreground">
 {notification.message}
 </span>
 <span className="mt-1 block text-xs font-semibold text-muted">
 {notification.createdRelativeLabel}
 {notification.groupCount > 1 ? ` · ${notification.groupCount} eventos` : ""}
 </span>
 </span>
 </Link>
 ))}
 </div>
 <ActionLink href="/app/notificaciones" label="Ver todas" />
 </div>
 );
}

function PlanCard({
 actionHref,
 actionLabel,
 empty,
 icon: Icon,
 label,
 record,
}: {
 actionHref: string;
 actionLabel: string;
 empty: string;
 icon: LucideIcon;
 label: string;
 record: AppRecordSummary | null;
}) {
 return (
 <article className="h-full rounded-[20px] bg-background p-4 sm:p-5">
 <div className="flex items-start gap-3">
 <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-foreground">
 <Icon className="size-5" aria-hidden="true" />
 </span>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
 {label}
 </p>
 {record ? (
 <>
 <h3 className="mt-2 text-lg font-extrabold text-foreground">{record.title}</h3>
 {record.detail ? (
 <p className="mt-1 text-sm leading-6 text-muted">{record.detail}</p>
 ) : null}
 </>
 ) : (
 <p className="mt-2 text-sm font-semibold leading-6 text-muted">{empty}</p>
 )}
 </div>
 </div>
 <div className="mt-4">
 <ActionLink href={actionHref} label={actionLabel} />
 </div>
 </article>
 );
}

function HabitSummary({ stats }: { stats: HabitWeekStats }) {
 const hasHabits = stats.total > 0;

 return (
 <div className="space-y-4">
 <div className="rounded-[20px] bg-background p-5">
 <div className="flex items-end justify-between gap-4">
 <div>
 <p className="text-sm font-bold text-muted">Adherencia semanal</p>
 <p className="mt-2 font-heading text-4xl font-bold text-foreground">
 {hasHabits ? `${stats.percentage}%` : "—"}
 </p>
 </div>
 <CheckCircle2 className="size-6 text-muted-foreground" aria-hidden="true" />
 </div>
 <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
 <div
 className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none"
 style={{ width: `${hasHabits ? stats.percentage : 0}%` }}
 />
 </div>
 <p className="mt-3 text-sm font-semibold text-muted">
 {hasHabits
 ? `${stats.completed} completados · ${stats.pending} pendientes esta semana`
 : "Todavía no hay hábitos programados para esta semana."}
 </p>
 </div>
 <ActionLink href="/app/nutricion/habitos" label="Revisar mis hábitos" />
 </div>
 );
}

function ClientDashboard({
 access,
 data,
 habitStats,
}: {
 access: CurrentUserAccess;
 data: DashboardData;
 habitStats: HabitWeekStats | null;
}) {
 const firstMetric = habitStats
 ? {
 detail: habitStats.total > 0
 ? `${habitStats.completed} de ${habitStats.total} completados`
 : "Sin hábitos programados",
 label: "Hábitos esta semana",
 value: habitStats.total > 0 ? `${habitStats.percentage}%` : "—",
 }
 : {
 detail: data.currentWorkoutPlan ? "Lista para continuar" : "Sin rutina asignada",
 label: "Rutina actual",
 value: data.currentWorkoutPlan ? "Lista" : "—",
 };

 return (
 <>
 <FadeIn>
 <AppHeader
 eyebrow="Tu resumen"
 title={`Hola, ${access.displayName}`}
 description="Revisa lo importante de tus planes, tu progreso y tus próximas actividades sin salir de esta pantalla."
 />
 </FadeIn>

 <FadeIn delay={0.05}>
 <section className="grid grid-cols-2 items-start gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Resumen personal">
 <StatTile {...firstMetric} />
 <StatTile
 label="Progreso registrado"
 value={String(data.recentProgress.count)}
 detail="Mediciones disponibles en tu historial"
 />
 <StatTile
 label="Próximos eventos"
 value={String(data.upcomingEvents.count)}
 detail="Citas y recordatorios programados"
 />
 <StatTile
 label="Avisos sin leer"
 value={String(data.unreadNotificationCount)}
 detail={data.unreadNotificationCount > 0 ? "Requieren tu atención" : "Todo está al día"}
 />
 </section>
 </FadeIn>

 <FadeIn delay={0.1}>
 <AppPanel
 title="Tus planes actuales"
 description="Accede directamente a lo que tienes asignado en cada área activa."
 tone="primary"
 >
 <div className="grid items-stretch gap-4 lg:grid-cols-2">
 {access.canViewNutrition ? (
 <PlanCard
 actionHref="/app/nutricion"
 actionLabel="Abrir nutrición"
 empty="Tu plan nutricional aparecerá aquí cuando esté disponible."
 icon={Leaf}
 label="Plan nutricional"
 record={data.currentDietPlan}
 />
 ) : null}
 {access.canViewTraining ? (
 <PlanCard
 actionHref="/app/entrenamiento"
 actionLabel="Ir a mi entrenamiento"
 empty="Tu rutina aparecerá aquí cuando esté disponible."
 icon={Dumbbell}
 label="Rutina de entrenamiento"
 record={data.currentWorkoutPlan}
 />
 ) : null}
 </div>
 </AppPanel>
 </FadeIn>

 <div className="grid items-start gap-6 xl:grid-cols-[1.05fr_0.95fr]">
 <FadeIn delay={0.14}>
 <AppPanel
 title="Lo próximo"
 description="Tus siguientes citas, seguimientos y recordatorios programados."
 >
 <RecordList
 actionHref="/app/calendario"
 actionLabel="Abrir calendario"
 empty="No tienes actividades próximas programadas."
 icon={CalendarClock}
 records={data.upcomingEvents.records}
 />
 </AppPanel>
 </FadeIn>

 <FadeIn delay={0.18}>
 <AppPanel
 title="Avisos importantes"
 description="Cambios recientes en tus planes, citas, mensajes y recursos."
 tone="warm"
 >
 <NotificationList
 empty="No hay avisos recientes. Estás al día."
 notifications={data.notifications}
 />
 </AppPanel>
 </FadeIn>
 </div>

 <div className="grid items-start gap-6 xl:grid-cols-2">
 {habitStats ? (
 <FadeIn delay={0.22}>
 <AppPanel
 title="Tus hábitos"
 description="Una lectura sencilla de tu constancia durante la semana actual."
 tone="accent"
 >
 <HabitSummary stats={habitStats} />
 </AppPanel>
 </FadeIn>
 ) : null}

 <FadeIn delay={0.26}>
 <AppPanel
 title="Progreso reciente"
 description="Tus últimas mediciones y registros para entender cómo vas."
 >
 <RecordList
 actionHref="/app/progreso"
 actionLabel="Ver mi progreso"
 empty="Todavía no hay mediciones registradas."
 icon={Activity}
 records={data.recentProgress.records}
 />
 </AppPanel>
 </FadeIn>
 </div>

 <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
 <FadeIn delay={0.3}>
 <AppPanel
 title="Tu equipo profesional"
 description="Profesionales responsables de tus áreas activas."
 >
 <AssignedProfessionalCards
 assignedNutritionistId={access.assignedNutritionistId}
 assignedNutritionistName={access.assignedNutritionistName}
 assignedTrainerId={access.assignedTrainerId}
 assignedTrainerName={access.assignedTrainerName}
 />
 </AppPanel>
 </FadeIn>

 <FadeIn delay={0.34}>
 <AppPanel
 title="Material reciente"
 description="Recursos compartidos para acompañar tus planes."
 >
 <RecordList
 actionHref="/app/recursos"
 actionLabel="Ver recursos"
 empty="No hay material reciente disponible."
 icon={NotebookTabs}
 records={data.recentResources}
 />
 </AppPanel>
 </FadeIn>
 </div>
 </>
 );
}

function PriorityCard({
 description,
 href,
 icon: Icon,
 label,
 value,
}: {
 description: string;
 href: string;
 icon: LucideIcon;
 label: string;
 value: string;
}) {
 return (
 <Link
 href={href}
 className="group flex min-h-28 items-start gap-4 rounded-[20px] bg-background p-4 outline-none transition-colors hover:bg-surface-muted focus-visible:ring-3 focus-visible:ring-focus-ring/25"
 >
 <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-foreground">
 <Icon className="size-5" aria-hidden="true" />
 </span>
 <span className="min-w-0 flex-1">
 <span className="flex items-start justify-between gap-3">
 <span className="font-extrabold text-foreground">{label}</span>
 <span className="font-heading text-2xl font-bold text-foreground">{value}</span>
 </span>
 <span className="mt-2 block text-sm leading-6 text-muted">{description}</span>
 </span>
 </Link>
 );
}

function ProfessionalDashboard({
 access,
 data,
}: {
 access: CurrentUserAccess;
 data: DashboardData;
}) {
 const planCount =
 (access.canManageNutrition ? data.dietPlansCount : 0) +
 (access.canManageTraining ? data.workoutPlansCount : 0);

 return (
 <>
 <FadeIn>
 <AppHeader
 eyebrow={access.isAdmin ? "Vista administrativa" : "Vista profesional"}
 title={`Hola, ${access.displayName}`}
 description="Consulta carga de clientes, pendientes y actividad reciente para decidir dónde enfocar tu atención."
 />
 </FadeIn>

 <FadeIn delay={0.05}>
 <section className="grid grid-cols-2 items-start gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Resumen profesional">
 <StatTile
 label={access.isAdmin ? "Clientes visibles" : "Clientes activos"}
 value={String(data.assignedClientsCount)}
 detail={access.isAdmin ? "Cuentas disponibles para gestión" : "Asignados a tus áreas"}
 />
 <StatTile
 label="Planes activos"
 value={String(planCount)}
 detail="Nutrición y entrenamiento según tu rol"
 />
 <StatTile
 label="Próximos eventos"
 value={String(data.upcomingEvents.count)}
 detail="Citas y seguimientos programados"
 />
 <StatTile
 label="Avisos sin leer"
 value={String(data.unreadNotificationCount)}
 detail={data.unreadNotificationCount > 0 ? "Pendientes de revisión" : "Todo está al día"}
 />
 </section>
 </FadeIn>

 <FadeIn delay={0.1}>
 <AppPanel
 title="Atención pendiente"
 description="Acciones concretas que pueden requerir seguimiento hoy."
 tone="primary"
 >
 <div className="grid gap-4 md:grid-cols-2">
 <PriorityCard
 description="Revisa citas, recordatorios y seguimientos próximos."
 href="/app/calendario"
 icon={CalendarClock}
 label="Agenda próxima"
 value={String(data.upcomingEvents.count)}
 />
 <PriorityCard
 description="Consulta cambios de planes, asignaciones y mensajes."
 href="/app/notificaciones"
 icon={Bell}
 label="Notificaciones"
 value={String(data.unreadNotificationCount)}
 />
 </div>
 </AppPanel>
 </FadeIn>

 <div className="grid items-start gap-6 xl:grid-cols-[1.05fr_0.95fr]">
 <FadeIn delay={0.14}>
 <AppPanel
 title="Próximos eventos"
 description="Agenda inmediata visible de acuerdo con tu rol y asignaciones."
 >
 <RecordList
 actionHref="/app/calendario"
 actionLabel="Gestionar calendario"
 empty="No hay citas ni seguimientos próximos."
 icon={CalendarClock}
 records={data.upcomingEvents.records}
 />
 </AppPanel>
 </FadeIn>

 <FadeIn delay={0.18}>
 <AppPanel
 title="Actividad que requiere revisión"
 description="Los avisos más recientes de clientes, planes y operación."
 tone="warm"
 >
 <NotificationList
 empty="No hay avisos recientes pendientes."
 notifications={data.notifications}
 />
 </AppPanel>
 </FadeIn>
 </div>

 <div className="grid items-start gap-6 xl:grid-cols-2">
 <FadeIn delay={0.22}>
 <AppPanel
 title="Seguimiento reciente"
 description="Últimos registros de progreso visibles para tu área."
 >
 <RecordList
 actionHref="/app/progreso"
 actionLabel="Abrir seguimiento"
 empty="No hay registros recientes de progreso."
 icon={Activity}
 records={data.recentProgress.records}
 />
 </AppPanel>
 </FadeIn>

 <FadeIn delay={0.26}>
 <AppPanel
 title="Asignaciones y recursos"
 description="Una lectura rápida de la carga operativa disponible."
 tone="accent"
 >
 <div className="grid gap-3 sm:grid-cols-2">
 {access.canManageNutrition ? (
 <PriorityCard
 description="Planes nutricionales activos visibles."
 href="/app/nutricion"
 icon={Leaf}
 label="Nutrición"
 value={String(data.dietPlansCount)}
 />
 ) : null}
 {access.canManageTraining ? (
 <PriorityCard
 description="Planes de entrenamiento visibles."
 href="/app/entrenamiento"
 icon={Dumbbell}
 label="Entrenamiento"
 value={String(data.workoutPlansCount)}
 />
 ) : null}
 <PriorityCard
 description="Material disponible para clientes."
 href="/app/recursos"
 icon={NotebookTabs}
 label="Recursos"
 value={String(data.resourcesCount)}
 />
 </div>
 </AppPanel>
 </FadeIn>
 </div>

 <FadeIn delay={0.3}>
 <AppPanel
 title="Accesos de trabajo"
 description="Continúa directamente en las áreas que usas con más frecuencia."
 >
 <div className="flex flex-wrap gap-3">
 {access.canManageClientPlans ? (
 <Button asChild>
 <Link href="/app/clientes">
 <Users className="size-4" aria-hidden="true" />
 Gestionar clientes
 </Link>
 </Button>
 ) : null}
 <Button asChild variant="outline">
 <Link href="/app/calendario">
 <CalendarClock className="size-4" aria-hidden="true" />
 Abrir calendario
 </Link>
 </Button>
 <Button asChild variant="outline">
 <Link href="/app/progreso">
 <ClipboardCheck className="size-4" aria-hidden="true" />
 Revisar progreso
 </Link>
 </Button>
 </div>
 </AppPanel>
 </FadeIn>
 </>
 );
}

export default async function DashboardPage() {
 const access = await requireRouteAccess("/app/dashboard");
 const [data, habitData] = await Promise.all([
 getDashboardData(access),
 access.isClient && access.canViewNutrition
 ? getNutritionHabitTrackerData(access)
 : Promise.resolve(null),
 ]);

 return (
 <AppScreen>
 {access.isClient ? (
 <ClientDashboard
 access={access}
 data={data}
 habitStats={habitData?.stats ?? null}
 />
 ) : (
 <ProfessionalDashboard access={access} data={data} />
 )}
 </AppScreen>
 );
}
