import { RouteLoadingFrame } from "@/components/app/layouts/route-loading-frame";
import {
 AppPanelSkeleton,
 PageHeaderSkeleton,
 SearchFilterSkeleton,
 SectionNavSkeleton,
 Skeleton,
 StatTileSkeleton,
} from "@/components/ui/feedback/skeleton";

function ChartSkeleton() {
 return (
 <section className="h-fit self-start rounded-card bg-background p-4">
 <div className="flex items-start justify-between gap-3">
 <div>
 <Skeleton className="h-5 w-44" />
 <Skeleton className="mt-2 h-3 w-28" />
 </div>
 <Skeleton className="h-7 w-20" />
 </div>
 <div className="mt-5 grid h-40 grid-cols-6 items-end gap-2">
 {[42, 68, 36, 78, 54, 88].map((height, index) => (
 <Skeleton
 key={index}
 className="min-h-3 w-full rounded-t-control"
 style={{ height: `${height}%` }}
 />
 ))}
 </div>
 </section>
 );
}

export default function ProgressLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />

 <section className="rounded-card bg-surface p-4">
 <SearchFilterSkeleton fields={1} />
 </section>

 <SectionNavSkeleton count={4} />

 <section className="rounded-card bg-surface p-5">
 <Skeleton className="h-3 w-28" />
 <Skeleton className="mt-2 h-9 w-full max-w-lg" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-xl" />
 </section>

 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>

 <section className="grid items-start gap-5 lg:grid-cols-2">
 <AppPanelSkeleton items={2} />
 <AppPanelSkeleton tone="primary" items={2} />
 </section>

 <section className="grid items-start gap-5 lg:grid-cols-2">
 <ChartSkeleton />
 <ChartSkeleton />
 </section>
 </RouteLoadingFrame>
 );
}
