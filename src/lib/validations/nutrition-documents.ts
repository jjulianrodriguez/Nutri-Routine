import { z } from "zod";

import { NUTRITION_PDF_MAX_SIZE_BYTES } from "@/lib/nutrition-documents/constants";

const optionalDescriptionSchema = z
 .string()
 .trim()
 .max(2000, "La descripcion no puede superar 2000 caracteres.");

export const nutritionDocumentIdSchema = z.object({
 id: z.string().uuid("El documento seleccionado no es valido."),
});

export const nutritionFolderIdSchema = z.object({
 id: z.string().uuid("La carpeta seleccionada no es valida."),
});

export const nutritionFolderValuesSchema = z.object({
 id: z.string().uuid("La carpeta seleccionada no es valida.").optional(),
 name: z
 .string()
 .trim()
 .min(1, "Escribe el nombre de la carpeta.")
 .max(120, "El nombre no puede superar 120 caracteres."),
});

export const mealPlanUploadValuesSchema = z.object({
 clientId: z.string().uuid("Selecciona una clienta valida."),
 description: optionalDescriptionSchema,
 title: z
 .string()
 .trim()
 .min(1, "Escribe el titulo del plan.")
 .max(180, "El titulo no puede superar 180 caracteres."),
});

export const educationalUploadValuesSchema = z.object({
 description: optionalDescriptionSchema,
 folderId: z.string().uuid("Selecciona una carpeta valida."),
 title: z
 .string()
 .trim()
 .min(1, "Escribe el titulo del recurso.")
 .max(180, "El titulo no puede superar 180 caracteres."),
});

export const nutritionDocumentUpdateValuesSchema = z.object({
 description: optionalDescriptionSchema,
 folderId: z.string().uuid("Selecciona una carpeta valida.").optional(),
 id: z.string().uuid("El documento seleccionado no es valido."),
 title: z
 .string()
 .trim()
 .min(1, "Escribe el titulo del documento.")
 .max(180, "El titulo no puede superar 180 caracteres."),
});

export type EducationalUploadValues = z.infer<
 typeof educationalUploadValuesSchema
>;
export type MealPlanUploadValues = z.infer<typeof mealPlanUploadValuesSchema>;
export type NutritionDocumentUpdateValues = z.infer<
 typeof nutritionDocumentUpdateValuesSchema
>;
export type NutritionFolderValues = z.infer<typeof nutritionFolderValuesSchema>;

export function getPdfValidationError(file: File | null) {
 if (!file || file.size === 0) {
 return "Selecciona un archivo PDF.";
 }

 const fileName = file.name.trim().toLowerCase();

 if (!fileName.endsWith(".pdf")) {
 return "Solo se aceptan archivos con extension .pdf.";
 }

 if (file.type !== "application/pdf") {
 return "El archivo debe tener mime type application/pdf.";
 }

 if (file.size > NUTRITION_PDF_MAX_SIZE_BYTES) {
 const maxMegabytes = Math.round(NUTRITION_PDF_MAX_SIZE_BYTES / 1024 / 1024);

 return `El PDF no puede superar ${maxMegabytes} MB.`;
 }

 return null;
}
