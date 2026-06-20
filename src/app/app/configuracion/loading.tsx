import { RouteLoadingFrame } from "@/components/app/route-loading-frame";
import { AppPanelSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function ConfiguracionLoading() {
  return (
    <RouteLoadingFrame>
      <PageHeaderSkeleton />
      <div className="grid gap-6 xl:grid-cols-2">
        <AppPanelSkeleton items={1} />
        <AppPanelSkeleton items={2} />
      </div>
    </RouteLoadingFrame>
  );
}
