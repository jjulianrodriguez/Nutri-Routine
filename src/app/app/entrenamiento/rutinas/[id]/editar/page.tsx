import { notFound, redirect } from "next/navigation";

import { AppHeader, AppScreen } from "@/components/app/layouts/AppScreen";
import { RoutineEditor } from "@/components/app/domains/training/routine-editor";
import {
 trainingSectionTabs,
} from "@/components/app/shared/section-tab-presets";
import { SectionTabs } from "@/components/app/shared/section-tabs";
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
 eyebrow="Editar entrenamiento"
 title={routine.name}
 description="Actualiza la información general, cambia el orden o ajusta la configuración de cada ejercicio."
 />
 <SectionTabs
 activeId="routines"
 ariaLabel="Secciones de entrenamiento"
 items={trainingSectionTabs}
 />
 <RoutineEditor exerciseOptions={catalog} routine={routine} />
 </AppScreen>
 );
}
