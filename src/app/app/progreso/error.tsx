"use client";

import { AppScreen } from "@/components/app/layouts/AppScreen";
import { RecoveryState } from "@/components/ui/feedback/recovery-state";

type ProgressErrorProps = {
 error: Error & { digest?: string };
 reset: () => void;
 unstable_retry?: () => void;
};

export default function ProgressError({
 reset,
 unstable_retry,
}: ProgressErrorProps) {
 return (
 <AppScreen>
 <div className="grid min-h-[70dvh] place-items-center">
 <RecoveryState
 description="No pudimos cargar Progreso. Puedes intentar nuevamente sin perder tu sesion."
 eyebrow="Error de progreso"
 fallbackHref="/app/dashboard"
 fallbackLabel="Ir al dashboard"
 retry={unstable_retry ?? reset}
 title="No pudimos cargar esta seccion"
 />
 </div>
 </AppScreen>
 );
}
