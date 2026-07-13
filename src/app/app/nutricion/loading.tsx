import { RouteLoadingFrame } from "@/components/app/layouts/route-loading-frame";
import {
 AppPanelSkeleton,
 ListRowSkeleton,
 PageHeaderSkeleton,
 SectionNavSkeleton,
 Skeleton,
 StatTileSkeleton,
} from "@/components/ui/feedback/skeleton";

export default function NutritionLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />
 <SectionNavSkeleton count={3} />

 <section className="grid grid-cols-2 items-start gap-3 sm:gap-4">
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>

 <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
 <div className="space-y-6">
 <AppPanelSkeleton tone="primary" items={1} />
 <AppPanelSkeleton items={1} />
 </div>

 <section className="rounded-card bg-surface p-5 sm:p-6">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <Skeleton className="h-3 w-36" />
 <Skeleton className="mt-2 h-8 w-60" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-xl" />
 </div>
 <Skeleton className="h-10 w-36" />
 </div>
 <div className="mt-5 rounded-card bg-background p-4">
 <Skeleton className="h-12 w-full" />
 <div className="mt-4 flex flex-wrap gap-2">
 <Skeleton className="h-9 w-24" />
 <Skeleton className="h-9 w-28" />
 <Skeleton className="h-9 w-24" />
 </div>
 </div>
 <div className="mt-6 space-y-3">
 <ListRowSkeleton avatar action />
 <ListRowSkeleton avatar action />
 </div>
 </section>
 </section>

 <AppPanelSkeleton tone="primary" items={2} />
 </RouteLoadingFrame>
 );
}
