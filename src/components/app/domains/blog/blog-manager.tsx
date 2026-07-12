"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
 AlertCircle,
 CheckCircle2,
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
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { CardActionsMenu } from "@/components/app/shared/card-actions-menu";
import { BlogRichTextEditor } from "@/components/app/domains/blog/blog-rich-text-editor";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Button } from "@/components/ui/actions/button";
import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";
import { FieldError } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import {
 createBlogPost,
 deleteBlogPost,
 updateBlogPinned,
 updateBlogPost,
 updateBlogVisibility,
 type BlogActionResult,
} from "@/lib/actions/blog";
import { getEditableBlogContent } from "@/lib/blog/content";
import type { AdminBlogPost } from "@/lib/blog/admin-posts";
import {
 blogPostValuesSchema,
 type BlogPostValues,
} from "@/lib/validations/blog";

type BlogManagerProps = {
 initialPosts?: AdminBlogPost[];
 mode?: "create" | "manage";
};

type BlogConfirmation =
 | {
 post: AdminBlogPost;
 type: "delete" | "pinned" | "visibility";
 }
 | {
 post: AdminBlogPost;
 type: "update";
 values: BlogPostValues;
 };

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

function formatDate(value: string) {
 return new Intl.DateTimeFormat("es-CR", {
 dateStyle: "medium",
 timeStyle: "short",
 }).format(new Date(value));
}

function SaveStatusBadge({ status }: { status: SaveStatus }) {
 const config = {
 dirty: {
 className: "border-warning/30 bg-warning-soft text-muted-foreground",
 icon: AlertCircle,
 label: "Cambios sin guardar",
 },
 error: {
 className: "border-danger/30 bg-danger/10 text-danger",
 icon: AlertCircle,
 label: "Error al guardar",
 },
 idle: {
 className: " bg-background text-muted",
 icon: CheckCircle2,
 label: "Sin cambios pendientes",
 },
 saved: {
 className: "border-success/30 bg-success/10 text-success",
 icon: CheckCircle2,
 label: "Guardado",
 },
 saving: {
 className: "border-primary/30 bg-primary-soft text-foreground",
 icon: Loader2,
 label: "Guardando...",
 },
 } satisfies Record<
 SaveStatus,
 { className: string; icon: typeof AlertCircle; label: string }
 >;
 const current = config[status];
 const Icon = current.icon;

 return (
 <span
 className={[
 "inline-flex min-h-9 items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold",
 current.className,
 ].join(" ")}
 aria-live="polite"
 >
 <Icon
 className={[
 "size-3.5",
 status === "saving" ? "animate-spin" : "",
 ]
 .filter(Boolean)
 .join(" ")}
 aria-hidden="true"
 />
 {current.label}
 </span>
 );
}

