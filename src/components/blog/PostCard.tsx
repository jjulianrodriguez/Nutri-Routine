"use client";

import { ArrowUpRight, Pin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import type { BlogPost } from "@/lib/blog/posts";

type PostCardProps = {
  index: number;
  post: BlogPost;
  variant?: "featured" | "default";
};

export function PostCard({ index, post, variant = "default" }: PostCardProps) {
  const reduceMotion = useReducedMotion();
  const isFeatured = variant === "featured";

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{
        delay: reduceMotion ? 0 : index * 0.055,
        duration: 0.58,
        ease: [0.22, 0.72, 0.18, 1],
      }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      className={[
        "group relative overflow-hidden rounded-[24px] border border-charcoal/10 bg-white shadow-soft",
        isFeatured ? "min-h-full p-6 sm:p-8" : "p-5 sm:p-6",
      ].join(" ")}
    >
      <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">Leer {post.title}</span>
      </Link>

      <div className="pointer-events-none absolute -right-14 -top-16 size-40 rounded-full bg-sage/35" />
      <div className="pointer-events-none absolute -bottom-20 left-8 size-36 rounded-full bg-blush/40" />

      <div className="relative z-0 flex h-full flex-col">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cream px-3 py-1.5 text-xs font-bold text-warm-brown">
              {post.category}
            </span>
            {post.isPinned ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage px-3 py-1.5 text-xs font-bold text-charcoal">
                <Pin className="size-3" aria-hidden="true" />
                Principal
              </span>
            ) : null}
          </div>
          <span className="text-xs font-semibold text-warm-brown/70">
            {post.readTime}
          </span>
        </div>

        <h2
          className={[
            "mt-8 font-serif font-semibold leading-[0.96] text-charcoal",
            isFeatured
              ? "text-[clamp(3rem,8vw,5.75rem)]"
              : "text-3xl sm:text-4xl",
          ].join(" ")}
        >
          {post.title}
        </h2>

        <p
          className={[
            "mt-5 leading-7 text-warm-brown",
            isFeatured ? "max-w-2xl text-lg" : "text-base",
          ].join(" ")}
        >
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-end justify-between gap-5 pt-10">
          <div className="text-sm text-warm-brown">
            <p className="font-bold text-charcoal">{post.author}</p>
            <p className="mt-1">{post.date}</p>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sage text-charcoal shadow-soft">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
