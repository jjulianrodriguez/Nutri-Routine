import { getPdfValidationError } from "@/lib/validations/nutrition-documents";

export function formatNutritionDocumentDate(value: string) {
 return new Intl.DateTimeFormat("es-CR", {
  dateStyle: "medium",
  timeZone: "America/Costa_Rica",
 }).format(new Date(value));
}

export function formatNutritionFileSize(bytes: number) {
 if (bytes < 1024 * 1024) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
 }
 return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function readNutritionPdfError(formData: FormData, required: boolean) {
 const value = formData.get("file");
 if (value instanceof File && value.size > 0) return getPdfValidationError(value);
 return required ? "Selecciona un archivo PDF." : null;
}
