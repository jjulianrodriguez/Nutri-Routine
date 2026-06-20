import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
  AppPanelSkeleton,
  PageHeaderSkeleton,
  StatTileSkeleton,
} from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <RouteLoadingFrame>
      <PageHeaderSkeleton />
      <section className="grid gap-4 sm:grid-cols-3">
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
      </section>
      <AppPanelSkeleton items={5} />
    </RouteLoadingFrame>
  );
}
