import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
 AppPanelSkeleton,
 ListRowSkeleton,
 PageHeaderSkeleton,
 SearchFilterSkeleton,
 Skeleton,
 StatTileSkeleton,
} from "@/components/ui/skeleton";

export default function ClientesLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />

 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>

 <section className="h-fit self-start rounded-card bg-primary-soft p-5 sm:p-6">
 <Skeleton className="h-8 w-52" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-xl" />
 <div className="mt-5">
 <SearchFilterSkeleton fields={5} />
 </div>
 </section>

 <section className="h-fit self-start rounded-card bg-surface p-5 sm:p-6">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <Skeleton className="h-8 w-48" />
 <Skeleton className="mt-2 h-3.5 w-72 max-w-full" />
 </div>
 <Skeleton className="h-9 w-28" />
 </div>
 <div className="mt-5 space-y-3">
 <ListRowSkeleton avatar action />
 <ListRowSkeleton avatar action />
 <ListRowSkeleton avatar action />
 </div>
 </section>

 <AppPanelSkeleton tone="accent" items={2} />
 </RouteLoadingFrame>
 );
}
