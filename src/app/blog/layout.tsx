import type { Metadata } from "next";
import type { ReactNode } from "react";

import { BlogFooter } from "@/components/blog/BlogFooter";
import { BlogNavbar } from "@/components/blog/BlogNavbar";

export const metadata: Metadata = {
  title: "Blog · Nutrición Con Enfoque",
  description:
    "Artículos sobre nutrición funcional, entrenamiento, salud hormonal y bienestar.",
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--blog-cream)] text-[var(--blog-night)] [--blog-clay:var(--primary)] [--blog-cream:var(--background)] [--blog-forest:var(--secondary)] [--blog-mint:var(--secondary-soft)] [--blog-muted:var(--muted-foreground)] [--blog-night:var(--foreground)] [--blog-paper:var(--surface)] [--blog-peach:var(--primary)] [--blog-rose:var(--primary-soft)] [--blog-sage:var(--surface-muted)] [--blog-sand:var(--secondary-soft)] [font-family:var(--font-landing-sans)]">
      <BlogNavbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <BlogFooter />
    </div>
  );
}
