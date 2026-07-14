"use client";

import { ArrowUpRight, BookOpen, Clock, Pin } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { BlogPost } from "@/lib/blog/posts";

type BlogListProps = {
 posts: BlogPost[];
};

export function BlogList({ posts }: BlogListProps) {
 const [activeCategory, setActiveCategory] = useState("Todos");
 const categories = useMemo(
 () => ["Todos", ...Array.from(new Set(posts.map((post) => post.category)))],
 [posts],
 );
 const visiblePosts = useMemo(
 () =>
 activeCategory === "Todos"
 ? posts
 : posts.filter((post) => post.category === activeCategory),
 [activeCategory, posts],
 );

 if (posts.length === 0) {
 return (
 <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-6 py-16 text-center shadow-sm flex flex-col items-center gap-1">
 <BookOpen
 className="mx-auto size-9 text-[var(--brand)]"
 aria-hidden="true"
 />
 <h2 className="mt-5 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
 Pronto habrá nuevas lecturas
 </h2>
 <p className="mx-auto mt-3 max-w-xl leading-7 text-[var(--muted-foreground)]">
 Los artículos publicados por Mariana y Camila aparecerán aquí.
 </p>
 </div>
 );
 }

 return (
 <div>
 <div
 className="flex gap-2 overflow-x-auto pb-2"
 aria-label="Filtrar artículos por categoría"
 >
 {categories.map((category) => {
 const isActive = category === activeCategory;

 return (
 <button
 key={category}
 type="button"
 aria-pressed={isActive}
 onClick={() => setActiveCategory(category)}
 className={[
 "min-h-11 shrink-0 cursor-pointer rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]",
 isActive
 ? "bg-[var(--brand)] text-[var(--primary-foreground)]"
 : "border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--muted-foreground)] hover:border-[var(--brand)] hover:text-[var(--brand)]",
 ].join(" ")}
 >
 {category}
 </button>
 );
 })}
 </div>

 {visiblePosts.length > 0 ? (
 <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
 {visiblePosts.map((post, index) => {
 const isFeatured = index === 0;

 return (
 <article
 key={post.slug}
 className={[
 "group rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-2 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg",
 isFeatured ? "lg:col-span-2" : "",
 ].join(" ")}
 >
 <Link
 href={`/blog/${post.slug}`}
 className="flex h-full flex-col rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]"
 >
 <div className="relative flex min-h-44 items-start justify-between overflow-hidden rounded-xl bg-[var(--primary-soft)] p-5 sm:min-h-52 sm:p-6">
 <div className="absolute -bottom-16 -right-12 size-48 rounded-full bg-[var(--secondary-soft)]" />
 <div className="relative flex flex-wrap gap-2">
 <span className="rounded-md bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--brand)] shadow-sm">
 {post.category}
 </span>
 {post.isPinned ? (
 <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--secondary)] shadow-sm">
 <Pin className="size-3" aria-hidden="true" />
 Destacado
 </span>
 ) : null}
 </div>
 <span className="relative grid size-11 place-items-center rounded-md bg-[var(--brand)] text-[var(--primary-foreground)] shadow-lg">
 <BookOpen className="size-5" aria-hidden="true" />
 </span>
 </div>

 <div className="flex flex-1 flex-col px-4 pb-5 pt-5 sm:px-5 sm:pb-6">
 <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-[var(--muted-foreground)]">
 <span>{post.date}</span>
 <span className="inline-flex items-center gap-1.5">
 <Clock className="size-3.5" aria-hidden="true" />
 {post.readTime} de lectura
 </span>
 </div>
 <h2
 className={[
 "mt-4 font-bold leading-tight text-[var(--foreground)]",
 isFeatured ? "text-2xl sm:text-3xl" : "text-2xl",
 ].join(" ")}
 >
 {post.title}
 </h2>
 <p className="mt-3 line-clamp-3 leading-7 text-[var(--muted-foreground)]">
 {post.excerpt}
 </p>
 <div className="mt-auto flex items-center justify-between gap-4 pt-7">
 <span className="text-sm font-semibold text-[var(--text-secondary)]">
 {post.author}
 </span>
 <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)]">
 Leer artículo
 <ArrowUpRight
 className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
 aria-hidden="true"
 />
 </span>
 </div>
 </div>
 </Link>
 </article>
 );
 })}
 </div>
 ) : (
 <div className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-6 py-12 text-center">
 <p className="font-semibold text-[var(--muted-foreground)]">
 No hay artículos publicados en esta categoría todavía.
 </p>
 </div>
 )}
 </div>
 );
}
