import { Leaf } from "lucide-react";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { NutritionDocumentManager } from "@/components/app/nutrition-document-manager";
import { NutritionSectionNav } from "@/components/app/nutrition-section-nav";
import { AssignedProfessionalCards } from "@/components/app/relationship-badges";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getDashboardData } from "@/lib/app/dashboard-data";
import { getNutritionDocumentsPageData } from "@/lib/nutrition-documents/data";



export const dynamic = "force-dynamic";

export default async function NutritionPage() {
  const access = await requireRouteAccess("/app/nutricion");
  const [data, documentData] = await Promise.all([
    getDashboardData(access),
    getNutritionDocumentsPageData(access),
  ]);
  const activeMealPlanCount = documentData.mealPlanDocuments.filter(
    (document) => document.status === "active",
  ).length;

  return (
    <AppScreen>
      <AppHeader
        eyebrow={access.isClient ? "Mi nutrición" : "Área profesional"}
        title={access.isClient ? "Plan de alimentación" : "Gestión de planes alimenticios"}
        description={
          access.isClient
            ? "Plan alimenticio actual, historial de planes y recursos de nutrición asignados a tu cuenta."
            : "Clientes de nutrición, dietas, planes alimenticios y recursos enviados."
        }
      />

      <NutritionSectionNav active="plan" canManage={access.canManageNutrition} />

      <section className="grid gap-4 sm:grid-cols-2">
        {access.isClient ? (
          <StatTile
            label="Planes visibles"
            value={String(data.dietPlansCount)}
            detail="Según tu asignación de nutrición"
          />
        ) : (
          <StatTile
            label="Clientes de nutrición"
            value={String(data.assignedClientsCount)}
            detail="Asignados a tu perfil"
          />
        )}
        <StatTile
          label="Planes alimenticios"
          value={String(activeMealPlanCount)}
          detail="PDFs activos disponibles"
        />
      </section>

      {access.isClient ? (
        <AppPanel
          title="Plan alimenticio actual"
          description={`Aquí encontrarás tu plan vigente${
            access.assignedNutritionistName
              ? ` con ${access.assignedNutritionistName}`
              : ""
          }.`}
        >
          <div className="space-y-4">
            <AssignedProfessionalCards
              assignedNutritionistId={access.assignedNutritionistId}
              assignedNutritionistName={access.assignedNutritionistName}
              assignedTrainerId={null}
              assignedTrainerName={null}
            />
            {data.currentDietPlan ? (
              <article className="rounded-[20px] border border-border bg-background p-4">
                <Leaf className="size-5 text-warm-brown" />
                <h2 className="mt-4 font-extrabold text-charcoal">
                  {data.currentDietPlan.title}
                </h2>
                {data.currentDietPlan.detail ? (
                  <p className="mt-2 text-sm text-muted">
                    {data.currentDietPlan.detail}
                  </p>
                ) : null}
              </article>
            ) : (
              <EmptyState>No hay planes alimenticios visibles por ahora.</EmptyState>
            )}
          </div>
        </AppPanel>
      ) : null}

      <NutritionDocumentManager
        canManage={access.canManageNutrition}
        clients={documentData.clients}
        folders={documentData.folders}
        libraryDocuments={documentData.libraryDocuments}
        mealPlanDocuments={documentData.mealPlanDocuments}
        viewMode="plan"
      />
    </AppScreen>
  );
}
