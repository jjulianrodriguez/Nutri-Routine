import { BookOpenText, Eye, EyeOff, PenLine, Pin } from "lucide-react";
import Link from "next/link";

import { AppHeader, AppScreen, StatTile } from "@/components/app/AppScreen";
import { BlogManager } from "@/components/app/blog-manager";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getAdminBlogPosts } from "@/lib/blog/admin-posts";

export const dynamic = "force-dynamic";

export default async function AdminBlogListPage() {
  await requireRouteAccess("/app/blog");

  const posts = await getAdminBlogPosts();
  const visiblePosts = posts.filter((post) => post.published).length;
  const hiddenPosts = posts.length - visiblePosts;
  const pinnedPost = posts.find((post) => post.is_pinned);

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Contenido"
        title="Blogs creados"
        description="Revisa, edita, oculta, ancla o elimina las publicaciones del blog."
      />

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-border bg-surface p-5 shadow-soft">
        <div>
          <p className="text-sm font-extrabold text-charcoal">
            Gestión de publicaciones
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Desde aqui puedes editar cualquier blog existente o volver al editor
            para crear uno nuevo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/app/blog">
              <PenLine className="size-4" aria-hidden="true" />
              Crear blog
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/blog" target="_blank" rel="noreferrer">
              <Eye className="size-4" aria-hidden="true" />
              Ver blog público
            </Link>
          </Button>
        </div>
      </section>

      <section
        className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4"
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
          detail="Fuera del blog público"
        />
        <div className="h-fit self-start rounded-[24px] border border-primary/30 bg-primary-soft p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-bold text-muted">
            {pinnedPost ? (
              <Pin className="size-4" aria-hidden="true" />
            ) : (
              <BookOpenText className="size-4" aria-hidden="true" />
            )}
            Anclado
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
            {pinnedPost ? "Publicado y anclado" : "Puedes anclar uno"}
          </p>
        </div>
      </section>

      <BlogManager initialPosts={posts} mode="manage" />
    </AppScreen>
  );
}
