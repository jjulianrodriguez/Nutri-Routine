import { ArrowLeft, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
      title: "Artículo no encontrado · Nutrición Con Enfoque",
    };
  }

  return {
    title: `${post.title} · Nutrición Con Enfoque`,
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
    <article className="px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-charcoal/10 bg-white px-4 py-2.5 text-sm font-bold text-warm-brown shadow-soft"
        >
          <ArrowLeft className="size-4" />
          Todos los artículos
        </Link>

        <header className="mt-10 border-b border-charcoal/10 pb-10 sm:mt-14">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-sage px-4 py-2 text-xs font-bold uppercase text-charcoal">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-warm-brown shadow-soft">
              <Clock className="size-3.5" />
              {post.readTime} de lectura
            </span>
          </div>

          <h1 className="mt-7 font-serif text-[clamp(3.25rem,10vw,7rem)] font-semibold leading-[0.9] text-charcoal">
            {post.title}
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-warm-brown">
            {post.excerpt}
          </p>

          <div className="mt-9 grid gap-3 text-sm text-warm-brown sm:grid-cols-[1fr_auto] sm:items-center">
            <p>
              Por{" "}
              <span className="font-bold text-charcoal">{post.author}</span>
            </p>
            <p>{post.date}</p>
          </div>
        </header>

        <div className="mx-auto mt-12 max-w-[68ch]">
          {post.content.map((paragraph) => (
            <p
              key={paragraph}
              className="mb-7 text-lg leading-9 text-warm-brown"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
