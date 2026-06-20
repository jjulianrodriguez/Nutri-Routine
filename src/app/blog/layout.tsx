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
    <div className="flex min-h-dvh flex-col bg-background text-charcoal">
      <BlogNavbar />
      <main className="flex-1">{children}</main>
      <BlogFooter />
    </div>
  );
}
