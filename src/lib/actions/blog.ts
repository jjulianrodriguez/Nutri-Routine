"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import {
 getBlogTextContent,
 sanitizeBlogHtml,
} from "@/lib/blog/content";
import { getCurrentUserAccess } from "@/lib/auth/current-user-access";
import { createClient } from "@/lib/supabase/server";
import {
 blogDeleteSchema,
 blogPinnedSchema,
 blogPostValuesSchema,
 blogVisibilitySchema,
 updateBlogPostValuesSchema,
 type BlogPostValues,
 type UpdateBlogPostValues,
} from "@/lib/validations/blog";

const ADMIN_BLOG_PATH = "/app/blog";
const ADMIN_BLOG_LIST_PATH = "/app/blog/listado";
const PUBLIC_BLOG_PATH = "/blog";

type BlogFieldErrors = Partial<Record<keyof BlogPostValues, string>>;

export type BlogActionResult =
 | {
 id?: string;
 message: string;
 status: "success";
 }
 | {
 fieldErrors?: BlogFieldErrors;
 message: string;
 status: "error";
 };

function getFieldErrors(error: {
 flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
 return Object.fromEntries(
 Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [
 field,
 messages?.[0],
 ]),
 ) as BlogFieldErrors;
}

function slugify(value: string) {
 const slug = value
 .normalize("NFD")
 .replace(/[\u0300-\u036f]/g, "")
 .toLowerCase()
 .replace(/[^a-z0-9]+/g, "-")
 .replace(/^-+|-+$/g, "")
 .slice(0, 190);

 return slug || "blog";
}

function normalizeCategory(value: string) {
 const category = value.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");

 return category.replace(/^./u, (character) =>
 character.toLocaleUpperCase("es"),
 );
}

function createExcerpt(textContent: string) {
 const normalized = textContent.replace(/\s+/g, " ").trim();

 if (normalized.length <= 240) {
 return normalized;
 }

 return `${normalized.slice(0, 237).trimEnd()}...`;
}

function getReadTime(textContent: string) {
 const words = textContent.trim().split(/\s+/).filter(Boolean).length;

 return Math.max(1, Math.ceil(words / 200));
}

type PreparedContent =
 | {
 content: string;
 status: "success";
 textContent: string;
 }
 | {
 result: BlogActionResult;
 status: "error";
 };

function prepareContent(content: string): PreparedContent {
 const safeContent = sanitizeBlogHtml(content);
 const textContent = getBlogTextContent(safeContent);

 if (!textContent) {
 return {
 result: {
 fieldErrors: {
 content: "Escribe el contenido del blog.",
 },
 message: "Revisa los campos marcados.",
 status: "error",
 },
 status: "error",
 };
 }

 if (safeContent.length > 50000) {
 return {
 result: {
 fieldErrors: {
 content: "El contenido no puede superar 50 000 caracteres.",
 },
 message: "Revisa los campos marcados.",
 status: "error",
 },
 status: "error",
 };
 }

 return {
 content: safeContent,
 status: "success",
 textContent,
 };
}

function revalidateBlogPaths(slug?: string) {
 revalidatePath(ADMIN_BLOG_PATH);
 revalidatePath(ADMIN_BLOG_LIST_PATH);
 revalidatePath(PUBLIC_BLOG_PATH);

 if (slug) {
 revalidatePath(`${PUBLIC_BLOG_PATH}/${slug}`);
 }
}

async function getBlogManagerContext() {
 const supabase = await createClient();
 const access = await getCurrentUserAccess();

 if (!access) {
 return {
 error: "Debes iniciar sesión para gestionar blogs.",
 supabase,
 userId: null,
 };
 }

 if (!access.canManageBlogPosts) {
 return {
 error: "No tienes permisos para gestionar blogs.",
 supabase,
 userId: null,
 };
 }

 return {
 error: null,
 supabase,
 userId: access.userId,
 };
}

async function createUniqueSlug(
 supabase: Awaited<ReturnType<typeof createClient>>,
 title: string,
) {
 const baseSlug = slugify(title);
 const { data } = await supabase
 .from("blog_posts")
 .select("id")
 .eq("slug", baseSlug)
 .maybeSingle();

 return data ? `${baseSlug}-${randomUUID().slice(0, 8)}` : baseSlug;
}

export async function createBlogPost(
 values: BlogPostValues,
): Promise<BlogActionResult> {
 const parsed = blogPostValuesSchema.safeParse(values);

 if (!parsed.success) {
 return {
 fieldErrors: getFieldErrors(parsed.error),
 message: "Revisa los campos marcados.",
 status: "error",
 };
 }

 const context = await getBlogManagerContext();

 if (context.error || !context.userId) {
 return {
 message: context.error ?? "No se pudo validar tu cuenta.",
 status: "error",
 };
 }

 const published = parsed.data.published || parsed.data.isPinned;
 const slug = await createUniqueSlug(context.supabase, parsed.data.title);
 const preparedContent = prepareContent(parsed.data.content);

 if (preparedContent.status === "error") {
 return preparedContent.result;
 }

 const { data, error } = await context.supabase
 .from("blog_posts")
 .insert({
 author_id: context.userId,
 category: normalizeCategory(parsed.data.category),
 content: preparedContent.content,
 excerpt: createExcerpt(preparedContent.textContent),
 is_pinned: parsed.data.isPinned,
 published,
 published_at: published ? new Date().toISOString() : null,
 read_time_minutes: getReadTime(preparedContent.textContent),
 slug,
 title: parsed.data.title,
 })
 .select("id")
 .single();

 if (error || !data) {
 return {
 message: "No se pudo crear el blog. Inténtalo de nuevo.",
 status: "error",
 };
 }

 revalidateBlogPaths(slug);

 return {
 id: data.id,
 message: published
 ? "Blog creado y publicado correctamente."
 : "Blog creado como oculto.",
 status: "success",
 };
}

