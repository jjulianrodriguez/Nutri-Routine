import { AppHeader, AppScreen } from "@/components/app/AppScreen";

export default function NutritionLoading() {
  return (
    <AppScreen>
      <AppHeader
        eyebrow="Cargando nutricion"
        title="Nutrición"
        description="Preparando la seccion de nutricion..."
      />

      {/* Skeletons para la navegacion */}
      <div className="flex flex-wrap gap-2 rounded-[22px] border border-border bg-surface p-2 shadow-soft animate-pulse">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-11 w-32 rounded-control bg-border/40"
          />
        ))}
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[24px] border border-border bg-surface p-5 shadow-soft animate-pulse">
          <div className="h-4 w-24 rounded-full bg-border/40 mb-3" />
          <div className="h-8 w-16 rounded-full bg-border/40 mb-2" />
          <div className="h-3 w-32 rounded-full bg-border/40" />
        </div>
        <div className="rounded-[24px] border border-border bg-surface p-5 shadow-soft animate-pulse">
          <div className="h-4 w-24 rounded-full bg-border/40 mb-3" />
          <div className="h-8 w-16 rounded-full bg-border/40 mb-2" />
          <div className="h-3 w-32 rounded-full bg-border/40" />
        </div>
      </section>

      {/* Skeleton de la tabla principal o manejador */}
      <div className="mt-8 space-y-5 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 rounded-full bg-border/40" />
          <div className="h-10 w-32 rounded-control bg-border/40" />
        </div>
        <div className="h-64 rounded-[28px] border border-border bg-surface" />
      </div>
    </AppScreen>
  );
}
