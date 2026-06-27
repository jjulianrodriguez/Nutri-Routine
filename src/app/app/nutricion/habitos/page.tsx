import { UserRound } from "lucide-react";

import {
  AppHeader,
  AppScreen,
} from "@/components/app/AppScreen";
import { HabitTracker } from "@/components/app/habit-tracker";
import { NutritionSectionNav } from "@/components/app/nutrition-section-nav";
import { NutritionClientSelector } from "@/components/app/nutrition-client-selector";
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
        eyebrow={access.isClient ? "Mi nutrición" : "Área profesional"}
        title={access.isClient ? "Hábitos diarios" : "Seguimiento y catálogo de hábitos"}
        description={
          access.isClient
            ? "Registra tu cumplimiento de hábitos alimenticios y de salud todos los días de la semana."
            : "Revisa el cumplimiento semanal de tus clientas y administra el catálogo de hábitos."
        }
      />

      <NutritionSectionNav active="habits" canManage={access.canManageNutrition} />

      {!access.isClient && habitData.clients.length > 0 && (
        <section className="rounded-[22px] border border-border bg-surface p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-soft">
          <div className="flex items-center gap-2 text-sm font-extrabold text-charcoal">
            <UserRound className="size-5 text-warm-brown" aria-hidden="true" />
            <span>Filtro de seguimiento por clienta</span>
          </div>
          <NutritionClientSelector
            clients={habitData.clients}
            selectedClientId={habitData.selectedClient?.id ?? ""}
            basePath="/app/nutricion/habitos"
          />
        </section>
      )}

      <HabitTracker
        data={habitData}
        isClient={access.isClient}
        showCatalog={!access.isClient}
        showAssignments={false}
      />
    </AppScreen>
  );
}
