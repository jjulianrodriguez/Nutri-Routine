import { cn } from "@/lib/utils";
import { getBlogTextContent, sanitizeBlogHtml } from "@/lib/blog/content";

type BlogContentRendererProps = {
  className?: string;
  content: string;
  emptyMessage?: string;
  variant?: "article" | "preview";
};

export function BlogContentRenderer({
  className,
  content,
  emptyMessage,
  variant = "article",
}: BlogContentRendererProps) {
  const safeHtml = sanitizeBlogHtml(content);
  const hasContent = getBlogTextContent(safeHtml).length > 0;

  if (!hasContent) {
    return emptyMessage ? (
      <p className={cn("text-sm leading-6 text-muted", className)}>
        {emptyMessage}
      </p>
    ) : null;
  }

  return (
    <div
      className={cn(
        "max-w-none break-words font-normal text-[var(--blog-muted)] [overflow-wrap:anywhere]",
        "[&_a[href]]:font-black [&_a[href]]:text-[var(--blog-forest)] [&_a[href]]:underline [&_a[href]]:decoration-[var(--blog-peach)] [&_a[href]]:decoration-2 [&_a[href]]:underline-offset-4 hover:[&_a[href]]:text-[var(--blog-clay)]",
        "[&_.blog-align-center]:text-center [&_.blog-align-left]:text-left [&_.blog-align-right]:text-right",
        "[&_.blog-color-accent]:text-[var(--blog-clay)] [&_.blog-color-charcoal]:text-[var(--blog-night)] [&_.blog-color-teal]:text-[var(--blog-forest)] [&_.blog-color-warm]:text-[var(--blog-muted)]",
        "[&_.blog-highlight]:rounded-[8px] [&_.blog-highlight]:bg-[var(--blog-rose)] [&_.blog-highlight]:px-1.5 [&_.blog-highlight]:py-0.5",
        "[&_.blog-text-large]:text-xl [&_.blog-text-large]:leading-9 [&_.blog-text-small]:text-sm [&_.blog-text-small]:leading-6",
        "[&_blockquote]:my-8 [&_blockquote]:rounded-[1.4rem] [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--blog-forest)] [&_blockquote]:bg-[var(--blog-paper)] [&_blockquote]:px-5 [&_blockquote]:py-5 [&_blockquote]:font-black [&_blockquote]:text-[var(--blog-night)] [&_blockquote]:shadow-[0_22px_70px_-56px_rgb(var(--raspberry-rgb)_/_0.2)]",
        "[&_em]:text-[var(--blog-night)] [&_h1]:leading-[1.02] [&_h1]:text-[var(--blog-night)]",
        "[&_h2]:leading-[1.08] [&_h2]:text-[var(--blog-night)] [&_h3]:leading-tight [&_h3]:text-[var(--blog-night)]",
        "[&_h1]:[font-family:var(--font-landing-display)] [&_h1]:font-medium [&_h2]:[font-family:var(--font-landing-display)] [&_h2]:font-medium [&_h3]:[font-family:var(--font-landing-display)] [&_h3]:font-medium",
        "[&_hr]:my-10 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-[var(--blog-night)]/15",
        "[&_li]:my-2 [&_li]:pl-1 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-6 [&_strong]:font-bold [&_strong]:text-[var(--blog-night)] [&_u]:underline [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6",
        variant === "article"
          ? "[&_h1]:mb-6 [&_h1]:mt-12 [&_h1]:text-3xl sm:[&_h1]:text-4xl [&_h2]:mb-5 [&_h2]:mt-10 [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h3]:mb-4 [&_h3]:mt-8 [&_h3]:text-xl sm:[&_h3]:text-2xl [&_li]:text-lg [&_li]:leading-8 [&_p]:text-lg [&_p]:leading-9"
          : "[&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-2xl [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-xl [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-lg [&_li]:text-base [&_li]:leading-7 [&_p]:text-base [&_p]:leading-7",
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
