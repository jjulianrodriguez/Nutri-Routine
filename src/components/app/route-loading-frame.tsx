import { AppScreen } from "@/components/app/AppScreen";

export function RouteLoadingFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        className="fixed inset-x-0 top-0 z-50 h-1 animate-pulse bg-primary shadow-glow"
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">Cargando contenido&hellip;</span>
      </div>
      <AppScreen>{children}</AppScreen>
    </>
  );
}
