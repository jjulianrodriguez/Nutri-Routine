import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted-surface", className)}
      {...props}
    />
  );
}

function PageHeaderSkeleton() {
  return (
    <section className="overflow-hidden rounded-card border border-border-soft bg-surface p-6 shadow-card sm:p-8">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-10 w-64 sm:h-12 sm:w-96" />
      <Skeleton className="mt-4 h-6 w-full max-w-2xl" />
    </section>
  );
}

function StatTileSkeleton() {
  return (
    <div className="rounded-card border border-border-soft bg-surface p-5 shadow-soft">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 h-10 w-16" />
      <Skeleton className="mt-4 h-4 w-32" />
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
  tone?: "surface" | "accent" | "primary";
}) {
  return (
    <section
      className={cn(
        "rounded-card border p-5 shadow-soft sm:p-6",
        tone === "surface" && "border-border-soft bg-surface",
        tone === "accent" && "border-secondary/20 bg-accent-soft",
        tone === "primary" && "border-primary/20 bg-primary-soft",
        className
      )}
    >
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: items }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-card bg-background" />
        ))}
      </div>
    </section>
  );
}

function CardGridSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-32 w-full rounded-card border border-border-soft bg-surface shadow-soft"
        />
      ))}
    </div>
  );
}

export {
  Skeleton,
  PageHeaderSkeleton,
  StatTileSkeleton,
  AppPanelSkeleton,
  CardGridSkeleton,
};
