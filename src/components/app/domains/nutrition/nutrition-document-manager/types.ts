import type {
 NutritionDocumentClientRecord,
 NutritionDocumentRecord,
} from "@/lib/nutrition-documents/types";

export type NutritionDocumentManagerProps = {
 canManage: boolean;
 clients: NutritionDocumentClientRecord[];
 mealPlanDocuments: NutritionDocumentRecord[];
 professionalName?: string | null;
};

export type NutritionDocumentFieldErrorMap = Record<string, string | undefined>;

export type NutritionDocumentConfirmation = {
 document: NutritionDocumentRecord;
 type: "deactivate-document" | "activate-document" | "delete-document";
};
