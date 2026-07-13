"use client";

import { Loader2, Plus, Save, X } from "lucide-react";
import { Controller } from "react-hook-form";

import { BlogRichTextEditor } from "@/components/app/domains/blog/blog-rich-text-editor/BlogRichTextEditor";
import { Button } from "@/components/ui/actions/button";
import { Checkbox } from "@/components/ui/forms/checkbox";
import { FormAlert, FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";

import type { BlogManagerViewModel } from "./hooks/use-blog-manager";
import { SaveStatusBadge } from "./save-status-badge";

export function BlogEditorSection({ manager }: { manager: BlogManagerViewModel }) {
 const { editingPost, form, formRef } = manager;
 const {
  control,
  formState: { errors, isSubmitting },
  handleSubmit,
  register,
  setValue,
  trigger,
 } = form;

 return (
  <div ref={formRef} className="min-w-0 scroll-mt-6 rounded-[28px] bg-surface p-5 sm:p-6">
   <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
    <div>
     <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">{editingPost ? "Edición" : "Nuevo contenido"}</p>
     <h2 className="mt-2 text-3xl font-semibold text-foreground">{editingPost ? "Editar blog" : "Crear blog"}</h2>
    </div>
    <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
     <SaveStatusBadge status={manager.saveStatus} />
     {editingPost ? <Button type="button" variant="ghost" onClick={() => manager.clearForm()}><X className="size-4" aria-hidden="true" />Cancelar</Button> : null}
    </div>
   </div>

   <form className="mt-6 min-w-0 space-y-5" onSubmit={handleSubmit(manager.onSubmit)} noValidate>
    <FormField controlId="blog-title" error={errors.title?.message} errorId="blog-title-error" label="Titulo">
     <Input aria-invalid={Boolean(errors.title)} maxLength={180} {...register("title")} />
    </FormField>
    <FormField controlId="blog-category" error={errors.category?.message} errorId="blog-category-error" hint="Esta categoría aparecerá como filtro en el blog público." hintId="blog-category-help" label="Categoría">
     <Input list="blog-category-options" aria-invalid={Boolean(errors.category)} maxLength={80} placeholder="Bienestar" {...register("category")} />
    </FormField>
    <datalist id="blog-category-options"><option value="Bienestar" /><option value="Nutrición" /><option value="Entrenamiento" /><option value="Consejos" /></datalist>
    <FormField controlId="blog-content" error={errors.content?.message} errorId="blog-content-error" hint="El editor guarda texto con formato; no necesitas usar código ni Markdown." hintId="blog-content-help" label="Contenido">
     <Input type="hidden" {...register("content")} />
     <div className="min-w-0">
      <BlogRichTextEditor
       id="blog-content"
       describedBy={["blog-content-help", errors.content ? "blog-content-error" : ""].filter(Boolean).join(" ")}
       disabled={isSubmitting}
       error={Boolean(errors.content)}
       value={manager.contentValue ?? ""}
       onBlur={() => { void trigger("content"); }}
       onChange={(nextContent) => setValue("content", nextContent, { shouldDirty: true, shouldTouch: true, shouldValidate: Boolean(errors.content) })}
      />
     </div>
    </FormField>

    <div className="grid gap-3 sm:grid-cols-2">
     <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-[18px] bg-background px-4 py-3">
      <Controller control={control} name="published" render={({ field }) => <Checkbox ref={field.ref} name={field.name} checked={field.value} onBlur={field.onBlur} onCheckedChange={(checked) => field.onChange(checked === true)} />} />
      <span><span className="block font-extrabold text-foreground">Visible</span><span className="mt-1 block text-xs leading-5 text-muted">Mostrar públicamente.</span></span>
     </label>
     <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-[18px] bg-background px-4 py-3">
      <Controller control={control} name="isPinned" render={({ field }) => <Checkbox ref={field.ref} name={field.name} checked={field.value} onBlur={field.onBlur} onCheckedChange={(checked) => { const isChecked = checked === true; field.onChange(isChecked); if (isChecked) setValue("published", true, { shouldValidate: true }); }} />} />
      <span><span className="block font-extrabold text-foreground">Blog principal</span><span className="mt-1 block text-xs leading-5 text-muted">Anclarlo desancla el anterior.</span></span>
     </label>
    </div>

    <FormAlert tone="notice" message={manager.isPinned ? "Un blog principal siempre queda visible." : null} />
    <FormAlert message={manager.serverMessage} />
    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
     {isSubmitting ? <><Loader2 className="size-4 animate-spin" aria-hidden="true" />Guardando...</> : editingPost ? <><Save className="size-4" aria-hidden="true" />Guardar cambios</> : <><Plus className="size-4" aria-hidden="true" />Crear blog</>}
    </Button>
   </form>
  </div>
 );
}
