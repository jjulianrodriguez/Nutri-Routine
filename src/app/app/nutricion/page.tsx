import { Leaf, NotebookTabs, Users } from "lucide-react";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { HabitTracker } from "@/components/app/habit-tracker";
import { NutritionDocumentManager } from "@/components/app/nutrition-document-manager";
import { AssignedProfessionalCards } from "@/components/app/relationship-badges";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getDashboardData } from "@/lib/app/dashboard-data";
import { getNutritionHabitTrackerData } from "@/lib/habits/data";
import { getNutritionDocumentsPageData } from "@/lib/nutrition-documents/data";

type NutritionPageProps = {
  searchParams?: Promise<{
    client?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function NutritionPage({
  searchParams,
}: NutritionPageProps) {
  const access = await requireRouteAccess("/app/nutricion");
  const params = await searchParams;
  const [data, habitData, documentData] = await Promise.all([
    getDashboardData(access),
    getNutritionHabitTrackerData(access, params?.client),
    getNutritionDocumentsPageData(access),
  ]);
  const activeMealPlanCount = documentData.mealPlanDocuments.filter(
    (document) => document.status === "active",
  ).length;
  const activeLibraryCount = documentData.libraryDocuments.filter(
    (document) => document.status === "active",
  ).length;

  return (
    <AppScreen>
      <AppHeader
        eyebrow={access.isClient ? "Mi nutrición" : "Área profesional"}
        title={access.isClient ? "Nutrición" : "Gestión de nutrición"}
        description={
          access.isClient
            ? "Plan alimenticio actual, historial de planes y recursos de nutrición asignados a tu cuenta."
            : "Clientes de nutrición, dietas, planes alimenticios y recursos enviados."
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
        <StatTile
          label="Biblioteca educativa"
          value={String(activeLibraryCount)}
          detail="Recursos PDF activos"
        />
      </section>

      <HabitTracker data={habitData} isClient={access.isClient} />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <AppPanel
          title={access.isClient ? "Plan alimenticio actual" : "Planes alimenticios"}
          description={
            access.isClient
              ? `Aquí encontrarás tu plan vigente${
                  access.assignedNutritionistName
                    ? ` con ${access.assignedNutritionistName}`
                    : ""
                }.`
              : "Crea, revisa y actualiza los planes alimenticios de tus clientes."
          }
        >
          <div className="space-y-4">
            {access.isClient ? (
              <AssignedProfessionalCards
                assignedNutritionistId={access.assignedNutritionistId}
                assignedNutritionistName={access.assignedNutritionistName}
                assignedTrainerId={null}
                assignedTrainerName={null}
              />
            ) : null}
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

        <AppPanel
          title={access.isClient ? "Historial y recursos" : "Clientes y recursos"}
          description={
            access.isClient
              ? "Acceso a planes anteriores y materiales de nutrición."
              : "Herramientas de seguimiento para clientes de nutrición y envío de recursos."
          }
          tone="accent"
        >
          <div className="grid gap-3">
            <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
              <NotebookTabs className="size-5 text-warm-brown" />
              <h3 className="mt-4 font-extrabold text-charcoal">
                {access.isClient ? "Historial de planes" : "Crear y editar dietas"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {access.isClient
                  ? "Solo tus planes alimenticios quedan disponibles en esta vista."
                  : "Disponible para profesionales autorizados en nutrición."}
              </p>
            </div>
            {!access.isClient ? (
              <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
                <Users className="size-5 text-warm-brown" />
                <h3 className="mt-4 font-extrabold text-charcoal">
                  Clientes de nutrición
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Solo se muestran los clientes asignados a tu área de nutrición.
                </p>
              </div>
            ) : null}
          </div>
        </AppPanel>
      </div>

      <NutritionDocumentManager
        canManage={access.canManageNutrition}
        clients={documentData.clients}
        folders={documentData.folders}
        libraryDocuments={documentData.libraryDocuments}
        mealPlanDocuments={documentData.mealPlanDocuments}
      />
    </AppScreen>
  );
}
