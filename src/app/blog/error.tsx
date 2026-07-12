"use client";

import { RecoveryState } from "@/components/ui/feedback/recovery-state";

type BlogErrorProps = {
 error: Error & { digest?: string };
 reset: () => void;
 unstable_retry?: () => void;
};

export default function BlogError({
 reset,
 unstable_retry,
}: BlogErrorProps) {
 return (
 <div className="grid min-h-[65dvh] place-items-center px-5 py-12 sm:px-8 lg:px-10">
 <RecoveryState
 description="No pudimos cargar las lecturas en este momento. Intenta nuevamente o vuelve al indice del blog."
 eyebrow="Error del blog"
 fallbackHref="/blog"
 fallbackLabel="Ir al blog"
 retry={unstable_retry ?? reset}
 title="Ocurrió un error inesperado"
 />
 </div>
 );
}
