"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
 createBlogPost,
 deleteBlogPost,
 updateBlogPinned,
 updateBlogPost,
 updateBlogVisibility,
 type BlogActionResult,
} from "@/lib/actions/blog";
import type { AdminBlogPost } from "@/lib/blog/admin-posts";
import { getEditableBlogContent } from "@/lib/blog/content";
import { blogPostValuesSchema, type BlogPostValues } from "@/lib/validations/blog";

import type { BlogConfirmation, BlogManagerProps, BlogSaveStatus } from "../types";

const defaultValues: BlogPostValues = {
 category: "Bienestar",
 content: "",
 isPinned: false,
 published: false,
 title: "",
};

export function useBlogManager({ initialPosts = [], mode = "manage" }: BlogManagerProps) {
 const router = useRouter();
 const formRef = useRef<HTMLDivElement>(null);
 const [editingPost, setEditingPost] = useState<AdminBlogPost | null>(null);
 const [confirmation, setConfirmation] = useState<BlogConfirmation | null>(null);
 const [saveStatusOverride, setSaveStatusOverride] = useState<Extract<BlogSaveStatus, "idle" | "saved" | "error">>("idle");
 const [serverMessage, setServerMessage] = useState("");
 const form = useForm<BlogPostValues>({
  defaultValues,
  resolver: zodResolver(blogPostValuesSchema),
 });
 const { clearErrors, control, formState, reset, setError } = form;
 const isPinned = useWatch({ control, name: "isPinned" });
 const contentValue = useWatch({ control, name: "content" });
 const isManageMode = mode === "manage";
 const showEditor = mode === "create" || Boolean(editingPost);
 const hasUnsavedChanges = formState.isDirty && !formState.isSubmitting;
 const saveStatus: BlogSaveStatus = formState.isSubmitting ? "saving" : formState.isDirty ? "dirty" : saveStatusOverride;

 useEffect(() => {
  if (editingPost) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
 }, [editingPost]);

 useEffect(() => {
  if (!hasUnsavedChanges) return;
  const message = "Tienes cambios sin guardar. Si sales ahora, se perderan.";
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
   event.preventDefault();
   event.returnValue = message;
  };
  const handleDocumentClick = (event: MouseEvent) => {
   const target = event.target;
   if (!(target instanceof Element)) return;
   const anchor = target.closest("a[href]");
   if (!(anchor instanceof HTMLAnchorElement)) return;
   if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
   if (window.confirm(message)) return;
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
  return !hasUnsavedChanges || window.confirm("Tienes cambios sin guardar. Si continuas, se perderan.");
 }

 function startEditing(post: AdminBlogPost) {
  if (!confirmDiscardChanges()) return;
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

 function clearForm(nextStatus: Extract<BlogSaveStatus, "idle" | "saved"> = "idle") {
  if (nextStatus === "idle" && !confirmDiscardChanges()) return;
  setEditingPost(null);
  setServerMessage("");
  setSaveStatusOverride(nextStatus);
  clearErrors();
  reset(defaultValues);
 }

 async function savePost(values: BlogPostValues, post: AdminBlogPost | null) {
  setServerMessage("");
  setSaveStatusOverride("idle");
  clearErrors("root");
  let result: BlogActionResult;

  try {
   result = post ? await updateBlogPost({ ...values, id: post.id }) : await createBlogPost(values);
  } catch {
   const message = "No pudimos guardar el blog. Revisa tu conexion e intenta de nuevo.";
   setSaveStatusOverride("error");
   setServerMessage(message);
   toast.error(message);
   return;
  }

  if (result.status === "error") {
   setSaveStatusOverride("error");
   if (result.fieldErrors) {
    Object.entries(result.fieldErrors).forEach(([field, message]) => {
     if (message) setError(field as keyof BlogPostValues, { message });
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

 async function changeStatus(post: AdminBlogPost, action: () => Promise<BlogActionResult>) {
  try {
   const result = await action();
   if (result.status === "error") toast.error(result.message);
   else {
    toast.success(result.message);
    if (editingPost?.id === post.id) clearForm();
    router.refresh();
   }
  } catch {
   toast.error("Ocurrió un error inesperado al actualizar el blog. Inténtalo de nuevo.");
  }
 }

 async function confirmAction() {
  if (!confirmation) return;
  if (confirmation.type === "update") return savePost(confirmation.values, confirmation.post);
  if (confirmation.type === "delete") return changeStatus(confirmation.post, () => deleteBlogPost(confirmation.post.id));
  if (confirmation.type === "visibility") return changeStatus(confirmation.post, () => updateBlogVisibility(confirmation.post.id, !confirmation.post.published));
  return changeStatus(confirmation.post, () => updateBlogPinned(confirmation.post.id, !confirmation.post.is_pinned));
 }

 const confirmationTitle = confirmation?.type === "update" ? "Guardar cambios del blog" : confirmation?.type === "delete" ? "Eliminar blog" : confirmation?.type === "visibility" ? confirmation.post.published ? "Ocultar blog" : "Mostrar blog" : confirmation?.post.is_pinned ? "Desanclar blog" : "Anclar blog";
 const confirmationDescription = confirmation?.type === "update" ? `Se actualizará "${confirmation.values.title}" con la información del formulario.` : confirmation?.type === "delete" ? `Se eliminará definitivamente "${confirmation.post.title}". Esta acción no se puede deshacer.` : confirmation?.type === "visibility" ? confirmation.post.published ? `"${confirmation.post.title}" dejará de estar visible en el blog público.` : `"${confirmation.post.title}" volverá a estar visible en el blog público.` : confirmation?.post.is_pinned ? `"${confirmation.post.title}" dejará de ser la publicación principal.` : confirmation ? `"${confirmation.post.title}" se mostrará como publicación principal.` : "";
 const confirmationLabel = confirmation?.type === "update" ? "Guardar cambios" : confirmation?.type === "delete" ? "Eliminar blog" : confirmation?.type === "visibility" ? confirmation.post.published ? "Ocultar" : "Mostrar" : confirmation?.post.is_pinned ? "Desanclar" : "Anclar";

 return {
  clearForm,
  confirmation,
  confirmationDescription,
  confirmationLabel,
  confirmationTitle,
  confirmAction,
  contentValue,
  editingPost,
  form,
  formRef,
  initialPosts,
  isManageMode,
  isPinned,
  onSubmit,
  saveStatus,
  serverMessage,
  setConfirmation,
  showEditor,
  startEditing,
 };
}

export type BlogManagerViewModel = ReturnType<typeof useBlogManager>;
