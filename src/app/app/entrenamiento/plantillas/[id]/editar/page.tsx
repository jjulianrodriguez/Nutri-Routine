import { notFound, redirect } from "next/navigation";

import { AppHeader, AppScreen } from "@/components/app/AppScreen";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { WorkoutTemplateEditor } from "@/components/app/workout-template-editor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getRoutineManagementOverview } from "@/lib/routines/data";
import { getWorkoutTemplateDetailWithMeta } from "@/lib/workout-templates/data";

export default async function EditWorkoutTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await requireRouteAccess("/app/entrenamiento/plantillas");

  if (!access.canManageTraining) {
    redirect("/app/entrenamiento");
  }

  const { id } = await params;
  const [templateResult, overview] = await Promise.all([
    getWorkoutTemplateDetailWithMeta(id),
    getRoutineManagementOverview(),
  ]);
  const { template, warning } = templateResult;

  if (!template) {
    notFound();
  }

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Editar plantilla"
        title={template.name}
        description="Actualiza la duración del ciclo y el entrenamiento asignado a cada día."
      />
      <TrainingSectionNav active="templates" />
      {warning ? (
        <Alert className="rounded-[22px] border-primary/30 bg-primary-soft/50 px-5 py-4">
          <AlertDescription className="font-semibold text-warm-brown">
            {warning}
          </AlertDescription>
        </Alert>
      ) : null}
      <WorkoutTemplateEditor
        routines={overview.routines}
        template={template}
      />
    </AppScreen>
  );
}
