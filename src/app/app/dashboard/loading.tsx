import { RouteLoadingFrame } from "@/components/app/layouts/route-loading-frame";
import {
 AppPanelSkeleton,
 PageHeaderSkeleton,
 StatTileSkeleton,
} from "@/components/ui/feedback/skeleton";

export default function DashboardLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />

 <section className="grid grid-cols-2 items-start gap-3 sm:gap-4 xl:grid-cols-4">
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>

 <AppPanelSkeleton tone="primary" items={2} />

 <div className="grid items-start gap-6 xl:grid-cols-[1.05fr_0.95fr]">
 <AppPanelSkeleton items={3} />
 <AppPanelSkeleton tone="warm" items={3} />
 </div>

 <div className="grid items-start gap-6 xl:grid-cols-2">
 <AppPanelSkeleton tone="accent" items={2} />
 <AppPanelSkeleton items={3} />
 </div>
 </RouteLoadingFrame>
 );
}
