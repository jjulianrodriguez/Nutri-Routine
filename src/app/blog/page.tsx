import { BlogIndex } from "@/components/blog/BlogIndex";
import { getPublishedBlogPosts } from "@/lib/blog/posts";

export const dynamic = "force-dynamic";

export default async function BlogHome() {
  const blogPosts = await getPublishedBlogPosts();

  return (
    <div className="px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:px-10">
      <section className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-warm-brown">
              Blog
            </p>
            <h1 className="mt-5 max-w-4xl font-serif text-[clamp(4rem,12vw,9rem)] font-semibold leading-[0.82] text-charcoal">
              Lecturas para{" "}
              <em className="font-serif italic text-warm-brown">
                tu bienestar
              </em>
            </h1>
          </div>

          <div className="rounded-[24px] border border-charcoal/10 bg-white p-6 shadow-soft">
            <p className="text-lg leading-8 text-warm-brown">
              Ciencia, reflexión y herramientas prácticas para tu salud integral
              y entrenamiento.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl sm:mt-16">
        <BlogIndex posts={blogPosts} />
      </section>
    </div>
  );
}
