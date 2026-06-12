"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

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

function createExcerpt(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= 240) {
    return normalized;
  }

  return `${normalized.slice(0, 237).trimEnd()}...`;
}

function getReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

function revalidateBlogPaths(slug?: string) {
  revalidatePath(ADMIN_BLOG_PATH);
  revalidatePath(PUBLIC_BLOG_PATH);

  if (slug) {
    revalidatePath(`${PUBLIC_BLOG_PATH}/${slug}`);
  }
}

async function getBlogAdminContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: "Debes iniciar sesion para administrar blogs.",
      supabase,
      user: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return {
      error: "No tienes permisos de administrador para gestionar blogs.",
      supabase,
      user: null,
    };
  }

  return {
    error: null,
    supabase,
    user,
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

  const context = await getBlogAdminContext();

  if (context.error || !context.user) {
    return {
      message: context.error ?? "No se pudo validar tu cuenta.",
      status: "error",
    };
  }

  const published = parsed.data.published || parsed.data.isPinned;
  const slug = await createUniqueSlug(context.supabase, parsed.data.title);

  const { data, error } = await context.supabase
    .from("blog_posts")
    .insert({
      author_id: context.user.id,
      category: normalizeCategory(parsed.data.category),
      content: parsed.data.content,
      excerpt: createExcerpt(parsed.data.content),
      is_pinned: parsed.data.isPinned,
      published,
      published_at: published ? new Date().toISOString() : null,
      read_time_minutes: getReadTime(parsed.data.content),
      slug,
      title: parsed.data.title,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      message: "No se pudo crear el blog. Intentalo de nuevo.",
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

  const context = await getBlogAdminContext();

  if (context.error || !context.user) {
    return {
      message: context.error ?? "No se pudo validar tu cuenta.",
      status: "error",
    };
  }

  const published = parsed.data.published || parsed.data.isPinned;
  const { data, error } = await context.supabase
    .from("blog_posts")
    .update({
      category: normalizeCategory(parsed.data.category),
      content: parsed.data.content,
      excerpt: createExcerpt(parsed.data.content),
      is_pinned: parsed.data.isPinned,
      published,
      read_time_minutes: getReadTime(parsed.data.content),
      title: parsed.data.title,
    })
    .eq("id", parsed.data.id)
    .select("id, slug")
    .maybeSingle();

  if (error || !data) {
    return {
      message: "No se pudo actualizar el blog. Intentalo de nuevo.",
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
      message: "El blog seleccionado no es valido.",
      status: "error",
    };
  }

  const context = await getBlogAdminContext();

  if (context.error || !context.user) {
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
    message: published ? "Blog visible publicamente." : "Blog ocultado.",
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
      message: "El blog seleccionado no es valido.",
      status: "error",
    };
  }

  const context = await getBlogAdminContext();

  if (context.error || !context.user) {
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
      message: "El blog seleccionado no es valido.",
      status: "error",
    };
  }

  const context = await getBlogAdminContext();

  if (context.error || !context.user) {
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
