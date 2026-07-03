import { cn } from "@/lib/utils";

function Skeleton({
 className,
 ...props
}: React.HTMLAttributes<HTMLDivElement>) {
 return (
 <div
 aria-hidden="true"
 className={cn("animate-pulse rounded-control bg-muted-surface", className)}
 {...props}
 />
 );
}

function SkeletonTextStack({
 className,
 lines = 2,
 widths = ["w-56", "w-72"],
}: {
 className?: string;
 lines?: number;
 widths?: string[];
}) {
 return (
 <div className={cn("space-y-2", className)}>
 {Array.from({ length: lines }).map((_, index) => (
 <Skeleton
 key={index}
 className={cn("h-3.5 max-w-full", widths[index] ?? widths[widths.length - 1])}
 />
 ))}
 </div>
 );
}

function PageHeaderSkeleton() {
 return (
 <section className="h-fit self-start p-6 sm:p-8" aria-busy="true">
 <Skeleton className="h-3 w-28" />
 <Skeleton className="mt-4 h-11 w-full max-w-3xl sm:h-12" />
 <SkeletonTextStack
 className="mt-4"
 widths={["w-full max-w-2xl", "w-full max-w-xl"]}
 />
 </section>
 );
}

function SectionNavSkeleton({ count = 4 }: { count?: number }) {
 return (
 <nav className="flex flex-wrap gap-2" aria-busy="true">
 {Array.from({ length: count }).map((_, index) => (
 <Skeleton
 key={index}
 className={cn("h-11", index === 0 ? "w-36" : "w-32")}
 />
 ))}
 </nav>
 );
}

function StatTileSkeleton() {
 return (
 <div className="h-fit self-start rounded-card bg-surface p-5" aria-busy="true">
 <Skeleton className="h-3.5 w-32" />
 <Skeleton className="mt-3 h-10 w-20" />
 <Skeleton className="mt-4 h-3.5 w-40" />
 </div>
 );
}

function ButtonRowSkeleton({
 align = "start",
 className,
 count = 2,
}: {
 align?: "end" | "start";
 className?: string;
 count?: number;
}) {
 return (
 <div
 className={cn(
 "flex flex-wrap gap-2",
 align === "end" && "justify-end",
 className,
 )}
 >
 {Array.from({ length: count }).map((_, index) => (
 <Skeleton key={index} className={cn("h-10", index === 0 ? "w-36" : "w-28")} />
 ))}
 </div>
 );
}

function SearchFilterSkeleton({
 fields = 3,
 withButton = true,
}: {
 fields?: number;
 withButton?: boolean;
}) {
 return (
 <div className="rounded-card bg-background p-4" aria-busy="true">
 <Skeleton className="h-12 w-full" />
 <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
 {Array.from({ length: fields }).map((_, index) => (
 <div key={index}>
 <Skeleton className="h-3 w-20" />
 <Skeleton className="mt-2 h-11 w-full" />
 </div>
 ))}
 </div>
 {withButton ? <ButtonRowSkeleton className="mt-4" /> : null}
 </div>
 );
}

function PanelHeaderSkeleton({
 action = false,
 eyebrow = false,
}: {
 action?: boolean;
 eyebrow?: boolean;
}) {
 return (
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div className="min-w-0 flex-1">
 {eyebrow ? <Skeleton className="h-3 w-28" /> : null}
 <Skeleton className={cn("h-8 w-56", eyebrow && "mt-2")} />
 <Skeleton className="mt-2 h-3.5 w-full max-w-lg" />
 </div>
 {action ? <Skeleton className="h-10 w-32 shrink-0" /> : null}
 </div>
 );
}

function AppPanelSkeleton({
 className,
 items = 2,
 tone = "surface",
}: {
 className?: string;
 items?: number;
 tone?: "surface" | "accent" | "primary" | "warm";
}) {
 return (
 <section
 aria-busy="true"
 className={cn(
 "h-fit self-start rounded-card p-5 sm:p-6",
 tone === "surface" && "bg-surface",
 tone === "accent" && "bg-secondary-soft",
 tone === "primary" && "bg-primary-soft",
 tone === "warm" && "bg-surface-muted",
 className,
 )}
 >
 <PanelHeaderSkeleton />
 <div className="mt-5 space-y-3">
 {Array.from({ length: items }).map((_, index) => (
 <ListRowSkeleton key={index} />
 ))}
 </div>
 </section>
 );
}

function ListRowSkeleton({
 avatar = false,
 action = false,
 className,
}: {
 action?: boolean;
 avatar?: boolean;
 className?: string;
}) {
 return (
 <div
 className={cn(
 "rounded-card bg-background p-4",
 action && "sm:flex sm:items-center sm:justify-between sm:gap-4",
 className,
 )}
 >
 <div className="flex min-w-0 items-start gap-3">
 {avatar ? <Skeleton className="size-11 shrink-0 rounded-full" /> : null}
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap gap-2">
 <Skeleton className="h-5 w-32" />
 <Skeleton className="h-5 w-20" />
 </div>
 <Skeleton className="mt-3 h-4 w-full max-w-md" />
 <Skeleton className="mt-2 h-3.5 w-48" />
 </div>
 </div>
 {action ? <Skeleton className="mt-4 h-10 w-28 sm:mt-0" /> : null}
 </div>
 );
}

function CardGridSkeleton({
 className,
 count = 4,
 variant = "content",
}: {
 className?: string;
 count?: number;
 variant?: "content" | "feature";
}) {
 return (
 <div className={cn("grid items-start gap-4", className)}>
 {Array.from({ length: count }).map((_, index) => (
 <article
 key={index}
 className="h-fit self-start rounded-card bg-background p-4"
 aria-busy="true"
 >
 <div className="flex items-start gap-3">
 <Skeleton className="size-11 shrink-0 rounded-full" />
 <div className="min-w-0 flex-1">
 <Skeleton className="h-5 w-40" />
 <Skeleton className="mt-2 h-3.5 w-full max-w-sm" />
 </div>
 </div>
 {variant === "feature" ? (
 <>
 <SkeletonTextStack className="mt-4" widths={["w-full", "w-4/5"]} />
 <Skeleton className="mt-5 h-10 w-36" />
 </>
 ) : (
 <div className="mt-4 flex flex-wrap gap-2">
 <Skeleton className="h-6 w-24" />
 <Skeleton className="h-6 w-28" />
 </div>
 )}
 </article>
 ))}
 </div>
 );
}

function FormSkeleton({
 fields = 4,
 textarea = false,
}: {
 fields?: number;
 textarea?: boolean;
}) {
 return (
 <div className="space-y-4" aria-busy="true">
 {Array.from({ length: fields }).map((_, index) => (
 <div key={index}>
 <Skeleton className="h-4 w-28" />
 <Skeleton className="mt-2 h-11 w-full" />
 </div>
 ))}
 {textarea ? (
 <div>
 <Skeleton className="h-4 w-32" />
 <Skeleton className="mt-2 h-28 w-full" />
 </div>
 ) : null}
 <ButtonRowSkeleton />
 </div>
 );
}

export {
 AppPanelSkeleton,
 ButtonRowSkeleton,
 CardGridSkeleton,
 FormSkeleton,
 ListRowSkeleton,
 PageHeaderSkeleton,
 PanelHeaderSkeleton,
 SearchFilterSkeleton,
 SectionNavSkeleton,
 Skeleton,
 SkeletonTextStack,
 StatTileSkeleton,
};
