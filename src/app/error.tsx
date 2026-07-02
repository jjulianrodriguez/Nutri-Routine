"use client";

import { RecoveryState } from "@/components/errors/recovery-state";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
};

export default function RootError({
  reset,
  unstable_retry,
}: RootErrorProps) {
  return (
    <main
      id="main-content"
      className="grid min-h-dvh place-items-center bg-background px-4 py-10 sm:px-6"
    >
      <RecoveryState
        description="No pudimos cargar esta página correctamente. Puedes intentarlo otra vez o regresar a un lugar seguro."
        eyebrow="Error de la página"
        fallbackHref="/"
        fallbackLabel="Ir al inicio"
        retry={unstable_retry ?? reset}
        title="Ocurrió un error inesperado"
      />
    </main>
  );
}
