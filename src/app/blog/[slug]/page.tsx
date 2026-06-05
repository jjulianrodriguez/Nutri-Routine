import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { blogPosts } from "@/lib/blog/posts";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  
  if (!post) {
    return { title: "Post no encontrado" };
  }

  return {
    title: \`\${post.title} · Nutrición Con Enfoque\`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-[65ch]">
        <Link 
          href="/blog" 
          className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-stone transition-colors hover:text-terracotta"
        >
          <ArrowLeft className="size-4" />
          Todos los artículos
        </Link>
        
        <header className="mb-14 flex flex-col items-start border-b border-stone-soft pb-10">
          <p className="mb-5 rounded-full bg-terracotta-soft px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-terracotta">
            {post.category}
          </p>
          <h1 className="font-serif text-4xl font-bold leading-[1.1] text-espresso sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          
          <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-stone text-sm">
            <p className="font-semibold text-espresso">Por {post.author}</p>
            <div className="flex gap-4">
              <p>{post.date}</p>
              <p>·</p>
              <p>{post.readTime} de lectura</p>
            </div>
          </div>
        </header>

        <div 
          className="mx-auto mt-12 text-lg leading-relaxed text-stone [&>h2]:mb-6 [&>h2]:mt-14 [&>h2]:font-serif [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-espresso [&>p]:mb-6 [&>ul]:mb-6 [&>ul]:list-outside [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-3 [&>ul>li::marker]:text-terracotta [&>strong]:font-bold [&>strong]:text-espresso"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
