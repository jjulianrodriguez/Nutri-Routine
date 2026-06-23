import { z } from "zod";

const resourceAreaSchema = z.enum(["nutrition", "training", "general"]);

const externalResourceUrlSchema = z
  .string()
  .trim()
  .min(1, "Escribe la URL del recurso.")
  .max(2048, "La URL no puede superar 2048 caracteres.")
  .url("Escribe una URL completa y válida.")
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
    .max(2000, "La descripción no puede superar 2000 caracteres."),
  title: z
    .string()
    .trim()
    .min(1, "Escribe un titulo.")
    .max(180, "El titulo no puede superar 180 caracteres."),
  url: externalResourceUrlSchema,
});

export const updateResourceValuesSchema = resourceValuesSchema.and(
  z.object({
    id: z.string().uuid("El recurso seleccionado no es válido."),
  }),
);

export const resourceDeleteSchema = z.object({
  id: z.string().uuid("El recurso seleccionado no es válido."),
});

export type ResourceValues = z.infer<typeof resourceValuesSchema>;
export type UpdateResourceValues = z.infer<
  typeof updateResourceValuesSchema
>;
