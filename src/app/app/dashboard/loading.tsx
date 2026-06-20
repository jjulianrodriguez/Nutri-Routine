import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
  AppPanelSkeleton,
  PageHeaderSkeleton,
  StatTileSkeleton,
} from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <RouteLoadingFrame>
      <PageHeaderSkeleton />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <AppPanelSkeleton items={3} />
        <AppPanelSkeleton tone="accent" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AppPanelSkeleton />
        <AppPanelSkeleton />
      </div>
    </RouteLoadingFrame>
  );
}
