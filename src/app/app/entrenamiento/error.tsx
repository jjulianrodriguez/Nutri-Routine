"use client";

import { AppScreen } from "@/components/app/AppScreen";
import { RecoveryState } from "@/components/errors/recovery-state";

type TrainingErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
};

export default function TrainingError({
  reset,
  unstable_retry,
}: TrainingErrorProps) {
  return (
    <AppScreen>
      <div className="grid min-h-[70dvh] place-items-center">
        <RecoveryState
          description="No pudimos cargar los ejercicios, entrenamientos, plantillas o asignaciones. Puedes intentar nuevamente."
          eyebrow="Error de entrenamiento"
          fallbackHref="/app/entrenamiento"
          fallbackLabel="Ir a entrenamiento"
          retry={unstable_retry ?? reset}
          title="No pudimos cargar esta sección"
        />
      </div>
    </AppScreen>
  );
}
