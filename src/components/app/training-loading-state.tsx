import { Dumbbell } from "lucide-react";

import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
  AppPanelSkeleton,
  Skeleton,
  StatTileSkeleton,
} from "@/components/ui/skeleton";

export function TrainingLoadingState() {
  return (
    <RouteLoadingFrame>
      <section
        aria-busy="true"
        aria-label="Cargando entrenamiento"
        className="overflow-hidden rounded-[32px] border border-border bg-surface p-6 shadow-soft sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-primary-soft text-foreground">
            <Dumbbell className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
              Entrenamiento
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-foreground sm:text-4xl">
              Preparando entrenamiento
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Cargando la vista correspondiente a tu cuenta.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <AppPanelSkeleton items={3} tone="primary" />
        <div className="space-y-4">
          <AppPanelSkeleton items={1} tone="surface" />
          <div className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
            <Skeleton className="h-6 w-36 bg-charcoal/10" />
            <Skeleton className="mt-4 h-16 w-full rounded-[18px] bg-background/60" />
            <Skeleton className="mt-3 h-16 w-full rounded-[18px] bg-background/60" />
          </div>
        </div>
      </section>
    </RouteLoadingFrame>
  );
}
