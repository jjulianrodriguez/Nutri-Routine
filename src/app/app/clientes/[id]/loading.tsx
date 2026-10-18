import { RouteLoadingFrame } from "@/components/app/layouts/route-loading-frame";
import {
 AppPanelSkeleton,
 ButtonRowSkeleton,
 FormSkeleton,
 ListRowSkeleton,
 Skeleton,
} from "@/components/ui/feedback/skeleton";

export default function ClientProfileLoading() {
 return (
 <RouteLoadingFrame>
 <Skeleton className="h-12 w-40" />

 <section className="overflow-hidden rounded-card bg-surface p-6 sm:p-8">
 <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
 <Skeleton className="size-20 shrink-0 rounded-full" />
 <div className="min-w-0 flex-1">
 <Skeleton className="h-3 w-40" />
 <Skeleton className="mt-3 h-12 w-full max-w-2xl" />
 <div className="mt-4 flex flex-wrap gap-2">
 <Skeleton className="h-7 w-20" />
 <Skeleton className="h-7 w-36" />
 <Skeleton className="h-7 w-40" />
 </div>
 </div>
 </div>
 </section>

 <section className="grid items-start gap-4 md:grid-cols-2">
 <AppPanelSkeleton tone="primary" items={1} />
 <AppPanelSkeleton items={1} />
 </section>

 <section className="rounded-card bg-primary-tint p-5 sm:p-6">
 <Skeleton className="h-8 w-48" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-xl" />
 <div className="mt-5">
 <FormSkeleton fields={4} />
 </div>
 </section>

 <div className="grid items-start gap-6 xl:grid-cols-[1.2fr_0.8fr]">
 <section className="rounded-card bg-surface p-5 sm:p-6">
 <Skeleton className="h-8 w-56" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-lg" />
 <div className="mt-5 grid items-start gap-3 sm:grid-cols-2">
 {Array.from({ length: 8 }).map((_, index) => (
 <ListRowSkeleton key={index} />
 ))}
 </div>
 </section>
 <AppPanelSkeleton tone="accent" items={3} />
 </div>

 <div className="grid items-start gap-6 xl:grid-cols-2">
 <AppPanelSkeleton items={3} />
 <AppPanelSkeleton items={3} />
 </div>

 <section className="rounded-card bg-primary-tint p-5 sm:p-6">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <Skeleton className="h-8 w-56" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-lg" />
 </div>
 <ButtonRowSkeleton />
 </div>
 <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
 {Array.from({ length: 4 }).map((_, index) => (
 <Skeleton key={index} className="h-24 w-full" />
 ))}
 </div>
 </section>
 </RouteLoadingFrame>
 );
}
