import { RouteLoadingFrame } from "@/components/app/layouts/route-loading-frame";
import {
 AppPanelSkeleton,
 FormSkeleton,
 PageHeaderSkeleton,
 SectionNavSkeleton,
 Skeleton,
 StatTileSkeleton,
} from "@/components/ui/feedback/skeleton";

export default function AsignacionesLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />
 <SectionNavSkeleton count={5} />
 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>
 <AppPanelSkeleton tone="primary" items={1} />
 <section className="grid items-start gap-6 xl:grid-cols-2">
 <section className="rounded-card bg-primary-soft p-5 sm:p-6">
 <Skeleton className="h-8 w-56" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-xl" />
 <div className="mt-5 grid gap-4 lg:grid-cols-2">
 <FormSkeleton fields={3} />
 <FormSkeleton fields={3} />
 </div>
 </section>
 <AppPanelSkeleton items={3} />
 </section>
 </RouteLoadingFrame>
 );
}
