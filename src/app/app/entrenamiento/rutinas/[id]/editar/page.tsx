import { notFound, redirect } from "next/navigation";

import { AppHeader, AppScreen } from "@/components/app/AppScreen";
import { RoutineEditor } from "@/components/app/routine-editor";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import {
  getRoutineDetail,
  listExerciseOptions,
} from "@/lib/routines/data";

export default async function EditRoutinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await requireRouteAccess("/app/entrenamiento/rutinas");

  if (!access.canManageTraining) {
    redirect("/app/entrenamiento");
  }

  const { id } = await params;
  const [routine, catalog] = await Promise.all([
    getRoutineDetail(id),
    listExerciseOptions(),
  ]);

  if (!routine) {
    notFound();
  }

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Editar rutina"
        title={routine.name}
        description="Actualiza la informacion general, cambia el orden o ajusta la configuracion de cada ejercicio."
      />
      <TrainingSectionNav active="routines" />
      <RoutineEditor exerciseOptions={catalog} routine={routine} />
    </AppScreen>
  );
}
