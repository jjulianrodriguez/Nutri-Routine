"use client";

import { AppScreen } from "@/components/app/layouts/AppScreen";
import { RecoveryState } from "@/components/ui/feedback/recovery-state";

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
 description="No pudimos cargar la información de esta sección. Tus datos y cambios guardados no se han mostrado de forma pública."
 eyebrow="Error en la aplicacion"
 fallbackHref="/app/dashboard"
 fallbackLabel="Ir al dashboard"
 retry={unstable_retry ?? reset}
 title="Ocurrió un error inesperado"
 />
 </div>
 </AppScreen>
 );
}
