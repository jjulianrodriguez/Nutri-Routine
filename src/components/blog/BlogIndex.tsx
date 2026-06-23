"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { PostCard } from "@/components/blog/PostCard";
import type { BlogPost } from "@/lib/blog/posts";

type BlogIndexProps = {
  posts: BlogPost[];
};

export function BlogIndex({ posts }: BlogIndexProps) {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const reduceMotion = useReducedMotion();
  const blogCategories = useMemo(
    () => ["Todos", ...Array.from(new Set(posts.map((post) => post.category)))],
    [posts],
  );

  const filteredPosts = useMemo(() => {
    if (activeCategory === "Todos") {
      return posts;
    }

    return posts.filter((post) => post.category === activeCategory);
  }, [activeCategory, posts]);

  const [featuredPost, ...restPosts] = filteredPosts;

  if (posts.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-charcoal/15 bg-white px-6 py-14 text-center shadow-soft">
        <h2 className="font-serif text-3xl font-semibold text-charcoal">
          Pronto habra nuevas lecturas
        </h2>
        <p className="mx-auto mt-3 max-w-xl leading-7 text-warm-brown">
          Los artículos visibles publicados por el equipo aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {blogCategories.map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveCategory(category)}
              className={[
                "min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-bold shadow-soft transition-colors",
                isActive
                  ? "border-sage bg-sage text-charcoal"
                  : "border-charcoal/10 bg-white text-warm-brown hover:border-sage hover:bg-cream",
              ].join(" ")}
            >
              {category}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="popLayout">
        {featuredPost ? (
          <motion.div
            key={activeCategory}
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.34, ease: [0.22, 0.72, 0.18, 1] }}
            className="mt-8 grid gap-5 lg:grid-cols-[1.12fr_0.88fr]"
          >
            <PostCard index={0} post={featuredPost} variant="featured" />

            <div className="grid gap-5">
              {restPosts.slice(0, 2).map((post, index) => (
                <PostCard key={post.slug} index={index + 1} post={post} />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {restPosts.length > 2 ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {restPosts.slice(2).map((post, index) => (
            <PostCard key={post.slug} index={index + 3} post={post} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
