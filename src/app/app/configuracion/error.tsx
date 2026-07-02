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
 description="No pudimos cargar la configuración de tu cuenta. Ningún dato fue mostrado ni modificado por este error."
 eyebrow="Error de configuración"
 fallbackHref="/app/configuracion"
 fallbackLabel="Ir a configuración"
 retry={unstable_retry ?? reset}
 title="No pudimos cargar tu configuración"
 />
 </div>
 </AppScreen>
 );
}
