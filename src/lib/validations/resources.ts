import { z } from "zod";

import { RESOURCE_PDF_MAX_SIZE_BYTES } from "@/lib/resources/constants";

const resourceAreaSchema = z.enum(["nutrition", "training", "general"]);
const optionalFolderIdSchema = z
 .string()
 .trim()
 .uuid("Selecciona una carpeta valida.")
 .optional()
 .or(z.literal("").transform(() => undefined));

const externalResourceUrlSchema = z
 .string()
 .trim()
 .min(1, "Escribe la URL del recurso.")
 .max(2048, "La URL no puede superar 2048 caracteres.")
 .url("Escribe una URL completa y valida.")
 .refine((value) => {
 const url = new URL(value);
 const hostname = url.hostname.toLowerCase();

 return (
 (url.protocol === "https:" || url.protocol === "http:") &&
 !url.username &&
 !url.password &&
 hostname !== "localhost" &&
 hostname !== "127.0.0.1" &&
 hostname !== "::1" &&
 !hostname.endsWith(".local")
 );
 }, "Usa una URL externa HTTP o HTTPS sin credenciales.");

export const resourceValuesSchema = z.object({
 area: resourceAreaSchema,
 description: z
 .string()
 .trim()
 .max(2000, "La descripcion no puede superar 2000 caracteres."),
 folderId: optionalFolderIdSchema,
 title: z
 .string()
 .trim()
 .min(1, "Escribe un titulo.")
 .max(180, "El titulo no puede superar 180 caracteres."),
 url: externalResourceUrlSchema,
});

export const updateResourceValuesSchema = resourceValuesSchema.and(
 z.object({
 id: z.string().uuid("El recurso seleccionado no es valido."),
 }),
);

export const resourceFolderValuesSchema = z.object({
 area: resourceAreaSchema,
 description: z
 .string()
 .trim()
 .max(500, "La descripcion no puede superar 500 caracteres."),
 id: z.string().uuid("La carpeta seleccionada no es valida.").optional(),
 name: z
 .string()
 .trim()
 .min(1, "Escribe el nombre de la carpeta.")
 .max(120, "El nombre no puede superar 120 caracteres."),
});

export const updateResourceFolderValuesSchema = resourceFolderValuesSchema.and(
 z.object({
 id: z.string().uuid("La carpeta seleccionada no es valida."),
 }),
);

export const pdfResourceUploadValuesSchema = z.object({
 area: resourceAreaSchema,
 description: z
 .string()
 .trim()
 .max(2000, "La descripcion no puede superar 2000 caracteres."),
 folderId: optionalFolderIdSchema,
 title: z
 .string()
 .trim()
 .min(1, "Escribe el titulo del PDF.")
 .max(180, "El titulo no puede superar 180 caracteres."),
});

export const pdfResourceUpdateValuesSchema = pdfResourceUploadValuesSchema.and(
 z.object({
 id: z.string().uuid("El recurso seleccionado no es valido."),
 }),
);

export const resourceDeleteSchema = z.object({
 id: z.string().uuid("El recurso seleccionado no es valido."),
});

export const resourceSignedUrlSchema = z.object({
 download: z.boolean().optional(),
 id: z.string().uuid("El recurso seleccionado no es valido."),
});

export type PdfResourceUpdateValues = z.infer<
 typeof pdfResourceUpdateValuesSchema
>;
export type PdfResourceUploadValues = z.infer<
 typeof pdfResourceUploadValuesSchema
>;
export type ResourceFolderValues = z.infer<typeof resourceFolderValuesSchema>;
export type ResourceValues = z.infer<typeof resourceValuesSchema>;
export type UpdateResourceFolderValues = z.infer<
 typeof updateResourceFolderValuesSchema
>;
export type UpdateResourceValues = z.infer<
 typeof updateResourceValuesSchema
>;

export function getResourcePdfValidationError(file: File | null) {
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

 if (file.size > RESOURCE_PDF_MAX_SIZE_BYTES) {
 const maxMegabytes = Math.round(RESOURCE_PDF_MAX_SIZE_BYTES / 1024 / 1024);

 return `El PDF no puede superar ${maxMegabytes} MB.`;
 }

 return null;
}
