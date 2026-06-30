import { CalendarCheck2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { NutritionDocumentManager } from "@/components/app/nutrition-document-manager";
import { NutritionSectionNav } from "@/components/app/nutrition-section-nav";
import { Button } from "@/components/ui/button";
import { getDashboardData } from "@/lib/app/dashboard-data";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getNutritionHabitTrackerData } from "@/lib/habits/data";
import {
  isAssignmentApplicableOnDate,
  type NutritionHabitTrackerData,
} from "@/lib/habits/utils";
import { getNutritionDocumentsPageData } from "@/lib/nutrition-documents/data";

export const dynamic = "force-dynamic";

function ClientTodayHabits({
  habitData,
}: {
  habitData: NutritionHabitTrackerData;
}) {
  const activeAssignments = habitData.assignments.filter(
    (assignment) => assignment.active,
  );
  const todayAssignments = activeAssignments.filter((assignment) =>
    isAssignmentApplicableOnDate(assignment, habitData.today),
  );
  const pendingToday = todayAssignments.filter(
    (assignment) => !assignment.progressByDate[habitData.today]?.completed,
  );

  let emptyTitle = "No tienes hábitos asignados.";
  let emptyDescription =
    "Cuando tu nutricionista active hábitos, aquí verás qué toca cada día.";

  if (activeAssignments.length > 0 && todayAssignments.length === 0) {
    emptyTitle = "Hoy no hay hábitos programados.";
    emptyDescription =
      "Tu semana sigue visible en Hábitos, pero hoy no tienes marcas pendientes.";
  }

  return (
    <AppPanel
      title="Qué falta hoy"
      description="Tus hábitos de hoy, separados del historial para que sea fácil actuar."
      tone="primary"
    >
      {todayAssignments.length === 0 ? (
        <EmptyState>
          <span className="block font-extrabold text-charcoal">
            {emptyTitle}
          </span>
          <span className="mt-1 block">{emptyDescription}</span>
        </EmptyState>
      ) : pendingToday.length === 0 ? (
        <div className="flex flex-col gap-4 rounded-[22px] border border-primary/25 bg-background p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-[16px] bg-primary-soft text-charcoal">
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-extrabold text-charcoal">
                Todo listo por hoy.
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Marcaste los {todayAssignments.length} hábitos que aplican hoy.
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/app/nutricion/habitos">Ver semana</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-[22px] border border-border bg-background p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-[16px] bg-primary-soft text-warm-brown">
                <CalendarCheck2 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-extrabold text-charcoal">
                  Te faltan {pendingToday.length} de {todayAssignments.length} hábitos.
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Marca lo que ya completaste para actualizar tu progreso.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/app/nutricion/habitos">Marcar hábitos</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingToday.slice(0, 4).map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-[18px] border border-border bg-background px-4 py-3"
              >
                <p className="font-extrabold text-charcoal">
                  {assignment.habit.title}
                </p>
                {assignment.habit.description ? (
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">
                    {assignment.habit.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </AppPanel>
  );
}

export default async function NutritionPage() {
  const access = await requireRouteAccess("/app/nutricion");
  const [documentData, habitData, dashboardData] = await Promise.all([
    getNutritionDocumentsPageData(access),
    access.isClient ? getNutritionHabitTrackerData(access) : Promise.resolve(null),
    access.isClient ? Promise.resolve(null) : getDashboardData(access),
  ]);
  const activeMealPlanCount = documentData.mealPlanDocuments.filter(
    (document) => document.status === "active",
  ).length;

  return (
    <AppScreen>
      <AppHeader
        eyebrow={access.isClient ? "Mi nutrición" : "Nutrición"}
        title={access.isClient ? "Plan de alimentación" : "Gestión de planes alimenticios"}
        description={
          access.isClient
            ? "Tu plan vigente y lo que tienes pendiente hoy, sin mezclarlo con historial."
            : "Sube, actualiza y revisa PDFs activos por clienta."
        }
      />

      <NutritionSectionNav active="plan" canManage={access.canManageNutrition} />

      {access.isClient ? null : (
        <section className="grid gap-4 sm:grid-cols-2">
          <StatTile
            label="Clientas de nutrición"
            value={String(dashboardData?.assignedClientsCount ?? 0)}
            detail="Según tus asignaciones actuales"
          />
          <StatTile
            label="Planes alimenticios"
            value={String(activeMealPlanCount)}
            detail="PDFs activos disponibles"
          />
        </section>
      )}

      <NutritionDocumentManager
        canManage={access.canManageNutrition}
        clients={documentData.clients}
        mealPlanDocuments={documentData.mealPlanDocuments}
        professionalName={access.assignedNutritionistName}
      />

      {access.isClient && habitData ? (
        <ClientTodayHabits habitData={habitData} />
      ) : null}
    </AppScreen>
  );
}
