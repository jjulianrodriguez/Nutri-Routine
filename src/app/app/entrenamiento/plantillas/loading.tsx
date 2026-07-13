import { RouteLoadingFrame } from "@/components/app/layouts/route-loading-frame";
import {
 ButtonRowSkeleton,
 CardGridSkeleton,
 PageHeaderSkeleton,
 SectionNavSkeleton,
 Skeleton,
 StatTileSkeleton,
} from "@/components/ui/feedback/skeleton";

export default function PlantillasLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />
 <SectionNavSkeleton count={5} />
 <div className="flex justify-end">
 <Skeleton className="h-12 w-44" />
 </div>
 <section className="grid grid-cols-2 items-start gap-3 sm:gap-4 xl:grid-cols-4">
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>
 <section className="rounded-card bg-surface p-5 sm:p-6">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <Skeleton className="h-8 w-60" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-xl" />
 </div>
 <ButtonRowSkeleton align="end" count={1} />
 </div>
 <CardGridSkeleton count={4} className="mt-5 lg:grid-cols-2" />
 </section>
 </RouteLoadingFrame>
 );
}
