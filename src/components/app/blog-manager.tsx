"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createBlogPost,
  deleteBlogPost,
  updateBlogPinned,
  updateBlogPost,
  updateBlogVisibility,
  type BlogActionResult,
} from "@/lib/actions/blog";
import type { AdminBlogPost } from "@/lib/blog/admin-posts";
import {
  blogPostValuesSchema,
  type BlogPostValues,
} from "@/lib/validations/blog";

type BlogManagerProps = {
  initialPosts: AdminBlogPost[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-2 text-sm font-semibold text-danger" role="alert">
      {message}
    </p>
  );
}

export function BlogManager({ initialPosts }: BlogManagerProps) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [editingPost, setEditingPost] = useState<AdminBlogPost | null>(null);
  const [serverMessage, setServerMessage] = useState("");
  const [pendingPostId, setPendingPostId] = useState<string | null>(null);
  const [isChangingStatus, startStatusTransition] = useTransition();
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<BlogPostValues>({
    defaultValues: {
      category: "Bienestar",
      content: "",
      isPinned: false,
      published: false,
      title: "",
    },
    resolver: zodResolver(blogPostValuesSchema),
  });
  const isPinned = useWatch({ control, name: "isPinned" });

  function startEditing(post: AdminBlogPost) {
    setEditingPost(post);
    setServerMessage("");
    clearErrors();
    reset({
      category: post.category,
      content: post.content,
      isPinned: post.is_pinned,
      published: post.published,
      title: post.title,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearForm() {
    setEditingPost(null);
    setServerMessage("");
    clearErrors();
    reset({
      category: "Bienestar",
      content: "",
      isPinned: false,
      published: false,
      title: "",
    });
  }

  async function onSubmit(values: BlogPostValues) {
    setServerMessage("");
    clearErrors("root");

    const result = editingPost
      ? await updateBlogPost({ ...values, id: editingPost.id })
      : await createBlogPost(values);

    if (result.status === "error") {
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          if (message) {
            setError(field as keyof BlogPostValues, { message });
          }
        });
      }

      setServerMessage(result.message);
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    clearForm();
    router.refresh();
  }

  function changeStatus(
    postId: string,
    action: () => Promise<BlogActionResult>,
  ) {
    setPendingPostId(postId);
    startStatusTransition(async () => {
      const result = await action();

      if (result.status === "error") {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        if (editingPost?.id === postId) {
          clearForm();
        }
        router.refresh();
      }

      setPendingPostId(null);
    });
  }

  function confirmDelete(post: AdminBlogPost) {
    const confirmed = window.confirm(
      `¿Eliminar definitivamente "${post.title}"?\n\nEsta accion no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    changeStatus(post.id, () => deleteBlogPost(post.id));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:items-start">
      <div
        ref={formRef}
        className="scroll-mt-6 rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
              {editingPost ? "Edicion" : "Nuevo contenido"}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-charcoal">
              {editingPost ? "Editar blog" : "Crear blog"}
            </h2>
          </div>
          {editingPost ? (
            <Button type="button" variant="ghost" onClick={clearForm}>
              <X className="size-4" aria-hidden="true" />
              Cancelar
            </Button>
          ) : null}
        </div>

        <form
          className="mt-6 space-y-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div>
            <Label htmlFor="blog-title" className="font-extrabold text-charcoal">
              Titulo
            </Label>
            <Input
              id="blog-title"
              className="mt-2 h-12 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft"
              aria-describedby={errors.title ? "blog-title-error" : undefined}
              aria-invalid={Boolean(errors.title)}
              maxLength={180}
              {...register("title")}
            />
            <FieldError id="blog-title-error" message={errors.title?.message} />
          </div>

          <div>
            <Label
              htmlFor="blog-category"
              className="font-extrabold text-charcoal"
            >
              Categoria
            </Label>
            <Input
              id="blog-category"
              list="blog-category-options"
              className="mt-2 h-12 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft"
              aria-describedby={[
                "blog-category-help",
                errors.category ? "blog-category-error" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-invalid={Boolean(errors.category)}
              maxLength={80}
              placeholder="Bienestar"
              {...register("category")}
            />
            <datalist id="blog-category-options">
              <option value="Bienestar" />
              <option value="Nutricion" />
              <option value="Entrenamiento" />
              <option value="Consejos" />
            </datalist>
            <p
              id="blog-category-help"
              className="mt-2 text-sm leading-6 text-muted"
            >
              Esta categoria aparecera como filtro en el blog publico.
            </p>
            <FieldError
              id="blog-category-error"
              message={errors.category?.message}
            />
          </div>

          <div>
            <Label
              htmlFor="blog-content"
              className="font-extrabold text-charcoal"
            >
              Contenido
            </Label>
            <p className="mt-2 text-sm leading-6 text-muted">
              Solo texto. Separa parrafos dejando una linea en blanco.
            </p>
            <textarea
              id="blog-content"
              rows={16}
              maxLength={50000}
              className="mt-3 w-full resize-y rounded-[22px] border border-input bg-surface/90 px-4 py-4 text-base leading-7 text-foreground shadow-soft outline-none placeholder:text-muted focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 disabled:opacity-50"
              aria-describedby={
                errors.content ? "blog-content-error" : undefined
              }
              aria-invalid={Boolean(errors.content)}
              {...register("content")}
            />
            <FieldError
              id="blog-content-error"
              message={errors.content?.message}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-[18px] border border-border bg-background px-4 py-3">
              <input
                type="checkbox"
                className="size-5 accent-[var(--primary-hover)]"
                {...register("published")}
              />
              <span>
                <span className="block font-extrabold text-charcoal">
                  Visible
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted">
                  Mostrar publicamente.
                </span>
              </span>
            </label>

            <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-[18px] border border-border bg-background px-4 py-3">
              <input
                type="checkbox"
                className="size-5 accent-[var(--primary-hover)]"
                {...register("isPinned", {
                  onChange: (event) => {
                    if (event.target.checked) {
                      setValue("published", true, { shouldValidate: true });
                    }
                  },
                })}
              />
              <span>
                <span className="block font-extrabold text-charcoal">
                  Blog principal
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted">
                  Anclarlo desancla el anterior.
                </span>
              </span>
            </label>
          </div>

          {isPinned ? (
            <Alert className="rounded-[18px] border-primary/30 bg-primary-soft px-4 py-3">
              <AlertDescription className="font-semibold text-charcoal">
                Un blog principal siempre queda visible.
              </AlertDescription>
            </Alert>
          ) : null}

          {serverMessage ? (
            <Alert
              variant="destructive"
              className="rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3"
            >
              <AlertDescription className="font-semibold text-danger">
                {serverMessage}
              </AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Guardando...
              </>
            ) : editingPost ? (
              <>
                <Save className="size-4" aria-hidden="true" />
                Guardar cambios
              </>
            ) : (
              <>
                <Plus className="size-4" aria-hidden="true" />
                Crear blog
              </>
            )}
          </Button>
        </form>
      </div>

      <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
              Biblioteca
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-charcoal">
              Blogs creados
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/blog" target="_blank" rel="noreferrer">
              <Eye className="size-4" aria-hidden="true" />
              Ver blog publico
            </Link>
          </Button>
        </div>

        {initialPosts.length > 0 ? (
          <div className="mt-6 space-y-4">
            {initialPosts.map((post) => {
              const isPending =
                isChangingStatus && pendingPostId === post.id;

              return (
                <article
                  key={post.id}
                  className="rounded-[22px] border border-border bg-background p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold",
                        post.published
                          ? "bg-success/10 text-success"
                          : "bg-stone-soft text-warm-brown",
                      ].join(" ")}
                    >
                      {post.published ? (
                        <Eye className="size-3" aria-hidden="true" />
                      ) : (
                        <EyeOff className="size-3" aria-hidden="true" />
                      )}
                      {post.published ? "Visible" : "Oculto"}
                    </span>
                    {post.is_pinned ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-charcoal">
                        <Pin className="size-3" aria-hidden="true" />
                        Principal
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 text-2xl font-semibold leading-tight text-charcoal">
                    {post.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
                    {post.excerpt}
                  </p>

                  <span className="mt-4 inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-warm-brown">
                    {post.category}
                  </span>

                  <dl className="mt-4 grid gap-2 text-xs font-bold text-warm-brown sm:grid-cols-2">
                    <div>
                      <dt className="text-muted">Autor</dt>
                      <dd className="mt-1">{post.authorName}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Actualizado</dt>
                      <dd className="mt-1">{formatDate(post.updated_at)}</dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(post)}
                      disabled={isPending}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() =>
                        changeStatus(post.id, () =>
                          updateBlogVisibility(post.id, !post.published),
                        )
                      }
                    >
                      {isPending ? (
                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : post.published ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                      {post.published ? "Ocultar" : "Mostrar"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={post.is_pinned ? "ghost" : "outline"}
                      disabled={isPending}
                      onClick={() =>
                        changeStatus(post.id, () =>
                          updateBlogPinned(post.id, !post.is_pinned),
                        )
                      }
                    >
                      {post.is_pinned ? (
                        <PinOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Pin className="size-4" aria-hidden="true" />
                      )}
                      {post.is_pinned ? "Desanclar" : "Anclar"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={isPending}
                      onClick={() => confirmDelete(post)}
                    >
                      {isPending ? (
                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Trash2 className="size-4" aria-hidden="true" />
                      )}
                      Eliminar
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-[22px] border border-dashed border-border bg-background px-5 py-12 text-center">
            <p className="font-extrabold text-charcoal">
              Aun no hay blogs creados.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              El primer blog que guardes aparecera en esta lista.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
