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
      whileHover={reduceMotion ? undefined : { y: -2 }}
      className={[
        "group relative overflow-hidden border border-[var(--blog-night)]/10 bg-[rgb(255_252_248_/_0.54)] shadow-[0_34px_96px_-70px_rgb(26_48_56_/_0.24)] backdrop-blur-2xl transition-colors hover:border-[var(--blog-clay)]/30",
        isFeatured
          ? "min-h-full rounded-[2.1rem] p-6 sm:p-8"
          : "rounded-[1.7rem] p-5 sm:p-6",
      ].join(" ")}
    >
      <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">Leer {post.title}</span>
      </Link>

      <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-[var(--blog-mint)]/70 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 left-8 size-44 rounded-full bg-[var(--blog-rose)]/60 blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--blog-peach),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-0 flex h-full flex-col">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--blog-night)]/10 bg-[rgb(255_252_248_/_0.62)] px-3 py-1.5 text-xs font-black text-[var(--blog-muted)] shadow-[0_14px_38px_-30px_rgb(26_48_56_/_0.2)] backdrop-blur-xl">
              {post.category}
            </span>
            {post.isPinned ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--blog-sage)] px-3 py-1.5 text-xs font-black text-[var(--blog-night)]">
                <Pin className="size-3" aria-hidden="true" />
                Principal
              </span>
            ) : null}
          </div>
          <span className="text-xs font-bold text-[var(--blog-muted)]/70">
            {post.readTime}
          </span>
        </div>

        <h2
          style={{
            fontFamily: "var(--font-landing-display)",
            fontWeight: 500,
          }}
          className={[
            "mt-8 leading-[0.9] tracking-[-0.028em] text-[var(--blog-night)]",
            isFeatured
              ? "text-[clamp(3.4rem,8vw,6.4rem)]"
              : "text-4xl sm:text-5xl",
          ].join(" ")}
        >
          {post.title}
        </h2>

        <p
          className={[
            "mt-5 font-bold leading-7 text-[var(--blog-muted)]",
            isFeatured ? "max-w-2xl text-lg" : "text-base",
          ].join(" ")}
        >
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-end justify-between gap-5 pt-10">
          <div className="text-sm text-[var(--blog-muted)]">
            <p className="font-black text-[var(--blog-night)]">{post.author}</p>
            <p className="mt-1">{post.date}</p>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--blog-night)] text-[var(--blog-paper)] shadow-[0_18px_46px_-32px_rgb(26_48_56_/_0.38)] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
