import { z } from "zod";

import { hasBlogTextContent } from "@/lib/blog/content";

export const blogPostValuesSchema = z.object({
 category: z
 .string()
 .trim()
 .min(1, "Escribe o selecciona una categoría.")
 .max(80, "La categoría no puede superar 80 caracteres."),
 content: z
 .string()
 .trim()
 .min(1, "Escribe el contenido del blog.")
 .max(50000, "El contenido no puede superar 50 000 caracteres.")
 .refine(hasBlogTextContent, "Escribe el contenido del blog."),
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
 id: z.string().uuid("El blog seleccionado no es válido."),
 }),
);

export const blogVisibilitySchema = z.object({
 id: z.string().uuid("El blog seleccionado no es válido."),
 published: z.boolean(),
});

export const blogPinnedSchema = z.object({
 id: z.string().uuid("El blog seleccionado no es válido."),
 isPinned: z.boolean(),
});

export const blogDeleteSchema = z.object({
 id: z.string().uuid("El blog seleccionado no es válido."),
});

export type BlogPostValues = z.infer<typeof blogPostValuesSchema>;
export type UpdateBlogPostValues = z.infer<typeof updateBlogPostValuesSchema>;
