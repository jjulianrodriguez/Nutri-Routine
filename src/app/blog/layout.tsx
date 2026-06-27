import type { Metadata } from "next";
import type { ReactNode } from "react";

import { BlogFooter } from "@/components/blog/BlogFooter";
import { BlogNavbar } from "@/components/blog/BlogNavbar";

export const metadata: Metadata = {
  title: "Blog · Poner nombre",
  description:
    "Artículos sobre nutrición funcional, entrenamiento, salud hormonal y bienestar.",
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--blog-cream)] text-[var(--blog-night)] [--blog-clay:#DB3854] [--blog-cream:#FFF8E8] [--blog-forest:#44509F] [--blog-mint:#FFE9AD] [--blog-muted:#656B78] [--blog-night:#071C33] [--blog-paper:#FFFFFF] [--blog-peach:#F87F52] [--blog-rose:#FFF8E8] [--blog-sage:#FFE9AD] [--blog-sand:#F87F52] [font-family:var(--font-landing-sans)]">
      <BlogNavbar />
      <main className="flex-1">{children}</main>
      <BlogFooter />
    </div>
  );
}
