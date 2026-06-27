import { BlogIndex } from "@/components/blog/BlogIndex";
import { getPublishedBlogPosts } from "@/lib/blog/posts";

export const dynamic = "force-dynamic";

export default async function BlogHome() {
  const blogPosts = await getPublishedBlogPosts();

  return (
    <div className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgb(255_233_173_/_0.3),transparent_30rem),radial-gradient(circle_at_88%_14%,rgb(255_248_232_/_0.9),transparent_34rem),linear-gradient(180deg,var(--blog-cream)_0%,var(--blog-paper)_52%,var(--blog-sage)_100%)]" />
      <section className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(26rem,0.68fr)] lg:items-end">
          <div>
            <p className="inline-flex rounded-full border border-[var(--blog-night)]/10 bg-[rgb(255_252_248_/_0.62)] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--blog-forest)] shadow-[0_18px_48px_-40px_rgb(26_48_56_/_0.2)] backdrop-blur-xl">
              Diario editorial
            </p>
            <h1
              style={{
                fontFamily: "var(--font-landing-display)",
                fontWeight: 500,
              }}
              className="mt-6 max-w-4xl text-[clamp(4.4rem,11vw,9.6rem)] leading-[0.78] tracking-[-0.04em] text-[var(--blog-night)]"
            >
              Lecturas para cuidar tu cuerpo con criterio.
            </h1>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--blog-night)]/10 bg-[rgb(255_252_248_/_0.52)] p-5 shadow-[0_34px_96px_-68px_rgb(26_48_56_/_0.24)] backdrop-blur-2xl sm:p-7">
            <div className="absolute -right-20 -top-20 size-52 rounded-full bg-[var(--blog-mint)] blur-3xl" />
            <p className="relative text-lg font-bold leading-8 text-[var(--blog-muted)]">
              Ciencia, reflexión y herramientas prácticas para tu salud
              integral, tu entrenamiento y una relación más amable con el
              proceso.
            </p>
            <div className="relative mt-7 grid gap-2 sm:grid-cols-3">
              {["nutrición", "fuerza", "bienestar"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--blog-night)]/10 bg-[rgb(255_255_255_/_0.58)] px-3 py-2 text-center text-[0.66rem] font-black uppercase tracking-[0.15em] text-[var(--blog-night)]"
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
