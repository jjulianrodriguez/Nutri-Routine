import { redirect } from "next/navigation";

import { AppHeader, AppScreen } from "@/components/app/AppScreen";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { WorkoutTemplateEditor } from "@/components/app/workout-template-editor";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getRoutineManagementOverview } from "@/lib/routines/data";

export default async function NewWorkoutTemplatePage({
 searchParams,
}: {
 searchParams: Promise<{ training?: string | string[] }>;
}) {
 const access = await requireRouteAccess(
 "/app/entrenamiento/plantillas/nueva",
 );

 if (!access.canManageTraining) {
 redirect("/app/entrenamiento");
 }

 const [overview, query] = await Promise.all([
 getRoutineManagementOverview(),
 searchParams,
 ]);
 const requestedTrainingId =
 typeof query.training === "string" ? query.training : "";
 const defaultRoutineId = overview.routines.some(
 (routine) => routine.id === requestedTrainingId && routine.isActive,
 )
 ? requestedTrainingId
 : "";

 return (
 <AppScreen>
 <AppHeader
 eyebrow="Nueva plantilla"
 title="Crear plantilla de entrenamiento"
 description="Define los días del ciclo y asigna un entrenamiento diario a cada uno."
 />
 <TrainingSectionNav active="templates" />
 <WorkoutTemplateEditor
 defaultRoutineId={defaultRoutineId}
 routines={overview.routines}
 />
 </AppScreen>
 );
}
