import {
  ArrowLeft,
  CalendarDays,
  Dumbbell,
  Layers3,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
} from "@/components/app/AppScreen";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { WorkoutTemplateActions } from "@/components/app/workout-template-actions";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getWorkoutTemplateDetail } from "@/lib/workout-templates/data";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function WorkoutTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await requireRouteAccess("/app/entrenamiento/plantillas");

  if (!access.canManageTraining) {
    redirect("/app/entrenamiento");
  }

  const { id } = await params;
  const template = await getWorkoutTemplateDetail(id);

  if (!template) {
    notFound();
  }

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Detalle de plantilla"
        title={template.name}
        description={template.description || "Ciclo de entrenamiento sin descripción adicional."}
      />
      <TrainingSectionNav active="templates" />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Button asChild variant="outline" size="lg">
          <Link href="/app/entrenamiento/plantillas">
            <ArrowLeft aria-hidden="true" />
            Volver a plantillas
          </Link>
        </Button>
        <WorkoutTemplateActions
          isActive={template.isActive}
          templateId={template.id}
          templateName={template.name}
        />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DetailValue
          icon={Layers3}
          label="Días del ciclo"
          value={String(template.cycleDays)}
        />
        <DetailValue
          icon={Dumbbell}
          label="Entrenamientos"
          value={String(template.days.length)}
        />
        <DetailValue
          icon={UserRound}
          label="Creador"
          value={template.creatorName}
        />
        <DetailValue
          icon={CalendarDays}
          label="Estado"
          value={template.isActive ? "Activa" : "Inactiva"}
        />
      </section>

      <AppPanel
        title="Ciclo completo"
        description="Entrenamiento diario asignado a cada posición del ciclo."
      >
        {template.days.length > 0 ? (
          <div className="space-y-4">
            {template.days.map((day) => (
              <article
                key={day.id}
                className="rounded-[24px] border border-border bg-background p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                      Día {day.dayNumber}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-charcoal">
                      {day.routine.name}
                    </h2>
                    <p className="mt-2 text-sm font-bold text-warm-brown">
                      {day.routine.category} · {day.routine.difficulty} ·{" "}
                      {day.routine.exercises.length} ejercicios
                    </p>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                      {day.routine.description}
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link
                      href={`/app/entrenamiento/rutinas/${day.routine.id}`}
                    >
                      Ver entrenamiento
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState>Esta plantilla no tiene días configurados.</EmptyState>
        )}
      </AppPanel>

      <AppPanel
        title="Registro"
        description="Fechas de creación y última actualización."
        tone="accent"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailValue
            icon={CalendarDays}
            label="Creada"
            value={formatDate(template.createdAt)}
          />
          <DetailValue
            icon={CalendarDays}
            label="Actualizada"
            value={formatDate(template.updatedAt)}
          />
        </div>
      </AppPanel>
    </AppScreen>
  );
}

function DetailValue({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-border bg-surface p-4 shadow-soft">
      <Icon className="size-4 text-warm-brown" aria-hidden="true" />
      <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-1 font-extrabold text-charcoal">{value}</p>
    </div>
  );
}
