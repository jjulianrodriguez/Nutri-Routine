import { RecoveryState } from "@/components/ui/feedback/recovery-state";

export default function RootNotFound() {
 return (
 <main
 id="main-content"
 className="grid min-h-dvh place-items-center bg-background px-4 py-10 sm:px-6"
 >
 <RecoveryState
 description="La dirección puede estar incompleta, haber cambiado o ya no estar disponible."
 eyebrow="Página no encontrada"
 fallbackHref="/"
 fallbackLabel="Ir al inicio"
 kind="not-found"
 title="No encontramos esta página"
 />
 </main>
 );
}
