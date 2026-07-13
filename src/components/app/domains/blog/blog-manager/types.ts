import type { AdminBlogPost } from "@/lib/blog/admin-posts";
import type { BlogPostValues } from "@/lib/validations/blog";

export type BlogManagerProps = {
 initialPosts?: AdminBlogPost[];
 mode?: "create" | "manage";
};

export type BlogConfirmation =
 | { post: AdminBlogPost; type: "delete" | "pinned" | "visibility" }
 | { post: AdminBlogPost; type: "update"; values: BlogPostValues };

export type BlogSaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";
