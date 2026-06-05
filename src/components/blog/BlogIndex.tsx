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

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {blogCategories.map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={[
                "shrink-0 rounded-full border px-4 py-2 text-sm font-bold shadow-soft",
                isActive
                  ? "border-sage bg-sage text-charcoal"
                  : "border-charcoal/10 bg-white text-warm-brown",
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
