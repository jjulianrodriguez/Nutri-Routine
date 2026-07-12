import { redirect } from "next/navigation";

import {
 AppHeader,
 AppPanel,
 AppScreen,
} from "@/components/app/layouts/AppScreen";
import { EmptyState } from "@/components/ui/feedback/state-block";
import { RoutineEditor } from "@/components/app/domains/training/routine-editor";
import {
 trainingSectionTabs,
} from "@/components/app/shared/section-tab-presets";
import { SectionTabs } from "@/components/app/shared/section-tabs";
import { Button } from "@/components/ui/actions/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { listExerciseOptions } from "@/lib/routines/data";
import Link from "next/link";

export default async function NewRoutinePage() {
 const access = await requireRouteAccess(
 "/app/entrenamiento/rutinas/nueva",
 );

 if (!access.canManageTraining) {
 redirect("/app/entrenamiento");
 }

 const catalog = await listExerciseOptions();

 return (
 <AppScreen>
 <AppHeader
 eyebrow="Nuevo entrenamiento"
 title="Crear entrenamiento"
 description="Selecciona ejercicios de la biblioteca y configura su orden, series, repeticiones, descanso y notas."
 />
 <SectionTabs
 activeId="routines"
 ariaLabel="Secciones de entrenamiento"
 items={trainingSectionTabs}
 />
 {catalog.length > 0 ? (
 <RoutineEditor exerciseOptions={catalog} />
 ) : (
 <AppPanel
 title="Primero crea ejercicios"
 description="Los entrenamientos solo pueden construirse con ejercicios existentes."
 >
 <EmptyState>
 La biblioteca esta vacia. Crea al menos un ejercicio antes de
 continuar.
 </EmptyState>
 <Button asChild className="mt-4">
 <Link href="/app/entrenamiento/ejercicios">
 Ir a ejercicios
 </Link>
 </Button>
 </AppPanel>
 )}
 </AppScreen>
 );
}