export async function updateBlogPost(
 values: UpdateBlogPostValues,
): Promise<BlogActionResult> {
 const parsed = updateBlogPostValuesSchema.safeParse(values);

 if (!parsed.success) {
 return {
 fieldErrors: getFieldErrors(parsed.error),
 message: "Revisa los campos marcados.",
 status: "error",
 };
 }

 const context = await getBlogManagerContext();

 if (context.error || !context.userId) {
 return {
 message: context.error ?? "No se pudo validar tu cuenta.",
 status: "error",
 };
 }

 const published = parsed.data.published || parsed.data.isPinned;
 const preparedContent = prepareContent(parsed.data.content);

 if (preparedContent.status === "error") {
 return preparedContent.result;
 }

 const { data, error } = await context.supabase
 .from("blog_posts")
 .update({
 category: normalizeCategory(parsed.data.category),
 content: preparedContent.content,
 excerpt: createExcerpt(preparedContent.textContent),
 is_pinned: parsed.data.isPinned,
 published,
 read_time_minutes: getReadTime(preparedContent.textContent),
 title: parsed.data.title,
 })
 .eq("id", parsed.data.id)
 .select("id, slug")
 .maybeSingle();

 if (error || !data) {
 return {
 message: "No se pudo actualizar el blog. Inténtalo de nuevo.",
 status: "error",
 };
 }

 revalidateBlogPaths(data.slug);

 return {
 id: data.id,
 message: "Blog actualizado correctamente.",
 status: "success",
 };
}

export async function updateBlogVisibility(
 id: string,
 published: boolean,
): Promise<BlogActionResult> {
 const parsed = blogVisibilitySchema.safeParse({ id, published });

 if (!parsed.success) {
 return {
 message: "El blog seleccionado no es válido.",
 status: "error",
 };
 }

 const context = await getBlogManagerContext();

 if (context.error || !context.userId) {
 return {
 message: context.error ?? "No se pudo validar tu cuenta.",
 status: "error",
 };
 }

 const { data, error } = await context.supabase
 .from("blog_posts")
 .update({
 is_pinned: published ? undefined : false,
 published,
 })
 .eq("id", parsed.data.id)
 .select("slug")
 .maybeSingle();

 if (error || !data) {
 return {
 message: "No se pudo cambiar la visibilidad del blog.",
 status: "error",
 };
 }

 revalidateBlogPaths(data.slug);

 return {
 message: published ? "Blog visible públicamente." : "Blog ocultado.",
 status: "success",
 };
}

export async function updateBlogPinned(
 id: string,
 isPinned: boolean,
): Promise<BlogActionResult> {
 const parsed = blogPinnedSchema.safeParse({ id, isPinned });

 if (!parsed.success) {
 return {
 message: "El blog seleccionado no es válido.",
 status: "error",
 };
 }

 const context = await getBlogManagerContext();

 if (context.error || !context.userId) {
 return {
 message: context.error ?? "No se pudo validar tu cuenta.",
 status: "error",
 };
 }

 const { data, error } = await context.supabase
 .from("blog_posts")
 .update({
 is_pinned: parsed.data.isPinned,
 published: parsed.data.isPinned ? true : undefined,
 })
 .eq("id", parsed.data.id)
 .select("slug")
 .maybeSingle();

 if (error || !data) {
 return {
 message: "No se pudo cambiar el blog principal.",
 status: "error",
 };
 }

 revalidateBlogPaths(data.slug);

 return {
 message: isPinned
 ? "Blog anclado como principal."
 : "Blog desanclado.",
 status: "success",
 };
}

export async function deleteBlogPost(
 id: string,
): Promise<BlogActionResult> {
 const parsed = blogDeleteSchema.safeParse({ id });

 if (!parsed.success) {
 return {
 message: "El blog seleccionado no es válido.",
 status: "error",
 };
 }

 const context = await getBlogManagerContext();

 if (context.error || !context.userId) {
 return {
 message: context.error ?? "No se pudo validar tu cuenta.",
 status: "error",
 };
 }

 const { data, error } = await context.supabase
 .from("blog_posts")
 .delete()
 .eq("id", parsed.data.id)
 .select("id, slug")
 .maybeSingle();

 if (error || !data) {
 return {
 message: "No se pudo eliminar el blog.",
 status: "error",
 };
 }

 revalidateBlogPaths(data.slug);

 return {
 id: data.id,
 message: "Blog eliminado definitivamente.",
 status: "success",
 };
}
