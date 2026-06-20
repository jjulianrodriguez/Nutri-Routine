import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
  AppPanelSkeleton,
  CardGridSkeleton,
  PageHeaderSkeleton,
  StatTileSkeleton,
} from "@/components/ui/skeleton";

export default function ClientesLoading() {
  return (
    <RouteLoadingFrame>
      <PageHeaderSkeleton />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
      </section>
      <AppPanelSkeleton tone="primary" items={1} />
      <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-charcoal/10" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-muted/20" />
        <div className="mt-5 space-y-4">
          <CardGridSkeleton count={1} className="h-64" />
          <CardGridSkeleton count={1} className="h-64" />
        </div>
      </section>
    </RouteLoadingFrame>
  );
}
