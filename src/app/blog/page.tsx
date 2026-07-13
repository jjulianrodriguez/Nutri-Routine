import { BlogIndex } from "@/components/app/domains/blog/BlogIndex";
import { getPublishedBlogPosts } from "@/lib/blog/posts";

export const dynamic = "force-dynamic";

export default async function BlogHome() {
 const blogPosts = await getPublishedBlogPosts();

 return (
 <div className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:px-10">
 <div className="hidden" />
 <section className="relative mx-auto max-w-7xl">
 <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(26rem,0.68fr)] lg:items-end">
 <div>
 <p className="inline-flex rounded-full border-[var(--blog-night)]/10 bg-[var(--blog-paper)] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--blog-forest)] shadow-[0_18px_48px_-40px_rgb(var(--raspberry-rgb)_/_0.2)]">
 Diario editorial
 </p>
 <h1
 style={{
 fontFamily: "var(--font-landing-display)",
 fontWeight: 500,
 }}
 className="mt-6 max-w-4xl text-[clamp(3.2rem,18vw,4.4rem)] leading-[0.82] tracking-[-0.04em] text-[var(--blog-night)] sm:text-[clamp(4.4rem,11vw,9.6rem)] sm:leading-[0.78]"
 >
 Lecturas para cuidar tu cuerpo con criterio.
 </h1>
 </div>

 <div className="relative overflow-hidden rounded-[2rem] border-[var(--blog-night)]/10 bg-[var(--blog-paper)] p-4 shadow-[0_34px_96px_-68px_rgb(var(--raspberry-rgb)_/_0.24)] sm:p-7">
 <div className="hidden" />
 <p className="relative text-lg font-bold leading-8 text-[var(--blog-muted)]">
 Ciencia, reflexión y herramientas prácticas para tu salud
 integral, tu entrenamiento y una relación más amable con el
 proceso.
 </p>
 <div className="relative mt-7 grid grid-cols-3 gap-2">
 {["nutrición", "fuerza", "bienestar"].map((item) => (
 <span
 key={item}
 className="rounded-full border-[var(--blog-night)]/10 bg-[var(--blog-paper)] px-3 py-2 text-center text-[0.66rem] font-black uppercase tracking-[0.15em] text-[var(--blog-night)]"
 >
 {item}
 </span>
 ))}
 </div>
 </div>
 </div>
 </section>

 <section className="relative mx-auto mt-12 max-w-7xl sm:mt-16">
 <BlogIndex posts={blogPosts} />
 </section>
 </div>
 );
}
