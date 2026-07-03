import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
 AppPanelSkeleton,
 FormSkeleton,
 PageHeaderSkeleton,
 SectionNavSkeleton,
 Skeleton,
} from "@/components/ui/skeleton";

export default function ConfiguracionLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />
 <SectionNavSkeleton count={6} />

 <div className="grid items-start gap-6 xl:grid-cols-2">
 <section className="rounded-card bg-surface p-5 sm:p-6">
 <Skeleton className="h-8 w-48" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-lg" />
 <div className="mt-5 rounded-card bg-background p-4">
 <div className="flex items-center gap-4">
 <Skeleton className="size-12 rounded-full" />
 <div className="min-w-0 flex-1">
 <Skeleton className="h-5 w-48" />
 <Skeleton className="mt-2 h-3.5 w-64 max-w-full" />
 </div>
 </div>
 </div>
 <div className="mt-5 grid items-start gap-3 lg:grid-cols-2">
 <AppPanelSkeleton items={1} />
 <AppPanelSkeleton items={1} />
 <AppPanelSkeleton items={1} />
 </div>
 </section>

 <section className="rounded-card bg-surface p-5 sm:p-6">
 <Skeleton className="h-8 w-52" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-lg" />
 <div className="mt-5">
 <FormSkeleton fields={5} />
 </div>
 </section>

 <section className="rounded-card bg-surface p-5 sm:p-6">
 <Skeleton className="h-8 w-36" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-lg" />
 <div className="mt-5">
 <FormSkeleton fields={3} />
 </div>
 </section>

 <AppPanelSkeleton tone="primary" items={2} />
 </div>
 </RouteLoadingFrame>
 );
}
