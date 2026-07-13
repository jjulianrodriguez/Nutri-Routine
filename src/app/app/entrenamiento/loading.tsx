import { RouteLoadingFrame } from "@/components/app/layouts/route-loading-frame";
import {
 CardGridSkeleton,
 PageHeaderSkeleton,
 SectionNavSkeleton,
 StatTileSkeleton,
} from "@/components/ui/feedback/skeleton";

export default function EntrenamientoLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />
 <SectionNavSkeleton count={5} />
 <section className="grid grid-cols-2 items-start gap-3 sm:gap-4 xl:grid-cols-4">
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>
 <CardGridSkeleton
 count={4}
 variant="feature"
 className="md:grid-cols-2 xl:grid-cols-4"
 />
 </RouteLoadingFrame>
 );
}
