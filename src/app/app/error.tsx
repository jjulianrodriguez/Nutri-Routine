"use client";

import { AppScreen } from "@/components/app/AppScreen";
import { RecoveryState } from "@/components/errors/recovery-state";

type PrivateAppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
};

export default function PrivateAppError({
  reset,
  unstable_retry,
}: PrivateAppErrorProps) {
  return (
    <AppScreen>
      <div className="grid min-h-[70dvh] place-items-center">
        <RecoveryState
          description="No pudimos cargar la informacion de esta seccion. Tus datos y cambios guardados no se han mostrado de forma publica."
          eyebrow="Error en la aplicacion"
          fallbackHref="/app/dashboard"
          fallbackLabel="Ir al dashboard"
          retry={unstable_retry ?? reset}
          title="Ocurrio un error inesperado"
        />
      </div>
    </AppScreen>
  );
}
