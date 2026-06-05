import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { HomeMark } from "@/components/layout/home-mark";

export function BlogNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-soft bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-4xl items-center justify-between px-5 sm:px-8">
        <HomeMark className="scale-90" />
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-stone-soft bg-white px-4 py-2 text-sm font-semibold text-espresso shadow-soft transition-colors hover:bg-sand-soft"
        >
          <ArrowLeft className="size-4" />
          Volver a inicio
        </Link>
      </div>
    </header>
  );
}
