import { AppHeader, AppScreen } from "@/components/app/layouts/AppScreen";
import { HabitTracker } from "@/components/app/domains/nutrition/habit-tracker";
import {
 nutritionSectionTabs,
} from "@/components/app/shared/section-tab-presets";
import { SectionTabs } from "@/components/app/shared/section-tabs";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getNutritionHabitTrackerData } from "@/lib/habits/data";

type HabitosPageProps = {
 searchParams?: Promise<{
 client?: string;
 }>;
};

export const dynamic = "force-dynamic";

export default async function NutritionHabitosPage({
 searchParams,
}: HabitosPageProps) {
 const access = await requireRouteAccess("/app/nutricion");
 const params = await searchParams;
 const habitData = await getNutritionHabitTrackerData(access, params?.client);

 return (
 <AppScreen>
 <AppHeader
 eyebrow={access.isClient ? "Mi nutrición" : "Nutrición"}
 title={access.isClient ? "Hábitos diarios" : "Catálogo de hábitos"}
 description={
 access.isClient
 ? "Marca tus hábitos de lunes a domingo y enfócate en lo que falta hoy."
 : "Crea, edita y administra los hábitos que luego puedes asignar a tus clientas."
 }
 />

 <SectionTabs
 activeId="habits"
 ariaLabel="Secciones de nutricion"
 items={nutritionSectionTabs.filter(
 (item) => !item.adminOnly || access.canManageNutrition,
 )}
 />

 <HabitTracker
 data={habitData}
 isClient={access.isClient}
 showCatalog={!access.isClient}
 showAssignments={false}
 />
 </AppScreen>
 );
}
