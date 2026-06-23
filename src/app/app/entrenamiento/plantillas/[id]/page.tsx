import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AppHeader, AppPanel, AppScreen } from "@/components/app/AppScreen";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { TemplateOverview } from "@/components/app/workout-template-overview";
import { WorkoutTemplateActions } from "@/components/app/workout-template-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getWorkoutTemplateDetailWithMeta } from "@/lib/workout-templates/data";

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
  const { template, warning } = await getWorkoutTemplateDetailWithMeta(id);

  if (!template) {
    notFound();
  }

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Entrenamiento"
        title="Plantilla de entrenamiento"
        description="Revisa el resumen del ciclo y el entrenamiento asignado a cada día."
      />
      <TrainingSectionNav active="templates" />

      {warning ? (
        <Alert className="rounded-[22px] border-primary/30 bg-primary-soft/50 px-5 py-4">
          <AlertDescription className="font-semibold text-warm-brown">
            {warning}
          </AlertDescription>
        </Alert>
      ) : null}

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

      <TemplateOverview
        routineHref={(routineId) => `/app/entrenamiento/rutinas/${routineId}`}
        template={template}
        viewer="professional"
      />

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
