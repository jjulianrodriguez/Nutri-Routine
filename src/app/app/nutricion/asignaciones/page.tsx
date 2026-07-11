import { redirect } from "next/navigation";
import { UserRound } from "lucide-react";

import { AppHeader, AppScreen } from "@/components/app/AppScreen";
import { HabitTracker } from "@/components/app/habit-tracker";
import { NutritionClientSelector } from "@/components/app/nutrition-client-selector";
import {
 nutritionSectionTabs,
} from "@/components/app/section-tab-presets";
import { SectionTabs } from "@/components/app/section-tabs";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getNutritionHabitTrackerData } from "@/lib/habits/data";

type AsignacionesPageProps = {
 searchParams?: Promise<{
 client?: string;
 }>;
};

export const dynamic = "force-dynamic";

export default async function NutritionAsignacionesPage({
 searchParams,
}: AsignacionesPageProps) {
 const access = await requireRouteAccess("/app/nutricion");

 if (access.isClient) {
 redirect("/app/nutricion");
 }

 const params = await searchParams;
 const habitData = await getNutritionHabitTrackerData(access, params?.client);

 return (
 <AppScreen>
 <AppHeader
 eyebrow="Nutrición"
 title="Asignaciones de nutrición"
 description="Define hábitos por clienta con vigencia, días aplicables e impacto claro."
 />

 <SectionTabs
 activeId="assignments"
 ariaLabel="Secciones de nutricion"
 items={nutritionSectionTabs.filter(
 (item) => !item.adminOnly || access.canManageNutrition,
 )}
 />

 {habitData.clients.length > 0 && (
 <section className="flex flex-col gap-3 rounded-[22px] bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
 <UserRound className="size-5 text-muted-foreground" aria-hidden="true" />
 <span>Gestionar asignaciones de la clienta</span>
 </div>
 <NutritionClientSelector
 clients={habitData.clients}
 selectedClientId={habitData.selectedClient?.id ?? ""}
 basePath="/app/nutricion/asignaciones"
 />
 </section>
 )}

 <HabitTracker
 data={habitData}
 isClient={false}
 showCatalog={false}
 showAssignments={true}
 />
 </AppScreen>
 );
}
