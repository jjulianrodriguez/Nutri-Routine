"use client";

import { RecoveryState } from "@/components/ui/feedback/recovery-state";

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
 <title>Error inesperado | Nutrición Con Enfoque</title>
 <main
 id="main-content"
 className="grid min-h-dvh place-items-center bg-background px-4 py-10 sm:px-6"
 >
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
