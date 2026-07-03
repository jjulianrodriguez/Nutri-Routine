import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
 AppPanelSkeleton,
 ButtonRowSkeleton,
 CardGridSkeleton,
 FormSkeleton,
 PageHeaderSkeleton,
 SectionNavSkeleton,
 Skeleton,
 StatTileSkeleton,
} from "@/components/ui/skeleton";

type TrainingLoadingVariant =
 | "assignments"
 | "exercises"
 | "overview"
 | "routines"
 | "templates";

function TrainingStats({ count = 4 }: { count?: 3 | 4 }) {
 return (
 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 {Array.from({ length: count }).map((_, index) => (
 <StatTileSkeleton key={index} />
 ))}
 </section>
 );
}

function TrainingOverviewLoading() {
 return (
 <>
 <TrainingStats />
 <CardGridSkeleton
 count={4}
 variant="feature"
 className="md:grid-cols-2 xl:grid-cols-4"
 />
 </>
 );
}

function TrainingLibraryLoading({
 stats = 4,
}: {
 stats?: 3 | 4;
}) {
 return (
 <>
 <div className="flex justify-end">
 <Skeleton className="h-12 w-44" />
 </div>
 <TrainingStats count={stats} />
 <section className="rounded-card bg-surface p-5 sm:p-6">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <Skeleton className="h-8 w-60" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-xl" />
 </div>
 <ButtonRowSkeleton align="end" count={1} />
 </div>
 <CardGridSkeleton count={4} className="mt-5 lg:grid-cols-2" />
 </section>
 </>
 );
}

function TrainingExercisesLoading() {
 return (
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
 );
}

function TrainingAssignmentsLoading() {
 return (
 <>
 <TrainingStats count={3} />
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
 </>
 );
}

export function TrainingLoadingState({
 variant = "overview",
}: {
 variant?: TrainingLoadingVariant;
}) {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />
 <SectionNavSkeleton count={5} />

 {variant === "overview" ? <TrainingOverviewLoading /> : null}
 {variant === "routines" ? <TrainingLibraryLoading stats={3} /> : null}
 {variant === "templates" ? <TrainingLibraryLoading /> : null}
 {variant === "exercises" ? <TrainingExercisesLoading /> : null}
 {variant === "assignments" ? <TrainingAssignmentsLoading /> : null}
 </RouteLoadingFrame>
 );
}
