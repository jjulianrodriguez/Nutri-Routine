import { AppScreen } from "@/components/app/AppScreen";
import { RecoveryState } from "@/components/errors/recovery-state";

export default function RoutineNotFound() {
 return (
 <AppScreen>
 <div className="grid min-h-[70dvh] place-items-center">
 <RecoveryState
 description="El entrenamiento puede haber sido eliminado o no estar disponible para tu cuenta."
 eyebrow="Entrenamiento no disponible"
 fallbackHref="/app/entrenamiento"
 fallbackLabel="Ir a entrenamiento"
 kind="not-found"
 title="No encontramos este entrenamiento"
 />
 </div>
 </AppScreen>
 );
}
