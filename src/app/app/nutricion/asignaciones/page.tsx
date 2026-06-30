import { redirect } from "next/navigation";
import { UserRound } from "lucide-react";

import { AppHeader, AppScreen } from "@/components/app/AppScreen";
import { HabitTracker } from "@/components/app/habit-tracker";
import { NutritionClientSelector } from "@/components/app/nutrition-client-selector";
import { NutritionSectionNav } from "@/components/app/nutrition-section-nav";
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

      <NutritionSectionNav active="assignments" canManage={access.canManageNutrition} />

      {habitData.clients.length > 0 && (
        <section className="flex flex-col gap-3 rounded-[22px] border border-border bg-surface p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-extrabold text-charcoal">
            <UserRound className="size-5 text-warm-brown" aria-hidden="true" />
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
