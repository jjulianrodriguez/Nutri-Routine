"use client";

import { Loader2, RefreshCw, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/actions/button";
import { FormAlert, FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import { Textarea } from "@/components/ui/forms/textarea";
import {
 updateNutritionDocument,
 uploadMealPlanDocument,
} from "@/lib/actions/nutrition-documents";
import { NUTRITION_PDF_MAX_SIZE_BYTES } from "@/lib/nutrition-documents/constants";
import type {
 NutritionDocumentClientRecord,
 NutritionDocumentRecord,
} from "@/lib/nutrition-documents/types";

import { readNutritionPdfError } from "./helpers";
import type { NutritionDocumentFieldErrorMap } from "./types";

export function MealPlanUploadForm({ clients }: { clients: NutritionDocumentClientRecord[] }) {
 const router = useRouter();
 const [fieldErrors, setFieldErrors] = useState<NutritionDocumentFieldErrorMap>({});
 const [message, setMessage] = useState("");
 const [isPending, setIsPending] = useState(false);

 async function onSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setMessage("");
  setFieldErrors({});
  const form = event.currentTarget;
  const formData = new FormData(form);
  const fileError = readNutritionPdfError(formData, true);

  if (fileError) {
   setFieldErrors({ file: fileError });
   setMessage(fileError);
   toast.error(fileError);
   return;
  }

  setIsPending(true);
  try {
   const result = await uploadMealPlanDocument(formData);
   if (result.status === "error") {
    setFieldErrors(result.fieldErrors ?? {});
    setMessage(result.message);
    toast.error(result.message);
    return;
   }
   toast.success(result.message);
   form.reset();
   router.refresh();
  } finally {
   setIsPending(false);
  }
 }

 return (
  <form className="space-y-4" onSubmit={onSubmit} noValidate>
   {clients.length === 0 ? <FormAlert tone="notice">No tienes clientas de nutrición asignadas para subir planes de alimentación.</FormAlert> : null}
   <Select id="meal-plan-client" name="clientId" label="Clienta" labelClassName="font-extrabold" error={fieldErrors.clientId} required disabled={isPending}>
    <option value="">Seleccionar clienta</option>
    {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
   </Select>
   <FormField controlId="meal-plan-title" error={fieldErrors.title} errorId="meal-plan-title-error" label="Título">
    <Input name="title" maxLength={180} required disabled={isPending} />
   </FormField>
   <FormField controlId="meal-plan-description" error={fieldErrors.description} errorId="meal-plan-description-error" label="Descripción opcional">
    <Textarea name="description" rows={4} maxLength={2000} disabled={isPending} />
   </FormField>
   <FormField controlId="meal-plan-file" error={fieldErrors.file} errorId="meal-plan-file-error" hint={`Máximo ${Math.round(NUTRITION_PDF_MAX_SIZE_BYTES / 1024 / 1024)} MB.`} label="PDF">
    <Input name="file" type="file" accept="application/pdf,.pdf" disabled={isPending} className="h-auto py-3" required />
   </FormField>
   <FormAlert message={message} />
   <Button type="submit" size="lg" disabled={isPending || clients.length === 0} title={clients.length === 0 ? "Necesitas una clienta de nutrición asignada para subir un plan." : isPending ? "Subiendo el PDF." : "Subir plan de alimentación"}>
    {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}
    Subir plan
   </Button>
  </form>
 );
}

export function DocumentEditForm({ document, onCancel }: { document: NutritionDocumentRecord; onCancel: () => void }) {
 const router = useRouter();
 const [fieldErrors, setFieldErrors] = useState<NutritionDocumentFieldErrorMap>({});
 const [message, setMessage] = useState("");
 const [isPending, setIsPending] = useState(false);

 async function onSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setMessage("");
  setFieldErrors({});
  const formData = new FormData(event.currentTarget);
  const fileError = readNutritionPdfError(formData, false);

  if (fileError) {
   setFieldErrors({ file: fileError });
   setMessage(fileError);
   toast.error(fileError);
   return;
  }

  setIsPending(true);
  try {
   const result = await updateNutritionDocument(formData);
   if (result.status === "error") {
    setFieldErrors(result.fieldErrors ?? {});
    setMessage(result.message);
    toast.error(result.message);
    return;
   }
   toast.success(result.message);
   onCancel();
   router.refresh();
  } finally {
   setIsPending(false);
  }
 }

 return (
  <section className="h-fit self-start rounded-[28px] border-primary/25 bg-primary-soft/65 p-5 sm:p-6">
   <div className="flex flex-wrap items-start justify-between gap-3">
    <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">Edición</p><h2 className="mt-2 text-2xl font-bold text-foreground">Editar documento</h2></div>
    <Button type="button" variant="ghost" onClick={onCancel}><X className="size-4" aria-hidden="true" />Cancelar</Button>
   </div>
   <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
    <Input type="hidden" name="id" value={document.id} />
    <FormField controlId="document-edit-title" error={fieldErrors.title} errorId="document-edit-title-error" label="Título">
     <Input name="title" className="h-12 rounded-control" defaultValue={document.title} maxLength={180} required />
    </FormField>
    <FormField controlId="document-edit-description" error={fieldErrors.description} errorId="document-edit-description-error" label="Descripción opcional">
     <Textarea name="description" rows={4} maxLength={2000} defaultValue={document.description ?? ""} className="min-h-0 rounded-[20px] border-input" />
    </FormField>
    <FormField controlId="document-edit-file" error={fieldErrors.file} errorId="document-edit-file-error" label="Reemplazar PDF opcional">
     <Input name="file" type="file" accept="application/pdf,.pdf" className="h-auto rounded-control py-3" />
    </FormField>
    <FormAlert message={message} />
    <Button type="submit" size="lg" disabled={isPending}>
     {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="size-4" aria-hidden="true" />}
     Guardar cambios
    </Button>
   </form>
  </section>
 );
}
