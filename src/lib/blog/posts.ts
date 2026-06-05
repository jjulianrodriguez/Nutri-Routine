import { cache } from "react";

import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string[];
  author: string;
  category: string;
  date: string;
  readTime: string;
};

type BlogPostRow = Tables<"blog_posts">;

const FALLBACK_AUTHOR = "Nutricion Con Enfoque";

function formatPostDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function splitContent(content: string) {
  return content
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function mapBlogPost(post: BlogPostRow): BlogPost {
  return {
    author: FALLBACK_AUTHOR,
    category: post.category,
    content: splitContent(post.content),
    date: formatPostDate(post.published_at ?? post.created_at),
    excerpt: post.excerpt,
    readTime: `${post.read_time_minutes} min`,
    slug: post.slug,
    title: post.title,
  };
}

export const getPublishedBlogPosts = cache(async () => {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, content, author_id, category, published_at, read_time_minutes, published, created_at",
    )
    .eq("published", true)
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []).map(mapBlogPost);
});

export const getPostBySlug = cache(async (slug: string) => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, content, author_id, category, published_at, read_time_minutes, published, created_at",
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapBlogPost(data);
});
