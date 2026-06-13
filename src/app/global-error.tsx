"use client";

import { RecoveryState } from "@/components/errors/recovery-state";

import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
};

export default function GlobalError({
  reset,
  unstable_retry,
}: GlobalErrorProps) {
  return (
    <html lang="es">
      <body>
        <title>Error inesperado | Nutricion Con Enfoque</title>
        <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_top_right,var(--primary-soft),transparent_30rem)] px-4 py-10 sm:px-6">
          <RecoveryState
            description="La aplicacion no pudo iniciar correctamente. Intenta cargarla otra vez o vuelve al inicio."
            eyebrow="Error general"
            fallbackHref="/"
            fallbackLabel="Ir al inicio"
            retry={unstable_retry ?? reset}
            title="Algo salio mal"
          />
        </main>
      </body>
    </html>
  );
}
