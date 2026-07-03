import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
 AppPanelSkeleton,
 PageHeaderSkeleton,
 SearchFilterSkeleton,
 Skeleton,
 StatTileSkeleton,
} from "@/components/ui/skeleton";

function MonthGridSkeleton() {
 return (
 <>
 <div className="mt-6 grid grid-cols-7 gap-1 text-center sm:gap-2">
 {Array.from({ length: 7 }).map((_, index) => (
 <Skeleton key={index} className="mx-auto h-3 w-8" />
 ))}
 </div>
 <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-2">
 {Array.from({ length: 35 }).map((_, index) => (
 <div key={index} className="min-h-16 rounded-card bg-background p-1 sm:min-h-28 sm:p-2">
 <Skeleton className="size-8 rounded-full" />
 {index % 3 === 0 ? <Skeleton className="mt-2 hidden h-6 w-full sm:block" /> : null}
 {index % 5 === 0 ? <Skeleton className="mt-1 hidden h-6 w-3/4 sm:block" /> : null}
 </div>
 ))}
 </div>
 </>
 );
}

export default function CalendarLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />

 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>

 <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
 <section className="rounded-card bg-surface p-4 sm:p-6">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
 <div>
 <Skeleton className="h-3 w-32" />
 <Skeleton className="mt-2 h-9 w-56" />
 <Skeleton className="mt-2 h-3.5 w-48" />
 </div>
 <div className="flex flex-wrap gap-2">
 <Skeleton className="h-9 w-20" />
 <Skeleton className="h-9 w-28" />
 <Skeleton className="h-9 w-28" />
 <Skeleton className="h-9 w-32" />
 </div>
 </div>
 <div className="mt-5">
 <SearchFilterSkeleton fields={4} withButton={false} />
 </div>
 <div className="mt-5 flex flex-wrap gap-2">
 <Skeleton className="h-9 w-32" />
 <Skeleton className="h-9 w-32" />
 <Skeleton className="h-9 w-32" />
 </div>
 <MonthGridSkeleton />
 </section>

 <aside className="space-y-6">
 <AppPanelSkeleton items={3} />
 <AppPanelSkeleton tone="primary" items={2} />
 <AppPanelSkeleton tone="primary" items={1} />
 </aside>
 </div>
 </RouteLoadingFrame>
 );
}
