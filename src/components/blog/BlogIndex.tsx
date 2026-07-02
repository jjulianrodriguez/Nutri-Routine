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
 <div className="rounded-[2rem] border-[var(--blog-night)]/16 bg-[var(--blog-paper)] px-6 py-14 text-center shadow-[0_28px_86px_-66px_rgb(var(--raspberry-rgb)_/_0.22)]">
 <h2
 style={{
 fontFamily: "var(--font-landing-display)",
 fontWeight: 500,
 }}
 className="text-4xl leading-none tracking-[-0.025em] text-[var(--blog-night)]"
 >
 Pronto habrá nuevas lecturas
 </h2>
 <p className="mx-auto mt-4 max-w-xl font-bold leading-7 text-[var(--blog-muted)]">
 Los artículos visibles publicados por el equipo aparecerán aquí.
 </p>
 </div>
 );
 }

 return (
 <div className="relative">
 <div className="flex gap-2 overflow-x-auto rounded-full border-[var(--blog-night)]/8 bg-[var(--blog-paper)] p-2 shadow-[0_22px_70px_-56px_rgb(var(--raspberry-rgb)_/_0.2)]">
 {blogCategories.map((category) => {
 const isActive = category === activeCategory;

 return (
 <button
 key={category}
 type="button"
 aria-pressed={isActive}
 onClick={() => setActiveCategory(category)}
 className={[
 "min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-black transition-[background-color,border-color,color,box-shadow] duration-300",
 isActive
 ? "border-[var(--blog-night)]/10 bg-[var(--blog-night)] text-[var(--blog-paper)] shadow-[0_18px_46px_-34px_rgb(var(--raspberry-rgb)_/_0.4)]"
 : "border-[var(--blog-night)]/10 bg-[var(--blog-paper)] text-[var(--blog-muted)] hover:border-[var(--blog-clay)]/30 hover:text-[var(--blog-night)]",
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
