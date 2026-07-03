import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
 ListRowSkeleton,
 PageHeaderSkeleton,
 SectionNavSkeleton,
 Skeleton,
 StatTileSkeleton,
} from "@/components/ui/skeleton";

export default function NotificationsLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />

 <section className="grid items-start gap-4 sm:grid-cols-3">
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>

 <section className="rounded-card bg-surface p-5 sm:p-6">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <Skeleton className="h-5 w-44" />
 <Skeleton className="h-10 w-48" />
 </div>
 <div className="mt-4">
 <SectionNavSkeleton count={6} />
 </div>
 <div className="mt-5 space-y-3">
 <ListRowSkeleton avatar action />
 <ListRowSkeleton avatar action />
 <ListRowSkeleton avatar action />
 <ListRowSkeleton avatar action />
 </div>
 </section>
 </RouteLoadingFrame>
 );
}
