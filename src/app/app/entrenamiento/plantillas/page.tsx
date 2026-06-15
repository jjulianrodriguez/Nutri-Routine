import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Layers3,
  Plus,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { WorkoutTemplateActions } from "@/components/app/workout-template-actions";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { listWorkoutTemplates } from "@/lib/workout-templates/data";

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

  const templates = await listWorkoutTemplates();
  const activeCount = templates.filter((template) => template.isActive).length;
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

      <TrainingSectionNav active="templates" />

      <div className="flex justify-end">
        <Button asChild size="lg">
          <Link href="/app/entrenamiento/plantillas/nueva">
            <Plus aria-hidden="true" />
            Crear plantilla
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
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
          <div className="grid gap-4 lg:grid-cols-2">
            {templates.map((template) => (
              <article
                key={template.id}
                className="rounded-[24px] border border-border bg-background p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link
                    href={`/app/entrenamiento/plantillas/${template.id}`}
                    className="group min-w-0 flex-1"
                  >
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-extrabold text-charcoal">
                        Ciclo de {template.cycleDays} días
                      </span>
                      <span
                        className={
                          template.isActive
                            ? "rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-charcoal"
                            : "rounded-full bg-stone-soft px-3 py-1 text-xs font-extrabold text-stone-hover"
                        }
                      >
                        {template.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold text-charcoal">
                      {template.name}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                      {template.description || "Sin descripción adicional."}
                    </p>
                    <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-warm-brown group-hover:text-charcoal">
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

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4 text-sm text-muted">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    {template.cycleDays} días
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
