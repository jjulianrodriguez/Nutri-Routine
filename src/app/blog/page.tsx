import { BlogList } from "@/app/blog/_components/blog-list";
import { getPublishedBlogPosts } from "@/lib/blog/posts";

export const dynamic = "force-dynamic";

export default async function BlogHome() {
 const blogPosts = await getPublishedBlogPosts();

 return (
 <>
 <section className="bg-[var(--surface)] py-20 md:py-28">
 <div className="mx-auto max-w-7xl px-6 text-center flex flex-col items-center">
 <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
 Blog
 </p>
 <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] md:text-6xl">
 Lecturas para cuidar tu cuerpo
 <br className="hidden md:block" /> con criterio.
 </h1>
 <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)] md:text-xl">
 Ciencia, reflexión y herramientas prácticas de Mariana y Camila para
 acompañar tu nutrición, tu entrenamiento y tu bienestar cotidiano.
 </p>
 <div className="mt-8 flex flex-wrap justify-center gap-2">
 {["Nutrición", "Entrenamiento", "Bienestar"].map((item) => (
 <span
 key={item}
 className="rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]"
 >
 {item}
 </span>
 ))}
 </div>
 </div>
 </section>

 <section className="bg-[var(--surface-muted)] py-16 md:py-24">
 <div className="mx-auto max-w-7xl px-6">
 <div className="mb-10 max-w-2xl">
 <h2 className="text-3xl font-bold text-[var(--foreground)] md:text-4xl">
 Artículos recientes
 </h2>
 <p className="mt-3 text-lg leading-relaxed text-[var(--muted-foreground)]">
 Elegí un tema y encontrá información clara para aplicar en tu proceso.
 </p>
 </div>
 <BlogList posts={blogPosts} />
 </div>
 </section>
 </>
 );
}
