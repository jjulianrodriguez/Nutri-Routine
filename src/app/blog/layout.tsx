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
    <div className="flex min-h-dvh flex-col bg-[var(--blog-cream)] text-[var(--blog-night)] [--blog-clay:#9F5F5B] [--blog-cream:#F7E6D4] [--blog-forest:#4F7836] [--blog-mint:#86B05D] [--blog-muted:#7A6660] [--blog-night:#4B3535] [--blog-paper:#FFFCF8] [--blog-peach:#E7C58A] [--blog-rose:#F1D6D0] [--blog-sage:#FFF4EA] [--blog-sand:#E7C58A] [font-family:var(--font-landing-sans)]">
      <BlogNavbar />
      <main className="flex-1">{children}</main>
      <BlogFooter />
    </div>
  );
}
