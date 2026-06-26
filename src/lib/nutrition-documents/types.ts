import type { Enums } from "@/types/database";

export type NutritionDocumentRecord = {
  clientId: string | null;
  clientName: string | null;
  createdAt: string;
  createdBy: string;
  createdByName: string | null;
  description: string | null;
  documentType: Enums<"nutrition_document_type">;
  fileName: string;
  fileSize: number;
  folderId: string | null;
  folderName: string | null;
  id: string;
  status: Enums<"nutrition_document_status">;
  title: string;
  updatedAt: string;
};

export type NutritionDocumentFolderRecord = {
  active: boolean;
  createdAt: string;
  documentCount: number;
  id: string;
  name: string;
  updatedAt: string;
};

export type NutritionDocumentClientRecord = {
  assignedNutritionistId: string | null;
  currentMealPlan: NutritionDocumentRecord | null;
  id: string;
  name: string;
};

export type NutritionDocumentsPageData = {
  clients: NutritionDocumentClientRecord[];
  documents: NutritionDocumentRecord[];
  folders: NutritionDocumentFolderRecord[];
  libraryDocuments: NutritionDocumentRecord[];
  mealPlanDocuments: NutritionDocumentRecord[];
};