export function BlogManager({
 initialPosts = [],
 mode = "manage",
}: BlogManagerProps) {
 const router = useRouter();
 const formRef = useRef<HTMLDivElement>(null);
 const [editingPost, setEditingPost] = useState<AdminBlogPost | null>(null);
 const [confirmation, setConfirmation] =
 useState<BlogConfirmation | null>(null);
 const [saveStatusOverride, setSaveStatusOverride] =
 useState<Extract<SaveStatus, "idle" | "saved" | "error">>("idle");
 const [serverMessage, setServerMessage] = useState("");
 const {
 clearErrors,
 control,
 formState: { errors, isDirty, isSubmitting },
 handleSubmit,
 register,
 reset,
 setError,
 setValue,
 trigger,
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
 const contentValue = useWatch({ control, name: "content" });
 const isManageMode = mode === "manage";
 const showEditor = mode === "create" || Boolean(editingPost);
 const hasUnsavedChanges = isDirty && !isSubmitting;
 const saveStatus: SaveStatus = isSubmitting
 ? "saving"
 : isDirty
 ? "dirty"
 : saveStatusOverride;

 useEffect(() => {
 if (editingPost) {
 formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
 }
 }, [editingPost]);

 useEffect(() => {
 if (!hasUnsavedChanges) {
 return;
 }

 const message =
 "Tienes cambios sin guardar. Si sales ahora, se perderan.";
 const handleBeforeUnload = (event: BeforeUnloadEvent) => {
 event.preventDefault();
 event.returnValue = message;
 };
 const handleDocumentClick = (event: MouseEvent) => {
 const target = event.target;
 if (!(target instanceof Element)) {
 return;
 }

 const anchor = target.closest("a[href]");
 if (!(anchor instanceof HTMLAnchorElement)) {
 return;
 }

 if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
 return;
 }

 if (window.confirm(message)) {
 return;
 }

 event.preventDefault();
 event.stopPropagation();
 };

 window.addEventListener("beforeunload", handleBeforeUnload);
 document.addEventListener("click", handleDocumentClick, true);

 return () => {
 window.removeEventListener("beforeunload", handleBeforeUnload);
 document.removeEventListener("click", handleDocumentClick, true);
 };
 }, [hasUnsavedChanges]);

 function confirmDiscardChanges() {
 return (
 !hasUnsavedChanges ||
 window.confirm("Tienes cambios sin guardar. Si continuas, se perderan.")
 );
 }

 function startEditing(post: AdminBlogPost) {
 if (!confirmDiscardChanges()) {
 return;
 }

 setEditingPost(post);
 setServerMessage("");
 setSaveStatusOverride("idle");
 clearErrors();
 reset({
 category: post.category,
 content: getEditableBlogContent(post.content),
 isPinned: post.is_pinned,
 published: post.published,
 title: post.title,
 });
 }

 function clearForm(nextStatus: Extract<SaveStatus, "idle" | "saved"> = "idle") {
 if (nextStatus === "idle" && !confirmDiscardChanges()) {
 return;
 }

 setEditingPost(null);
 setServerMessage("");
 setSaveStatusOverride(nextStatus);
 clearErrors();
 reset({
 category: "Bienestar",
 content: "",
 isPinned: false,
 published: false,
 title: "",
 });
 }

 async function savePost(
 values: BlogPostValues,
 post: AdminBlogPost | null,
 ) {
 setServerMessage("");
 setSaveStatusOverride("idle");
 clearErrors("root");

 let result: BlogActionResult;

 try {
 result = post
 ? await updateBlogPost({ ...values, id: post.id })
 : await createBlogPost(values);
 } catch {
 const message =
 "No pudimos guardar el blog. Revisa tu conexion e intenta de nuevo.";
 setSaveStatusOverride("error");
 setServerMessage(message);
 toast.error(message);
 return;
 }

 if (result.status === "error") {
 setSaveStatusOverride("error");
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
 clearForm("saved");
 router.refresh();
 }

 async function onSubmit(values: BlogPostValues) {
 if (editingPost) {
 setConfirmation({ post: editingPost, type: "update", values });
 return;
 }

 await savePost(values, null);
 }

 async function changeStatus(
 post: AdminBlogPost,
 action: () => Promise<BlogActionResult>,
 ) {
 try {
 const result = await action();

 if (result.status === "error") {
 toast.error(result.message);
 } else {
 toast.success(result.message);
 if (editingPost?.id === post.id) {
 clearForm();
 }
 router.refresh();
 }
 } catch {
 toast.error(
 "Ocurrió un error inesperado al actualizar el blog. Inténtalo de nuevo.",
 );
 }
 }

 function confirmDelete(post: AdminBlogPost) {
 setConfirmation({ post, type: "delete" });
 }

 async function confirmAction() {
 if (!confirmation) {
 return;
 }

 if (confirmation.type === "update") {
 await savePost(confirmation.values, confirmation.post);
 return;
 }

 if (confirmation.type === "delete") {
 await changeStatus(confirmation.post, () =>
 deleteBlogPost(confirmation.post.id),
 );
 return;
 }

 if (confirmation.type === "visibility") {
 await changeStatus(confirmation.post, () =>
 updateBlogVisibility(
 confirmation.post.id,
 !confirmation.post.published,
 ),
 );
 return;
 }

 await changeStatus(confirmation.post, () =>
 updateBlogPinned(
 confirmation.post.id,
 !confirmation.post.is_pinned,
 ),
 );
 }

 const confirmationTitle =
 confirmation?.type === "update"
 ? "Guardar cambios del blog"
 : confirmation?.type === "delete"
 ? "Eliminar blog"
 : confirmation?.type === "visibility"
 ? confirmation.post.published
 ? "Ocultar blog"
 : "Mostrar blog"
 : confirmation?.post.is_pinned
 ? "Desanclar blog"
 : "Anclar blog";
 const confirmationDescription =
 confirmation?.type === "update"
 ? `Se actualizará "${confirmation.values.title}" con la información del formulario.`
 : confirmation?.type === "delete"
 ? `Se eliminará definitivamente "${confirmation.post.title}". Esta acción no se puede deshacer.`
 : confirmation?.type === "visibility"
 ? confirmation.post.published
 ? `"${confirmation.post.title}" dejará de estar visible en el blog público.`
 : `"${confirmation.post.title}" volverá a estar visible en el blog público.`
 : confirmation?.post.is_pinned
 ? `"${confirmation.post.title}" dejará de ser la publicación principal.`
 : confirmation
 ? `"${confirmation.post.title}" se mostrará como publicación principal.`
 : "";
 const confirmationLabel =
 confirmation?.type === "update"
 ? "Guardar cambios"
 : confirmation?.type === "delete"
 ? "Eliminar blog"
 : confirmation?.type === "visibility"
 ? confirmation.post.published
 ? "Ocultar"
 : "Mostrar"
 : confirmation?.post.is_pinned
 ? "Desanclar"
 : "Anclar";

 return (
 <div
 className={[
 "grid gap-6",
 showEditor && isManageMode
 ? "xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:items-start"
 : "",
 ]
 .filter(Boolean)
 .join(" ")}
 >
 {showEditor ? (
 <div
 ref={formRef}
 className="scroll-mt-6 rounded-[28px] bg-surface p-5 sm:p-6"
 >
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 {editingPost ? "Edición" : "Nuevo contenido"}
 </p>
 <h2 className="mt-2 text-3xl font-semibold text-foreground">
 {editingPost ? "Editar blog" : "Crear blog"}
 </h2>
 </div>
 <div className="flex flex-wrap items-center justify-end gap-2">
 <SaveStatusBadge status={saveStatus} />
 {editingPost ? (
 <Button type="button" variant="ghost" onClick={() => clearForm()}>
 <X className="size-4" aria-hidden="true" />
 Cancelar
 </Button>
 ) : null}
 </div>
 </div>

 <form
 className="mt-6 space-y-5"
 onSubmit={handleSubmit(onSubmit)}
 noValidate
 >
 <div>
 <Label htmlFor="blog-title" className="font-extrabold text-foreground">
 Titulo
 </Label>
 <Input
 id="blog-title"
 className="mt-2"
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
 className="font-extrabold text-foreground"
 >
 Categoría
 </Label>
 <Input
 id="blog-category"
 list="blog-category-options"
 className="mt-2"
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
 <option value="Nutrición" />
 <option value="Entrenamiento" />
 <option value="Consejos" />
 </datalist>
 <p
 id="blog-category-help"
 className="mt-2 text-sm leading-6 text-muted"
 >
 Esta categoría aparecerá como filtro en el blog público.
 </p>
 <FieldError
 id="blog-category-error"
 message={errors.category?.message}
 />
 </div>

 <div>
 <Label
 htmlFor="blog-content"
 className="font-extrabold text-foreground"
 >
 Contenido
 </Label>
 <p className="mt-2 text-sm leading-6 text-muted">
 Escribe y da formato al contenido sin tocar código ni Markdown.
 </p>
 <input type="hidden" {...register("content")} />
 <div className="mt-3">
 <BlogRichTextEditor
 id="blog-content"
 describedBy={[
 "blog-content-help",
 errors.content ? "blog-content-error" : "",
 ]
 .filter(Boolean)
 .join(" ")}
 disabled={isSubmitting}
 error={Boolean(errors.content)}
 value={contentValue ?? ""}
 onBlur={() => {
 void trigger("content");
 }}
 onChange={(nextContent) => {
 setValue("content", nextContent, {
 shouldDirty: true,
 shouldTouch: true,
 shouldValidate: Boolean(errors.content),
 });
 }}
 />
 </div>
 <p
 id="blog-content-help"
 className="mt-2 text-sm leading-6 text-muted"
 >
 Usa la vista previa para revisar cómo se verá publicado.
 </p>
 <FieldError
 id="blog-content-error"
 message={errors.content?.message}
 />
 </div>

 <div className="grid gap-3 sm:grid-cols-2">
 <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-[18px] bg-background px-4 py-3">
 <input
 type="checkbox"
 className="size-5 accent-[var(--primary-hover)]"
 {...register("published")}
 />
 <span>
 <span className="block font-extrabold text-foreground">
 Visible
 </span>
 <span className="mt-1 block text-xs leading-5 text-muted">
 Mostrar públicamente.
 </span>
 </span>
 </label>

 <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-[18px] bg-background px-4 py-3">
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
 <span className="block font-extrabold text-foreground">
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
 <AlertDescription className="font-semibold text-foreground">
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
 ) : null}

 {isManageMode ? (
 <section className="rounded-[28px] bg-surface p-5 sm:p-6">
 <div className="flex flex-wrap items-center justify-between gap-4">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 Biblioteca
 </p>
 <h2 className="mt-2 text-3xl font-semibold text-foreground">
 Blogs creados
 </h2>
 </div>
 <Button asChild variant="outline">
 <Link href="/blog" target="_blank" rel="noreferrer">
 <Eye className="size-4" aria-hidden="true" />
 Ver blog público
 </Link>
 </Button>
 </div>

 {initialPosts.length > 0 ? (
 <div className="mt-6 space-y-4">
 {initialPosts.map((post) => (
 <article
 key={post.id}
 className="rounded-[22px] bg-background p-4 sm:p-5"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="flex flex-wrap items-center gap-2">
 <span
 className={[
 "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold",
 post.published
 ? "bg-success/10 text-success"
 : "bg-surface-muted text-muted-foreground",
 ].join(" ")}
 >
 {post.published ? (
 <Eye className="size-3" aria-hidden="true" />
 ) : (
 <EyeOff className="size-3" aria-hidden="true" />
 )}
 {post.published ? "Publicado" : "Oculto"}
 </span>
 {post.is_pinned ? (
 <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-primary-foreground">
 <Pin className="size-3" aria-hidden="true" />
 Anclado
 </span>
 ) : null}
 </div>
 <div className="flex shrink-0 items-center gap-2">
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={() => startEditing(post)}
 >
 <Pencil className="size-3.5" aria-hidden="true" />
 Editar
 </Button>
 <CardActionsMenu
 label={post.title}
 items={[
 ...(post.published && post.slug
 ? [
 {
 external: true,
 href: `/blog/${post.slug}`,
 icon: Eye,
 label: "Ver publicado",
 },
 ]
 : []),
 {
 icon: post.published ? EyeOff : Eye,
 label: post.published ? "Ocultar" : "Mostrar",
 onSelect: () =>
 setConfirmation({ post, type: "visibility" }),
 },
 {
 icon: post.is_pinned ? PinOff : Pin,
 label: post.is_pinned ? "Desanclar" : "Anclar",
 onSelect: () =>
 setConfirmation({ post, type: "pinned" }),
 },
 {
 destructive: true,
 icon: Trash2,
 label: "Eliminar",
 onSelect: () => confirmDelete(post),
 separatorBefore: true,
 },
 ]}
 />
 </div>
 </div>

 <h3 className="mt-4 text-2xl font-semibold leading-tight text-foreground">
 {post.title}
 </h3>
 <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
 {post.excerpt}
 </p>

 <span className="mt-4 inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-muted-foreground">
 {post.category}
 </span>

 <dl className="mt-4 grid gap-2 text-xs font-bold text-muted-foreground sm:grid-cols-2">
 <div>
 <dt className="text-muted">Autor</dt>
 <dd className="mt-1">{post.authorName}</dd>
 </div>
 <div>
 <dt className="text-muted">Actualizado</dt>
 <dd className="mt-1">{formatDate(post.updated_at)}</dd>
 </div>
 </dl>

 </article>
 ))}
 </div>
 ) : (
 <div className="mt-6 rounded-[22px] bg-background px-5 py-12 text-center">
 <p className="font-extrabold text-foreground">
 Todavia no hay blogs publicados.
 </p>
 <p className="mt-2 text-sm leading-6 text-muted">
 Crea el primer blog y decide si queda publicado, oculto o anclado.
 </p>
 <Button asChild className="mt-5">
 <Link href="/app/blog">
 <Plus className="size-4" aria-hidden="true" />
 Crear primer blog
 </Link>
 </Button>
 </div>
 )}
 </section>
 ) : null}

 <ConfirmationDialog
 open={Boolean(confirmation)}
 onOpenChange={(open) => {
 if (!open) {
 setConfirmation(null);
 }
 }}
 title={confirmationTitle}
 description={confirmationDescription}
 confirmLabel={confirmationLabel}
 pendingLabel={
 confirmation?.type === "delete"
 ? "Eliminando…"
 : confirmation?.type === "update"
 ? "Guardando…"
 : "Actualizando…"
 }
 tone={confirmation?.type === "delete" ? "destructive" : "default"}
 onConfirm={confirmAction}
 />
 </div>
 );
}
