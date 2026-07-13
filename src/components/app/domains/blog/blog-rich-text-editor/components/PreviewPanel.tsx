import { BlogContentRenderer } from "@/components/app/domains/blog/BlogContentRenderer";

export function PreviewPanel({ content }: { content: string }) {
 return (
 <section
 className="border-t bg-surface-muted/45 px-4 py-6 sm:px-8 sm:py-8"
 aria-labelledby="blog-preview-title"
 >
 <div className="mx-auto max-w-3xl rounded-[22px] bg-surface px-5 py-6 sm:px-8 sm:py-8">
 <p
 id="blog-preview-title"
 className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary"
 >
 Vista previa de publicación
 </p>
 <BlogContentRenderer
 className="mt-5"
 content={content}
 emptyMessage="La vista previa aparecerá cuando escribas contenido."
 />
 </div>
 </section>
 );
}
