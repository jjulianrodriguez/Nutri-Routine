import { Eye, LibraryBig } from "lucide-react";
import Link from "next/link";

import { AppHeader, AppScreen } from "@/components/app/AppScreen";
import { BlogManager } from "@/components/app/blog-manager";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  await requireRouteAccess("/app/blog");

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Contenido"
        title="Crear blog"
        description="Escribe una nueva publicación con el editor visual y decide si queda oculta, visible o anclada."
      />

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-border bg-surface p-5 shadow-soft">
        <div>
          <p className="text-sm font-extrabold text-foreground">
            Gestionar publicaciones
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Revisa blogs existentes, cambia su visibilidad o vuelve a editar
            contenido guardado.
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
              Ver blog público
            </Link>
          </Button>
        </div>
      </section>

      <BlogManager mode="create" />
    </AppScreen>
  );
}
