import { AppScreen } from "@/components/app/AppScreen";
import { RecoveryState } from "@/components/errors/recovery-state";

export default function HistoricalRoutineNotFound() {
  return (
    <AppScreen>
      <div className="grid min-h-[70dvh] place-items-center">
        <RecoveryState
          description="La rutina fue eliminada, ya no esta disponible o esta asignada a otra cuenta."
          eyebrow="Rutina historica no disponible"
          fallbackHref="/app/entrenamiento"
          fallbackLabel="Ir a entrenamiento"
          kind="not-found"
          title="No encontramos esta rutina"
        />
      </div>
    </AppScreen>
  );
}
