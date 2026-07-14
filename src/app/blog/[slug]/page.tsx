import { ArrowLeft, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogContentRenderer } from "@/components/app/domains/blog/BlogContentRenderer";
import { getPostBySlug } from "@/lib/blog/posts";

type BlogPostPageProps = {
 params: Promise<{
 slug: string;
 }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
 params,
}: BlogPostPageProps): Promise<Metadata> {
 const { slug } = await params;
 const post = await getPostBySlug(slug);

 if (!post) {
 return {
 title: "Artículo no encontrado",
 };
 }

 return {
 title: post.title,
 description: post.excerpt,
 };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
 const { slug } = await params;
 const post = await getPostBySlug(slug);

 if (!post) {
 notFound();
 }

 return (
 <article className="bg-[var(--surface-muted)] px-6 py-12 sm:py-16 md:py-20">
 <div className="mx-auto max-w-5xl">
 <Link
 href="/blog"
 className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--muted-foreground)] transition-colors duration-200 hover:border-[var(--brand)] hover:text-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
 >
 <ArrowLeft className="size-4" aria-hidden="true" />
 Todos los artículos
 </Link>

 <header className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-6 py-10 shadow-sm sm:px-10 sm:py-14">
 <div className="flex flex-wrap items-center gap-3">
 <span className="rounded-md bg-[var(--primary-soft)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
 {post.category}
 </span>
 <span className="inline-flex items-center gap-2 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)]">
 <Clock className="size-3.5" aria-hidden="true" />
 {post.readTime} de lectura
 </span>
 </div>

 <h1 className="mt-7 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl">
 {post.title}
 </h1>

 <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)] md:text-xl">
 {post.excerpt}
 </p>

 <div className="mt-9 grid gap-3 border-t border-[var(--border-soft)] pt-6 text-sm font-semibold text-[var(--muted-foreground)] sm:grid-cols-[1fr_auto] sm:items-center">
 <p>
 Por{" "}
 <span className="font-bold text-[var(--foreground)]">
 {post.author}
 </span>
 </p>
 <p>{post.date}</p>
 </div>
 </header>

 <div className="mx-auto mt-8 max-w-[68ch] rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-sm sm:p-10">
 <BlogContentRenderer content={post.content} />
 </div>
 </div>
 </article>
 );
}
