import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
 FormSkeleton,
 PageHeaderSkeleton,
 Skeleton,
} from "@/components/ui/skeleton";

export default function BlogLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />

 <section className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-surface p-5">
 <div>
 <Skeleton className="h-5 w-48" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-lg" />
 </div>
 <div className="flex flex-wrap gap-2">
 <Skeleton className="h-10 w-36" />
 <Skeleton className="h-10 w-32" />
 </div>
 </section>

 <section className="rounded-card bg-surface p-5 sm:p-6">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <Skeleton className="h-3 w-32" />
 <Skeleton className="mt-2 h-9 w-48" />
 </div>
 <Skeleton className="h-9 w-36" />
 </div>
 <div className="mt-6">
 <FormSkeleton fields={2} textarea />
 <Skeleton className="mt-5 h-72 w-full" />
 </div>
 </section>
 </RouteLoadingFrame>
 );
}
