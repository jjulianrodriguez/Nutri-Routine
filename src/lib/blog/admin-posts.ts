import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type BlogPostRow = Tables<"blog_posts">;

export type AdminBlogPost = Pick<
  BlogPostRow,
  | "author_id"
  | "category"
  | "content"
  | "created_at"
  | "excerpt"
  | "id"
  | "is_pinned"
  | "published"
  | "title"
  | "updated_at"
> & {
  authorName: string;
};

export async function getAdminBlogPosts(): Promise<AdminBlogPost[]> {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, category, excerpt, content, author_id, published, is_pinned, created_at, updated_at",
    )
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error || !posts) {
    return [];
  }

  const authorIds = Array.from(new Set(posts.map((post) => post.author_id)));
  const { data: authors } =
    authorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", authorIds)
      : { data: [] };
  const authorNames = new Map(
    (authors ?? []).map((author) => [
      author.id,
      author.full_name ?? "Administrador",
    ]),
  );

  return posts.map((post) => ({
    ...post,
    authorName: authorNames.get(post.author_id) ?? "Administrador",
  }));
}
