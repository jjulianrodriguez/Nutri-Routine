"use client";

import { FileText, Plus } from "lucide-react";

import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";

import {
 ClientMealPlanSummary,
 CurrentMealPlanCard,
 NutritionDocumentCard,
} from "./nutrition-document-manager/document-cards";
import {
 DocumentEditForm,
 MealPlanUploadForm,
} from "./nutrition-document-manager/document-forms";
import { useNutritionDocumentManager } from "./nutrition-document-manager/hooks/use-nutrition-document-manager";
import type { NutritionDocumentManagerProps } from "./nutrition-document-manager/types";

export function NutritionDocumentManager({
 canManage,
 clients,
 mealPlanDocuments,
 professionalName = null,
}: NutritionDocumentManagerProps) {
 const manager = useNutritionDocumentManager(mealPlanDocuments);

 if (!canManage) {
  return (
   <div className="space-y-6">
    <CurrentMealPlanCard document={manager.activeMealPlans[0] ?? null} professionalName={professionalName} />
   </div>
  );
 }

 return (
  <div className="space-y-6">
   {manager.editingDocument ? <DocumentEditForm document={manager.editingDocument} onCancel={() => manager.setEditingDocument(null)} /> : null}

   <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
    <section className="h-fit self-start rounded-[28px] bg-surface p-5 sm:p-6">
     <div className="flex items-center gap-3">
      <div className="grid size-11 place-items-center rounded-[16px] bg-primary-soft text-muted-foreground"><Plus className="size-5" aria-hidden="true" /></div>
      <div><h2 className="text-2xl font-bold text-foreground">Subir plan de alimentación</h2><p className="mt-1 text-sm leading-6 text-muted">Al subir uno nuevo para una clienta se desactiva el PDF activo anterior.</p></div>
     </div>
     <div className="mt-5"><MealPlanUploadForm clients={clients} /></div>
    </section>
    <ClientMealPlanSummary clients={clients} />
   </div>

   <section className="h-fit self-start rounded-[28px] bg-surface p-5 sm:p-6">
    <div className="flex items-center gap-3">
     <div className="grid size-11 place-items-center rounded-[16px] bg-secondary-soft text-muted-foreground"><FileText className="size-5" aria-hidden="true" /></div>
     <div><h2 className="text-2xl font-bold text-foreground">Planes cargados</h2><p className="mt-1 text-sm leading-6 text-muted">Planes alimenticios con estado, fecha y asignación.</p></div>
    </div>
    <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">
     {mealPlanDocuments.length > 0 ? mealPlanDocuments.map((document) => (
      <NutritionDocumentCard
       key={document.id}
       canManage
       document={document}
       onDeactivate={(selected) => manager.setConfirmation({ document: selected, type: "deactivate-document" })}
       onActivate={(selected) => manager.setConfirmation({ document: selected, type: "activate-document" })}
       onDelete={(selected) => manager.setConfirmation({ document: selected, type: "delete-document" })}
       onEdit={manager.setEditingDocument}
      />
     )) : (
      <div className="h-fit self-start rounded-[22px] bg-background px-5 py-12 text-center lg:col-span-2">
       <p className="font-extrabold text-foreground">Todavía no hay documentos PDF cargados.</p>
       <p className="mt-2 text-sm leading-6 text-muted">Sube un plan de alimentación y asígnalo a una clienta para que quede visible.</p>
      </div>
     )}
    </div>
   </section>

   <ConfirmationDialog
    open={Boolean(manager.confirmation)}
    onOpenChange={(open) => { if (!open) manager.setConfirmation(null); }}
    title={manager.dialog.confirmTitle}
    description={manager.dialog.confirmDescription}
    confirmLabel={manager.dialog.confirmLabel}
    pendingLabel={manager.dialog.pendingLabel}
    tone={manager.dialog.confirmTone}
    onConfirm={manager.confirmAction}
   />
  </div>
 );
}
