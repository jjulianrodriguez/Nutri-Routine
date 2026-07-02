import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
 AppHeader,
 AppPanel,
 AppScreen,
 EmptyState,
 StatTile,
} from "@/components/app/AppScreen";
import { RoutineCardActions } from "@/components/app/routine-card-actions";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { WorkoutSummaryCard } from "@/components/app/workout-summary-card";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getRoutineManagementOverview } from "@/lib/routines/data";

function formatDate(value: string) {
 return new Intl.DateTimeFormat("es-CR", {
 day: "2-digit",
 month: "short",
 year: "numeric",
 }).format(new Date(value));
}

export default async function RoutinesPage() {
 const access = await requireRouteAccess("/app/entrenamiento/rutinas");

 if (!access.canManageTraining) {
 redirect("/app/entrenamiento");
 }

 const overview = await getRoutineManagementOverview();

 return (
 <AppScreen>
 <AppHeader
 eyebrow="Entrenamiento"
 title="Entrenamientos"
 description="Crea sesiones de un día usando exclusivamente los ejercicios disponibles en la biblioteca."
 />

 <TrainingSectionNav active="routines" />

 <div className="flex justify-end">
 <Button asChild size="lg">
 <Link href="/app/entrenamiento/rutinas/nueva">
 <Plus className="size-4" />
 Crear entrenamiento
 </Link>
 </Button>
 </div>

 <section className="grid items-start gap-4 sm:grid-cols-3">
 <StatTile
 label="Entrenamientos"
 value={String(overview.routines.length)}
 detail="Sesiones diarias disponibles"
 />
 <StatTile
 label="Entrenamientos activos"
 value={String(overview.activeCount)}
 detail="Listas para utilizar"
 />
 <StatTile
 label="Ejercicios activos"
 value={String(overview.exerciseCount)}
 detail="Disponibles para seleccionar"
 />
 </section>

 <AppPanel
 title="Todos los entrenamientos"
 description="Abre un entrenamiento para ver su detalle o editar la configuración de sus ejercicios."
 >
 {overview.routines.length === 0 ? (
 <EmptyState>
 Aun no hay entrenamientos. Primero crea ejercicios en la biblioteca
 y despues construye el primer entrenamiento.
 </EmptyState>
 ) : (
 <div className="grid items-start gap-4 lg:grid-cols-2">
 {overview.routines.map((routine) => (
 <WorkoutSummaryCard
 key={routine.id}
 actions={
 <RoutineCardActions
 isActive={routine.isActive}
 routineId={routine.id}
 routineName={routine.name}
 />
 }
 category={routine.category}
 description={routine.description}
 difficulty={routine.difficulty}
 exerciseCount={routine.exerciseCount}
 footerItems={[
 {
 kind: "user",
 label: routine.creatorName,
 },
 {
 kind: "calendar",
 label: `Actualizado ${formatDate(routine.updatedAt)}`,
 },
 ]}
 href={`/app/entrenamiento/rutinas/${routine.id}`}
 inactiveExerciseCount={routine.inactiveExerciseCount}
 statusLabel={routine.isActive ? "Activo" : "Inactivo"}
 statusTone={routine.isActive ? "active" : "inactive"}
 targetAudience={routine.targetAudience}
 title={routine.name}
 />
 ))}
 </div>
 )}
 </AppPanel>
 </AppScreen>
 );
}
