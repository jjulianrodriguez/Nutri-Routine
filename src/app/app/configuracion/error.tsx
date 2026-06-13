"use client";

import { AppScreen } from "@/components/app/AppScreen";
import { RecoveryState } from "@/components/errors/recovery-state";

type SettingsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
};

export default function SettingsError({
  reset,
  unstable_retry,
}: SettingsErrorProps) {
  return (
    <AppScreen>
      <div className="grid min-h-[70dvh] place-items-center">
        <RecoveryState
          description="No pudimos cargar la configuracion de tu cuenta. Ningun dato fue mostrado ni modificado por este error."
          eyebrow="Error de configuracion"
          fallbackHref="/app/configuracion"
          fallbackLabel="Ir a configuracion"
          retry={unstable_retry ?? reset}
          title="No pudimos cargar tu configuracion"
        />
      </div>
    </AppScreen>
  );
}
