import { BookOpenText, Eye, EyeOff, Pin } from "lucide-react";
import { redirect } from "next/navigation";

import { AppHeader, AppScreen, StatTile } from "@/components/app/AppScreen";
import { BlogManager } from "@/components/app/blog-manager";
import { requireCurrentUserAccess } from "@/lib/auth/current-user-access";
import { getAdminBlogPosts } from "@/lib/blog/admin-posts";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const access = await requireCurrentUserAccess();

  if (access.role !== "admin") {
    redirect("/app/dashboard");
  }

  const posts = await getAdminBlogPosts();
  const visiblePosts = posts.filter((post) => post.published).length;
  const hiddenPosts = posts.length - visiblePosts;
  const pinnedPost = posts.find((post) => post.is_pinned);

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Contenido"
        title="Blogs de texto"
        description="Crea, edita, oculta y ancla las publicaciones visibles en el blog publico."
      />

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumen de blogs"
      >
        <StatTile
          label="Total"
          value={String(posts.length)}
          detail="Blogs creados"
        />
        <StatTile
          label="Visibles"
          value={String(visiblePosts)}
          detail="Publicados actualmente"
        />
        <StatTile
          label="Ocultos"
          value={String(hiddenPosts)}
          detail="Fuera del blog publico"
        />
        <div className="rounded-[24px] border border-primary/30 bg-primary-soft p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-bold text-muted">
            {pinnedPost ? (
              <Pin className="size-4" aria-hidden="true" />
            ) : (
              <BookOpenText className="size-4" aria-hidden="true" />
            )}
            Principal
          </div>
          <p className="mt-3 line-clamp-2 font-serif text-2xl font-semibold leading-tight text-charcoal">
            {pinnedPost?.title ?? "Sin blog anclado"}
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm font-bold text-warm-brown">
            {pinnedPost ? (
              <Eye className="size-4" aria-hidden="true" />
            ) : (
              <EyeOff className="size-4" aria-hidden="true" />
            )}
            {pinnedPost ? "Visible y destacado" : "Puedes anclar uno"}
          </p>
        </div>
      </section>

      <BlogManager initialPosts={posts} />
    </AppScreen>
  );
}
