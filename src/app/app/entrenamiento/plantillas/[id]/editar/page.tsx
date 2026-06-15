import { notFound, redirect } from "next/navigation";

import { AppHeader, AppScreen } from "@/components/app/AppScreen";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { WorkoutTemplateEditor } from "@/components/app/workout-template-editor";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getRoutineManagementOverview } from "@/lib/routines/data";
import { getWorkoutTemplateDetail } from "@/lib/workout-templates/data";

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
  const [template, overview] = await Promise.all([
    getWorkoutTemplateDetail(id),
    getRoutineManagementOverview(),
  ]);

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
      <WorkoutTemplateEditor
        routines={overview.routines}
        template={template}
      />
    </AppScreen>
  );
}
