import { AppScreen } from "@/components/app/AppScreen";
import { RecoveryState } from "@/components/errors/recovery-state";

export default function HistoricalRoutineNotFound() {
  return (
    <AppScreen>
      <div className="grid min-h-[70dvh] place-items-center">
        <RecoveryState
          description="El plan fue eliminado, ya no esta disponible o esta asignado a otra cuenta."
          eyebrow="Plan historico no disponible"
          fallbackHref="/app/entrenamiento"
          fallbackLabel="Ir a entrenamiento"
          kind="not-found"
          title="No encontramos este plan"
        />
      </div>
    </AppScreen>
  );
}
