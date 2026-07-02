import { AppHeader, AppScreen } from "@/components/app/AppScreen";
import { ProgressDashboard } from "@/components/app/progress-dashboard";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import {
 getProgressPageData,
 normalizeProgressTab,
} from "@/lib/progress/data";

export const dynamic = "force-dynamic";

type ProgressPageProps = {
 searchParams?: Promise<{
 client?: string;
 tab?: string;
 }>;
};

export default async function ProgressPage({
 searchParams,
}: ProgressPageProps) {
 const access = await requireRouteAccess("/app/progreso");
 const params = await searchParams;
 const activeTab = normalizeProgressTab(params?.tab);
 const data = await getProgressPageData(access, params?.client);

 return (
 <AppScreen>
 <AppHeader
 description={
 access.isClient
 ? "Revisa tu evolucion de nutricion, entrenamiento, habitos y medidas en un solo lugar."
 : "Analiza la evolucion de un cliente por vez con metricas, historial y senales accionables."
 }
 eyebrow={access.isClient ? "Mi progreso" : "Area profesional"}
 title={access.isClient ? "Mi progreso" : "Progreso"}
 />
 <ProgressDashboard access={access} activeTab={activeTab} data={data} />
 </AppScreen>
 );
}
