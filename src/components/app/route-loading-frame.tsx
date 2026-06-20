import { AppScreen } from "@/components/app/AppScreen";

export function RouteLoadingFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-primary animate-pulse shadow-glow" />
      <AppScreen>{children}</AppScreen>
    </>
  );
}
