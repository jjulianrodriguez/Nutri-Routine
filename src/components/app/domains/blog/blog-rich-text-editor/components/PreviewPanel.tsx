import type { ReactNode } from "react";

import { BlogContentRenderer } from "@/components/app/domains/blog/BlogContentRenderer";

export function PreviewPanel({
 action,
 content,
}: {
 action?: ReactNode;
 content: string;
}) {
 return (
 <section
 className="border-t bg-surface-muted/45 px-4 py-6 sm:px-8 sm:py-8"
 aria-labelledby="blog-preview-title"
 >
 <div className="mx-auto max-w-3xl rounded-[22px] bg-surface px-5 py-6 sm:px-8 sm:py-8">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <p
 id="blog-preview-title"
 className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary"
 >
 Vista previa de publicación
 </p>
 {action}
 </div>
 <BlogContentRenderer
 className="mt-5"
 content={content}
 emptyMessage="La vista previa aparecerá cuando escribas contenido."
 />
 </div>
 </section>
 );
}
