import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
 CardGridSkeleton,
 FormSkeleton,
 PageHeaderSkeleton,
 SearchFilterSkeleton,
 Skeleton,
 StatTileSkeleton,
} from "@/components/ui/skeleton";

export default function RecursosLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />

 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>

 <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
 <div className="space-y-6">
 <section className="rounded-card bg-surface p-5 sm:p-6">
 <Skeleton className="h-3 w-32" />
 <Skeleton className="mt-2 h-8 w-56" />
 <div className="mt-5">
 <FormSkeleton fields={4} textarea />
 </div>
 </section>
 <section className="rounded-card bg-surface p-5 sm:p-6">
 <Skeleton className="h-8 w-52" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-md" />
 <div className="mt-5">
 <FormSkeleton fields={2} textarea />
 </div>
 </section>
 </div>

 <section className="rounded-card bg-surface p-5 sm:p-6">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <Skeleton className="h-3 w-40" />
 <Skeleton className="mt-2 h-9 w-64" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-xl" />
 </div>
 <Skeleton className="h-10 w-36" />
 </div>
 <div className="mt-5">
 <SearchFilterSkeleton fields={3} withButton={false} />
 </div>
 <div className="mt-6">
 <Skeleton className="h-6 w-28" />
 <CardGridSkeleton count={4} className="mt-4 md:grid-cols-2" />
 </div>
 </section>
 </div>
 </RouteLoadingFrame>
 );
}
