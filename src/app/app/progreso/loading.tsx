import { RouteLoadingFrame } from "@/components/app/route-loading-frame";

function SkeletonBox({ className = "" }: { className?: string }) {
 return (
 <div
 className={`animate-pulse rounded-2xl bg-surface/80 ${className}`}
 />
 );
}

export default function ProgressLoading() {
 return (
 <RouteLoadingFrame>
 <SkeletonBox className="h-56 rounded-[32px]" />
 <SkeletonBox className="h-24" />
 <div className="grid gap-3 sm:grid-cols-4">
 <SkeletonBox className="h-14" />
 <SkeletonBox className="h-14" />
 <SkeletonBox className="h-14" />
 <SkeletonBox className="h-14" />
 </div>
 <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
 <SkeletonBox className="h-32" />
 <SkeletonBox className="h-32" />
 <SkeletonBox className="h-32" />
 <SkeletonBox className="h-32" />
 </section>
 <section className="grid gap-5 lg:grid-cols-2">
 <SkeletonBox className="h-80 rounded-[28px]" />
 <SkeletonBox className="h-80 rounded-[28px]" />
 </section>
 </RouteLoadingFrame>
 );
}
