"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
 activateNutritionDocument,
 deactivateNutritionDocument,
 deleteNutritionDocument,
} from "@/lib/actions/nutrition-documents";
import type { NutritionDocumentRecord } from "@/lib/nutrition-documents/types";

import type { NutritionDocumentConfirmation } from "../types";

export function useNutritionDocumentManager(mealPlanDocuments: NutritionDocumentRecord[]) {
 const router = useRouter();
 const [editingDocument, setEditingDocument] = useState<NutritionDocumentRecord | null>(null);
 const [confirmation, setConfirmation] = useState<NutritionDocumentConfirmation | null>(null);
 const activeMealPlans = mealPlanDocuments.filter((document) => document.status === "active");

 async function confirmAction() {
  if (!confirmation) return;

  const result = confirmation.type === "deactivate-document"
   ? await deactivateNutritionDocument(confirmation.document.id)
   : confirmation.type === "activate-document"
     ? await activateNutritionDocument(confirmation.document.id)
     : await deleteNutritionDocument(confirmation.document.id);

  if (result.status === "error") {
   toast.error(result.message);
   return;
  }
  toast.success(result.message);
  router.refresh();
 }

 const dialog = {
  confirmDescription: "",
  confirmLabel: "",
  confirmTitle: "",
  confirmTone: "default" as "default" | "destructive",
  pendingLabel: "",
 };

 if (confirmation?.type === "deactivate-document") {
  dialog.confirmTitle = "Desactivar documento";
  dialog.confirmDescription = `El documento "${confirmation.document.title}" dejará de estar disponible para las clientas.`;
  dialog.confirmLabel = "Desactivar";
  dialog.pendingLabel = "Desactivando...";
  dialog.confirmTone = "destructive";
 } else if (confirmation?.type === "activate-document") {
  dialog.confirmTitle = "Activar documento";
  dialog.confirmDescription = `El documento "${confirmation.document.title}" volverá a estar disponible para las clientas.`;
  dialog.confirmLabel = "Activar";
  dialog.pendingLabel = "Activando...";
 } else if (confirmation?.type === "delete-document") {
  dialog.confirmTitle = "Eliminar documento";
  dialog.confirmDescription = `Se eliminará permanentemente el documento "${confirmation.document.title}" y su archivo PDF. Esta acción no se puede deshacer.`;
  dialog.confirmLabel = "Eliminar permanentemente";
  dialog.pendingLabel = "Eliminando...";
  dialog.confirmTone = "destructive";
 }

 return {
  activeMealPlans,
  confirmation,
  confirmAction,
  dialog,
  editingDocument,
  setConfirmation,
  setEditingDocument,
 };
}
