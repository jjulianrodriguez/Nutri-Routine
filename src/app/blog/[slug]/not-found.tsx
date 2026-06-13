import { RecoveryState } from "@/components/errors/recovery-state";

export default function BlogPostNotFound() {
  return (
    <div className="grid min-h-[65dvh] place-items-center px-5 py-12 sm:px-8 lg:px-10">
      <RecoveryState
        description="El articulo puede haber cambiado de direccion, no estar publicado o haber sido retirado."
        eyebrow="Articulo no encontrado"
        fallbackHref="/blog"
        fallbackLabel="Ir al blog"
        kind="not-found"
        title="No encontramos este articulo"
      />
    </div>
  );
}
