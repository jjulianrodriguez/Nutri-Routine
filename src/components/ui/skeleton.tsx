import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
}

function PageHeaderSkeleton() {
  return (
    <section className="overflow-hidden rounded-[32px] border border-border bg-surface/82 p-6 shadow-card backdrop-blur-xl sm:p-8">
      <Skeleton className="h-4 w-24 bg-muted/20" />
      <Skeleton className="mt-4 h-10 w-64 bg-charcoal/10 sm:h-12 sm:w-96" />
      <Skeleton className="mt-4 h-6 w-full max-w-2xl bg-warm-brown/10" />
    </section>
  );
}

function StatTileSkeleton() {
  return (
    <div className="rounded-[24px] border border-border bg-surface/82 p-5 shadow-soft backdrop-blur-lg">
      <Skeleton className="h-4 w-28 bg-muted/20" />
      <Skeleton className="mt-3 h-10 w-16 bg-charcoal/10" />
      <Skeleton className="mt-4 h-4 w-32 bg-warm-brown/10" />
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
        "rounded-[28px] border p-5 shadow-soft backdrop-blur-lg sm:p-6",
        tone === "surface" && "border-border bg-surface/82",
        tone === "accent" && "border-primary/20 bg-accent-soft/75",
        tone === "primary" && "border-primary/30 bg-primary-soft/70",
        className
      )}
    >
      <Skeleton className="h-8 w-48 bg-charcoal/10" />
      <Skeleton className="mt-2 h-4 w-64 bg-muted/20" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: items }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-[20px] bg-background/50" />
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
          className="h-32 w-full rounded-[20px] border border-border bg-surface/82 shadow-soft backdrop-blur-lg"
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
