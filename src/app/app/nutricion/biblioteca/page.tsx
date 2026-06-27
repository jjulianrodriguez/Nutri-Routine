import {
  AppHeader,
  AppScreen,
  StatTile,
} from "@/components/app/AppScreen";
import { NutritionDocumentManager } from "@/components/app/nutrition-document-manager";
import { NutritionSectionNav } from "@/components/app/nutrition-section-nav";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getNutritionDocumentsPageData } from "@/lib/nutrition-documents/data";

export const dynamic = "force-dynamic";

export default async function EducationalLibraryPage() {
  const access = await requireRouteAccess("/app/nutricion");
  const documentData = await getNutritionDocumentsPageData(access);
  const activeLibraryCount = documentData.libraryDocuments.filter(
    (document) => document.status === "active",
  ).length;

  return (
    <AppScreen>
      <AppHeader
        eyebrow={access.isClient ? "Mi nutrición" : "Área profesional"}
        title={access.isClient ? "Biblioteca educativa" : "Gestión de biblioteca educativa"}
        description={
          access.isClient
            ? "Materiales de lectura, infografías y recursos de nutrición organizados por categorías."
            : "Administración de carpetas, temas y recursos PDF educativos para tus clientes."
        }
      />

      <NutritionSectionNav active="library" canManage={access.canManageNutrition} />

      <section className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label="Carpetas"
          value={String(documentData.folders.length)}
          detail="Categorías disponibles"
        />
        <StatTile
          label="Recursos educativos"
          value={String(activeLibraryCount)}
          detail="PDFs activos cargados"
        />
      </section>

      <NutritionDocumentManager
        canManage={access.canManageNutrition}
        clients={documentData.clients}
        folders={documentData.folders}
        libraryDocuments={documentData.libraryDocuments}
        mealPlanDocuments={documentData.mealPlanDocuments}
        viewMode="library"
      />
    </AppScreen>
  );
}
