import { RecoveryState } from "@/components/errors/recovery-state";

export default function RootNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_top_right,var(--primary-soft),transparent_30rem)] px-4 py-10 sm:px-6">
      <RecoveryState
        description="La direccion puede estar incompleta, haber cambiado o ya no estar disponible."
        eyebrow="Pagina no encontrada"
        fallbackHref="/"
        fallbackLabel="Ir al inicio"
        kind="not-found"
        title="No encontramos esta pagina"
      />
    </main>
  );
}
