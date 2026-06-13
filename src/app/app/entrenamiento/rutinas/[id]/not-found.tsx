import { AppScreen } from "@/components/app/AppScreen";
import { RecoveryState } from "@/components/errors/recovery-state";

export default function RoutineNotFound() {
  return (
    <AppScreen>
      <div className="grid min-h-[70dvh] place-items-center">
        <RecoveryState
          description="La rutina puede haber sido eliminada o no estar disponible para tu cuenta."
          eyebrow="Rutina no disponible"
          fallbackHref="/app/entrenamiento"
          fallbackLabel="Ir a entrenamiento"
          kind="not-found"
          title="No encontramos esta rutina"
        />
      </div>
    </AppScreen>
  );
}
