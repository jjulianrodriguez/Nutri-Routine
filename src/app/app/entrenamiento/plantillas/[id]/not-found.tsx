import { AppScreen } from "@/components/app/AppScreen";
import { RecoveryState } from "@/components/errors/recovery-state";

export default function WorkoutTemplateNotFound() {
  return (
    <AppScreen>
      <div className="grid min-h-[70dvh] place-items-center">
        <RecoveryState
          description="La plantilla puede haber sido eliminada o no estar disponible para tu cuenta."
          eyebrow="Plantilla no disponible"
          fallbackHref="/app/entrenamiento/plantillas"
          fallbackLabel="Ir a plantillas"
          kind="not-found"
          title="No encontramos esta plantilla"
        />
      </div>
    </AppScreen>
  );
}
