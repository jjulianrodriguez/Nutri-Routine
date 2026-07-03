import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
 AppPanelSkeleton,
 FormSkeleton,
 ListRowSkeleton,
 PageHeaderSkeleton,
 SectionNavSkeleton,
 Skeleton,
} from "@/components/ui/skeleton";

export default function NutritionAssignmentsLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />
 <SectionNavSkeleton count={3} />

 <section className="flex flex-col gap-3 rounded-card bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-3">
 <Skeleton className="size-10 rounded-full" />
 <Skeleton className="h-5 w-64 max-w-full" />
 </div>
 <Skeleton className="h-10 w-52" />
 </section>

 <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
 <AppPanelSkeleton tone="primary" items={3} />
 <section className="rounded-card bg-surface p-5 sm:p-6">
 <Skeleton className="h-8 w-56" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-xl" />
 <div className="mt-5">
 <FormSkeleton fields={4} textarea />
 </div>
 </section>
 </section>

 <section className="rounded-card bg-surface p-5 sm:p-6">
 <Skeleton className="h-8 w-60" />
 <div className="mt-5 grid items-start gap-3 md:grid-cols-2">
 <ListRowSkeleton />
 <ListRowSkeleton />
 <ListRowSkeleton />
 <ListRowSkeleton />
 </div>
 </section>
 </RouteLoadingFrame>
 );
}
