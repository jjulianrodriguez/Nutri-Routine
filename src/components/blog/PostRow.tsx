"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import type { BlogPost } from "@/lib/blog/posts";

type PostRowProps = {
  post: BlogPost;
  index: number;
};

export function PostRow({ post, index }: PostRowProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 0.72, 0.18, 1] }}
      className="group relative border-t border-stone-soft py-10 transition-colors hover:bg-sand-soft/40 sm:py-14"
    >
      <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">Leer {post.title}</span>
      </Link>
      
      <div className="mx-auto grid max-w-4xl gap-6 px-5 sm:grid-cols-[1fr_2.5fr] sm:gap-10 sm:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold tracking-wider text-terracotta uppercase">
            {post.category}
          </p>
          <div className="mt-auto flex flex-col gap-1 text-sm text-stone sm:pt-4">
            <p>{post.date}</p>
            <p>{post.readTime} de lectura</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-serif text-2xl font-bold leading-snug text-espresso transition-colors group-hover:text-terracotta sm:text-3xl lg:text-4xl">
            {post.title}
          </h2>
          <p className="text-base leading-relaxed text-stone-hover sm:text-lg">
            {post.excerpt}
          </p>
          <p className="mt-2 text-sm font-semibold text-espresso">
            Por {post.author}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
