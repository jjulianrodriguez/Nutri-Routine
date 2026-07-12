import { RouteLoadingFrame } from "@/components/app/layouts/route-loading-frame";
import {
 CardGridSkeleton,
 FormSkeleton,
 PageHeaderSkeleton,
 SectionNavSkeleton,
 Skeleton,
} from "@/components/ui/feedback/skeleton";

export default function EjerciciosLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />
 <SectionNavSkeleton count={5} />
 <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
 <section className="rounded-card bg-surface p-5 sm:p-6">
 <Skeleton className="h-8 w-56" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-lg" />
 <div className="mt-5">
 <FormSkeleton fields={5} textarea />
 </div>
 </section>
 <section className="rounded-card bg-surface p-5 sm:p-6">
 <Skeleton className="h-8 w-56" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-xl" />
 <div className="mt-5 rounded-card bg-background p-4">
 <Skeleton className="h-12 w-full" />
 <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
 {Array.from({ length: 4 }).map((_, index) => (
 <Skeleton key={index} className="h-11 w-full" />
 ))}
 </div>
 </div>
 <div className="mt-5 space-y-3">
 <CardGridSkeleton count={3} />
 </div>
 </section>
 </section>
 </RouteLoadingFrame>
 );
}
