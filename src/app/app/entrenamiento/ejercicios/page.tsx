import { redirect } from "next/navigation";

import { AppHeader, AppScreen } from "@/components/app/AppScreen";
import { ExerciseManager } from "@/components/app/exercise-manager";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { listExercises } from "@/lib/exercises/data";

export default async function ExercisesPage() {
  const access = await requireRouteAccess(
    "/app/entrenamiento/ejercicios",
  );

  if (!access.canManageTraining) {
    redirect("/app/entrenamiento");
  }

  const exercises = await listExercises();

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Entrenamiento"
        title="Ejercicios"
        description="Crea y mantiene la biblioteca que se utiliza despues para construir rutinas."
      />
      <TrainingSectionNav active="exercises" />
      <ExerciseManager exercises={exercises} />
    </AppScreen>
  );
}
