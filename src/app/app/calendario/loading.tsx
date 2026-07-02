import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
 AppPanelSkeleton,
 PageHeaderSkeleton,
 StatTileSkeleton,
} from "@/components/ui/skeleton";

export default function CalendarLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />
 <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>
 <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
 <AppPanelSkeleton items={6} />
 <AppPanelSkeleton items={3} />
 </div>
 </RouteLoadingFrame>
 );
}
