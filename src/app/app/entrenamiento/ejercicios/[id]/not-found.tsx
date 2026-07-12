import { AppScreen } from "@/components/app/layouts/AppScreen";
import { RecoveryState } from "@/components/ui/feedback/recovery-state";

export default function ExerciseNotFound() {
 return (
 <AppScreen>
 <div className="grid min-h-[70dvh] place-items-center">
 <RecoveryState
 description="El ejercicio puede haber sido eliminado o no estar disponible para tu cuenta."
 eyebrow="Ejercicio no disponible"
 fallbackHref="/app/entrenamiento"
 fallbackLabel="Ir a entrenamiento"
 kind="not-found"
 title="No encontramos este ejercicio"
 />
 </div>
 </AppScreen>
 );
}
