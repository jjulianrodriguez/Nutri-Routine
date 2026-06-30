import { AppHeader, AppScreen } from "@/components/app/AppScreen";

export default function NutritionLoading() {
  return (
    <AppScreen>
      <AppHeader
        eyebrow="Cargando nutrición"
        title="Nutrición"
        description="Preparando la sección de nutrición..."
      />

      <div className="flex animate-pulse flex-wrap gap-2 rounded-[22px] border border-border bg-surface p-2 shadow-soft">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-11 w-32 rounded-control bg-border/40" />
        ))}
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="animate-pulse rounded-[24px] border border-border bg-surface p-5 shadow-soft">
          <div className="mb-3 h-4 w-24 rounded-full bg-border/40" />
          <div className="mb-2 h-8 w-16 rounded-full bg-border/40" />
          <div className="h-3 w-32 rounded-full bg-border/40" />
        </div>
        <div className="animate-pulse rounded-[24px] border border-border bg-surface p-5 shadow-soft">
          <div className="mb-3 h-4 w-24 rounded-full bg-border/40" />
          <div className="mb-2 h-8 w-16 rounded-full bg-border/40" />
          <div className="h-3 w-32 rounded-full bg-border/40" />
        </div>
      </section>

      <div className="mt-8 animate-pulse space-y-5">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded-full bg-border/40" />
          <div className="h-10 w-32 rounded-control bg-border/40" />
        </div>
        <div className="h-64 rounded-[28px] border border-border bg-surface" />
      </div>
    </AppScreen>
  );
}
