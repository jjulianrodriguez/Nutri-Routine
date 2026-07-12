"use client";

import { AppScreen } from "@/components/app/layouts/AppScreen";
import { RecoveryState } from "@/components/ui/feedback/recovery-state";

type NotificationsErrorProps = {
 error: Error & { digest?: string };
 reset: () => void;
 unstable_retry?: () => void;
};

export default function NotificationsError({
 reset,
 unstable_retry,
}: NotificationsErrorProps) {
 return (
 <AppScreen>
 <div className="grid min-h-[70dvh] place-items-center">
 <RecoveryState
 description="No pudimos consultar tu actividad reciente. Puedes intentar nuevamente."
 eyebrow="Error de notificaciones"
 fallbackHref="/app/dashboard"
 fallbackLabel="Ir al dashboard"
 retry={unstable_retry ?? reset}
 title="No pudimos cargar tus notificaciones"
 />
 </div>
 </AppScreen>
 );
}
