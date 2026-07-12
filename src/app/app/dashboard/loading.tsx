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

 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>

 <div className="grid items-start gap-6 xl:grid-cols-[1fr_0.9fr]">
 <AppPanelSkeleton tone="primary" items={2} />
 <AppPanelSkeleton tone="warm" items={1} />
 </div>

 <div className="grid items-start gap-6 xl:grid-cols-2">
 <AppPanelSkeleton items={2} />
 <AppPanelSkeleton tone="accent" items={1} />
 </div>

<div className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
<AppPanelSkeleton items={3} />
 <AppPanelSkeleton tone="primary" items={1} />
</div>
 </RouteLoadingFrame>
 );
}
