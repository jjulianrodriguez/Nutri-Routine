"use client";

import { Eye, EyeOff, Pencil, Pin, PinOff, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { CardActionsMenu } from "@/components/app/shared/card-actions-menu";
import { Button } from "@/components/ui/actions/button";

import { formatBlogDate } from "./helpers";
import type { BlogManagerViewModel } from "./hooks/use-blog-manager";

export function BlogLibrarySection({ manager }: { manager: BlogManagerViewModel }) {
 return (
  <section className="min-w-0 rounded-[28px] bg-surface p-5 sm:p-6">
   <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">Biblioteca</p><h2 className="mt-2 text-3xl font-semibold text-foreground">Blogs creados</h2></div>
    <Button asChild variant="outline" className="w-full sm:w-auto"><Link href="/blog" target="_blank" rel="noreferrer"><Eye className="size-4" aria-hidden="true" />Ver blog público</Link></Button>
   </div>

   {manager.initialPosts.length > 0 ? (
    <div className="mt-6 space-y-4">
     {manager.initialPosts.map((post) => (
      <article key={post.id} className="rounded-[22px] bg-background p-4 sm:p-5">
       <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
         <span className={["inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold", post.published ? "bg-success/10 text-success" : "bg-surface-muted text-muted-foreground"].join(" ")}>
          {post.published ? <Eye className="size-3" aria-hidden="true" /> : <EyeOff className="size-3" aria-hidden="true" />}{post.published ? "Publicado" : "Oculto"}
         </span>
         {post.is_pinned ? <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-primary-foreground"><Pin className="size-3" aria-hidden="true" />Anclado</span> : null}
        </div>
        <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
         <Button type="button" variant="outline" size="sm" onClick={() => manager.startEditing(post)}><Pencil className="size-3.5" aria-hidden="true" />Editar</Button>
         <CardActionsMenu label={post.title} items={[
          ...(post.published && post.slug ? [{ external: true, href: `/blog/${post.slug}`, icon: Eye, label: "Ver publicado" }] : []),
          { icon: post.published ? EyeOff : Eye, label: post.published ? "Ocultar" : "Mostrar", onSelect: () => manager.setConfirmation({ post, type: "visibility" }) },
          { icon: post.is_pinned ? PinOff : Pin, label: post.is_pinned ? "Desanclar" : "Anclar", onSelect: () => manager.setConfirmation({ post, type: "pinned" }) },
          { destructive: true, icon: Trash2, label: "Eliminar", onSelect: () => manager.setConfirmation({ post, type: "delete" }), separatorBefore: true },
         ]} />
        </div>
       </div>
       <h3 className="mt-4 text-2xl font-semibold leading-tight text-foreground">{post.title}</h3>
       <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{post.excerpt}</p>
       <span className="mt-4 inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-muted-foreground">{post.category}</span>
       <dl className="mt-4 grid gap-2 text-xs font-bold text-muted-foreground sm:grid-cols-2">
        <div><dt className="text-muted">Autor</dt><dd className="mt-1">{post.authorName}</dd></div>
        <div><dt className="text-muted">Actualizado</dt><dd className="mt-1">{formatBlogDate(post.updated_at)}</dd></div>
       </dl>
      </article>
     ))}
    </div>
   ) : (
    <div className="mt-6 rounded-[22px] bg-background px-5 py-12 text-center">
     <p className="font-extrabold text-foreground">Todavia no hay blogs publicados.</p>
     <p className="mt-2 text-sm leading-6 text-muted">Crea el primer blog y decide si queda publicado, oculto o anclado.</p>
     <Button asChild className="mt-5"><Link href="/app/blog"><Plus className="size-4" aria-hidden="true" />Crear primer blog</Link></Button>
    </div>
   )}
  </section>
 );
}
