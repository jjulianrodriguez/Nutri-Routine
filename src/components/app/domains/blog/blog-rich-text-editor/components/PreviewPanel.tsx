import { BlogContentRenderer } from "@/components/app/domains/blog/BlogContentRenderer";

export function PreviewPanel({ content }: { content: string }) {
 return (
 <div className="mt-4 rounded-[22px] bg-background p-4 sm:p-5">
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 Vista previa
 </p>
 <BlogContentRenderer
 className="mt-4"
 content={content}
 emptyMessage="La vista previa aparecerá cuando escribas contenido."
 />
 </div>
 );
}