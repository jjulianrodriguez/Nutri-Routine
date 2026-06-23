"use client";

import { AppScreen } from "@/components/app/AppScreen";
import { RecoveryState } from "@/components/errors/recovery-state";

type ClientsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
};

export default function ClientsError({
  reset,
  unstable_retry,
}: ClientsErrorProps) {
  return (
    <AppScreen>
      <div className="grid min-h-[70dvh] place-items-center">
        <RecoveryState
          description="No pudimos cargar la información de clientes o sus planes. Intenta nuevamente sin abandonar la sección."
          eyebrow="Error de clientes"
          fallbackHref="/app/clientes"
          fallbackLabel="Ir a clientes"
          retry={unstable_retry ?? reset}
          title="No pudimos cargar los clientes"
        />
      </div>
    </AppScreen>
  );
}
