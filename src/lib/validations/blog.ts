import { z } from "zod";

export const blogPostValuesSchema = z.object({
  category: z
    .string()
    .trim()
    .min(1, "Escribe o selecciona una categoria.")
    .max(80, "La categoria no puede superar 80 caracteres."),
  content: z
    .string()
    .trim()
    .min(1, "Escribe el contenido del blog.")
    .max(50000, "El contenido no puede superar 50 000 caracteres."),
  isPinned: z.boolean(),
  published: z.boolean(),
  title: z
    .string()
    .trim()
    .min(1, "Escribe un titulo.")
    .max(180, "El titulo no puede superar 180 caracteres."),
});

export const updateBlogPostValuesSchema = blogPostValuesSchema.and(
  z.object({
    id: z.string().uuid("El blog seleccionado no es valido."),
  }),
);

export const blogVisibilitySchema = z.object({
  id: z.string().uuid("El blog seleccionado no es valido."),
  published: z.boolean(),
});

export const blogPinnedSchema = z.object({
  id: z.string().uuid("El blog seleccionado no es valido."),
  isPinned: z.boolean(),
});

export const blogDeleteSchema = z.object({
  id: z.string().uuid("El blog seleccionado no es valido."),
});

export type BlogPostValues = z.infer<typeof blogPostValuesSchema>;
export type UpdateBlogPostValues = z.infer<typeof updateBlogPostValuesSchema>;
