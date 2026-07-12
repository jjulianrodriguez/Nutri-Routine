import { RouteLoadingFrame } from "@/components/app/layouts/route-loading-frame";
import {
 AppPanelSkeleton,
 CardGridSkeleton,
 PageHeaderSkeleton,
 SectionNavSkeleton,
 Skeleton,
 StatTileSkeleton,
} from "@/components/ui/feedback/skeleton";

export default function NutritionHabitsLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />
 <SectionNavSkeleton count={3} />

 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>

 <section className="rounded-card bg-primary-soft p-5 sm:p-6">
 <Skeleton className="h-8 w-52" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-xl" />
 <div className="mt-5 grid grid-cols-7 gap-2">
 {Array.from({ length: 7 }).map((_, index) => (
 <Skeleton key={index} className="h-24 w-full" />
 ))}
 </div>
 </section>

 <section className="grid items-start gap-6 xl:grid-cols-2">
 <AppPanelSkeleton items={3} />
 <CardGridSkeleton count={4} className="sm:grid-cols-2" />
 </section>
 </RouteLoadingFrame>
 );
}
