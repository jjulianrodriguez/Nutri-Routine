import { PostRow } from "@/components/blog/PostRow";
import { blogPosts } from "@/lib/blog/posts";

export const metadata = {
  title: "Blog · Nutrición Con Enfoque",
  description: "Artículos sobre nutrición funcional, entrenamiento, salud hormonal y bienestar.",
};

export default function BlogHome() {
  return (
    <div className="pb-24">
      {/* Minimalist Header */}
      <section className="flex flex-col items-center justify-center px-5 py-24 sm:py-32 lg:px-8">
        <h1 className="text-center font-serif text-[clamp(3.5rem,8vw,6rem)] font-bold leading-[0.85] tracking-tight text-espresso">
          Lecturas para<br />
          <span className="italic text-terracotta">tu bienestar</span>
        </h1>
        <p className="mt-8 max-w-lg text-center text-lg text-stone sm:text-xl">
          Ciencia, reflexión y herramientas prácticas para tu salud integral y entrenamiento.
        </p>
      </section>

      {/* Post List */}
      <section className="flex flex-col border-b border-stone-soft">
        {blogPosts.map((post, index) => (
          <PostRow key={post.id} post={post} index={index} />
        ))}
      </section>
    </div>
  );
}
