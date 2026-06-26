import { ArrowLeft, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
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
      title: "Artículo no encontrado · Poner nombre",
    };
  }

  return {
    title: `${post.title} · Poner nombre`,
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
    <article className="relative overflow-hidden px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_6%,rgb(231_197_138_/_0.26),transparent_28rem),radial-gradient(circle_at_86%_16%,rgb(247_230_212_/_0.82),transparent_34rem)]" />
      <div className="relative mx-auto max-w-5xl">
        <Link
          href="/blog"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--blog-night)]/10 bg-[rgb(255_252_248_/_0.62)] px-4 py-2.5 text-sm font-black text-[var(--blog-night)] shadow-[0_18px_48px_-38px_rgb(75_53_53_/_0.2)] backdrop-blur-xl transition-colors hover:border-[var(--blog-clay)]/30 hover:bg-[rgb(255_252_248_/_0.78)]"
        >
          <ArrowLeft className="size-4" />
          Todos los artículos
        </Link>

        <header className="mt-10 overflow-hidden rounded-[2.4rem] border border-[var(--blog-night)]/10 bg-[rgb(255_252_248_/_0.48)] p-5 shadow-[0_40px_120px_-86px_rgb(75_53_53_/_0.28)] backdrop-blur-2xl sm:mt-14 sm:p-7">
          <div className="relative overflow-hidden rounded-[1.8rem] border border-[var(--blog-night)]/8 bg-[var(--blog-paper)] p-6 sm:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[var(--blog-mint)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-10 size-64 rounded-full bg-[var(--blog-rose)] blur-3xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[var(--blog-sage)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--blog-night)]">
                  {post.category}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--blog-night)]/10 bg-[rgb(255_252_248_/_0.62)] px-4 py-2 text-xs font-black text-[var(--blog-muted)] shadow-[0_14px_38px_-30px_rgb(75_53_53_/_0.2)] backdrop-blur-xl">
                  <Clock className="size-3.5" />
                  {post.readTime} de lectura
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-landing-display)",
                  fontWeight: 500,
                }}
                className="mt-7 max-w-4xl text-[clamp(3.6rem,10vw,7.6rem)] leading-[0.82] tracking-[-0.04em] text-[var(--blog-night)]"
              >
                {post.title}
              </h1>

              <p className="mt-7 max-w-2xl text-lg font-bold leading-8 text-[var(--blog-muted)]">
                {post.excerpt}
              </p>

              <div className="mt-9 grid gap-3 border-t border-[var(--blog-night)]/10 pt-6 text-sm font-bold text-[var(--blog-muted)] sm:grid-cols-[1fr_auto] sm:items-center">
                <p>
                  Por{" "}
                  <span className="font-black text-[var(--blog-night)]">
                    {post.author}
                  </span>
                </p>
                <p>{post.date}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto mt-12 max-w-[68ch] rounded-[2rem] border border-[var(--blog-night)]/8 bg-[rgb(255_252_248_/_0.6)] p-6 shadow-[0_34px_96px_-78px_rgb(75_53_53_/_0.2)] backdrop-blur-xl sm:p-10">
          <BlogContentRenderer content={post.content} />
        </div>
      </div>
    </article>
  );
}
