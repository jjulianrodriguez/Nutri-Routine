import { Eye, LibraryBig } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppHeader, AppScreen } from "@/components/app/AppScreen";
import { BlogManager } from "@/components/app/blog-manager";
import { Button } from "@/components/ui/button";
import { requireCurrentUserAccess } from "@/lib/auth/current-user-access";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const access = await requireCurrentUserAccess();

  if (access.role !== "admin") {
    redirect("/app/dashboard");
  }

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Contenido"
        title="Crear blog"
        description="Escribe una nueva publicacion con el editor visual y decide si queda oculta, visible o anclada."
      />

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-border bg-surface p-5 shadow-soft">
        <div>
          <p className="text-sm font-extrabold text-charcoal">
            Biblioteca separada
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            El listado y la edicion de publicaciones viven en una pantalla
            dedicada.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/app/blog/listado">
              <LibraryBig className="size-4" aria-hidden="true" />
              Ver blogs creados
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/blog" target="_blank" rel="noreferrer">
              <Eye className="size-4" aria-hidden="true" />
              Ver blog publico
            </Link>
          </Button>
        </div>
      </section>

      <BlogManager mode="create" />
    </AppScreen>
  );
}
