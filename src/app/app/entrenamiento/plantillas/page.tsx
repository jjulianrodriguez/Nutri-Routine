import {
 ArrowRight,
 CalendarClock,
 CalendarDays,
 Plus,
 UserRound,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
 AppHeader,
 AppPanel,
 AppScreen,
 StatTile,
} from "@/components/app/layouts/AppScreen";
import { EmptyState } from "@/components/ui/feedback/state-block";
import {
 trainingSectionTabs,
} from "@/components/app/shared/section-tab-presets";
import { SectionTabs } from "@/components/app/shared/section-tabs";
import { WorkoutTemplateActions } from "@/components/app/domains/training/workout-template-actions";
import { Button } from "@/components/ui/actions/button";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { listWorkoutTemplatesWithMeta } from "@/lib/workout-templates/data";

function formatDate(value: string) {
 return new Intl.DateTimeFormat("es-CR", {
 day: "2-digit",
 month: "short",
 year: "numeric",
 }).format(new Date(value));
}

export default async function WorkoutTemplatesPage() {
 const access = await requireRouteAccess("/app/entrenamiento/plantillas");

 if (!access.canManageTraining) {
 redirect("/app/entrenamiento");
 }

 const { templates, warning } = await listWorkoutTemplatesWithMeta();
 const activeCount = templates.filter((template) => template.isActive).length;
 const incompleteCount = templates.filter(
 (template) => !template.isComplete,
 ).length;
 const averageDays =
 templates.length > 0
 ? Math.round(
 templates.reduce(
 (total, template) => total + template.cycleDays,
 0,
 ) / templates.length,
 )
 : 0;

 return (
 <AppScreen>
 <AppHeader
 eyebrow="Entrenamiento"
 title="Plantillas"
 description="Organiza entrenamientos diarios dentro de ciclos semanales o personalizados."
 />

 <SectionTabs
 activeId="templates"
 ariaLabel="Secciones de entrenamiento"
 items={trainingSectionTabs}
 />

 {warning ? (
 <Alert className="rounded-[22px] border-primary/30 bg-primary-tint/50 px-5 py-4">
 <AlertDescription className="font-semibold text-muted-foreground">
 {warning}
 </AlertDescription>
 </Alert>
 ) : null}

 <div className="flex justify-end">
 <Button asChild size="lg">
 <Link href="/app/entrenamiento/plantillas/nueva">
 <Plus aria-hidden="true" />
 Crear plantilla
 </Link>
 </Button>
 </div>

 <section className="grid grid-cols-2 items-start gap-3 sm:gap-4 xl:grid-cols-4">
 <StatTile
 label="Plantillas"
 value={String(templates.length)}
 detail="Ciclos creados"
 />
 <StatTile
 label="Plantillas activas"
 value={String(activeCount)}
 detail="Disponibles para asignar"
 />
 <StatTile
 label="Incompletas"
 value={String(incompleteCount)}
 detail="Con días pendientes"
 />
 <StatTile
 label="Duración promedio"
 value={averageDays ? `${averageDays} días` : "Sin datos"}
 detail="Días por ciclo"
 />
 </section>

 <AppPanel
 title="Todas las plantillas"
 description="Abre una plantilla para revisar cada día y el entrenamiento correspondiente."
 >
 {templates.length === 0 ? (
 <EmptyState>
 Aún no hay plantillas. Crea entrenamientos diarios y luego
 organízalos en el primer ciclo.
 </EmptyState>
 ) : (
 <div className="grid items-start gap-4 lg:grid-cols-2">
 {templates.map((template) => (
 <article
 key={template.id}
 className="h-fit self-start rounded-[24px] bg-background p-5 "
 >
 <div className="flex items-start justify-between gap-4">
 <Link
 href={`/app/entrenamiento/plantillas/${template.id}`}
 className="group min-w-0 flex-1"
 >
 <div className="flex flex-wrap gap-2">
 <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-extrabold text-foreground">
 Ciclo de {template.cycleDays} días
 </span>
 {template.identifier ? (
 <span className="max-w-full truncate rounded-full bg-surface px-3 py-1 text-xs font-extrabold text-foreground">
 ID: {template.identifier}
 </span>
 ) : null}
 <span
 className={
 template.isActive
 ? "rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-primary-foreground"
 : "rounded-full bg-surface-muted px-3 py-1 text-xs font-extrabold text-foreground"
 }
 >
 {template.isActive ? "Activa" : "Inactiva"}
 </span>
 {!template.isComplete ? (
 <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-extrabold text-danger">
 Incompleta: {template.missingDayCount}{" "}
 {template.missingDayCount === 1
 ? "día pendiente"
 : "días pendientes"}
 </span>
 ) : null}
 </div>
 <h2 className="mt-4 text-2xl font-semibold text-foreground">
 {template.name}
 </h2>
 <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
 {template.description || "Sin descripción adicional."}
 </p>
 <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-muted-foreground group-hover:text-foreground">
 Ver ciclo completo
 <ArrowRight className="size-4 transition group-hover:translate-x-1" />
 </span>
 </Link>
 <WorkoutTemplateActions
 compact
 isActive={template.isActive}
 templateId={template.id}
 templateName={template.name}
 />
 </div>

 <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-sm text-muted">
 <span className="inline-flex items-center gap-2">
 <CalendarDays className="size-4" aria-hidden="true" />
 {template.assignedDayCount}/{template.cycleDays} días
 </span>
 <span className="inline-flex items-center gap-2">
 <UserRound className="size-4" aria-hidden="true" />
 {template.creatorName}
 </span>
 <span className="inline-flex items-center gap-2">
 <CalendarClock className="size-4" aria-hidden="true" />
 {formatDate(template.updatedAt)}
 </span>
 </div>
 </article>
 ))}
 </div>
 )}
 </AppPanel>
 </AppScreen>
 );
}
