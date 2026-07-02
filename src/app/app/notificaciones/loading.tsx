import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import {
 AppPanelSkeleton,
 PageHeaderSkeleton,
 StatTileSkeleton,
} from "@/components/ui/skeleton";

export default function NotificationsLoading() {
 return (
 <RouteLoadingFrame>
 <PageHeaderSkeleton />
 <p className="rounded-[20px] bg-surface/82 px-4 py-3 text-sm font-semibold text-muted ">
 Cargando tus notificaciones...
 </p>
 <section className="grid gap-4 sm:grid-cols-3">
 <StatTileSkeleton />
 <StatTileSkeleton />
 <StatTileSkeleton />
 </section>
 <AppPanelSkeleton items={5} />
 </RouteLoadingFrame>
 );
}
