import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
 AppPanelSkeleton,
 PageHeaderSkeleton,
 StatTileSkeleton,
} from "@/components/ui/skeleton";

export default function BlogLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />
 <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>
 <AppPanelSkeleton items={3} />
 </RouteLoadingFrame>
 );
}
