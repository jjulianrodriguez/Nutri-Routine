"use client";

import {
 Download,
 FileText,
 Loader2,
 Pencil,
 Plus,
 Power,
 RefreshCw,
 RotateCcw,
 Trash2,
 Upload,
 X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CardActionsMenu } from "@/components/app/card-actions-menu";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { FieldError, FormAlert } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
 activateNutritionDocument,
 createNutritionDocumentSignedUrl,
 deactivateNutritionDocument,
 deleteNutritionDocument,
 updateNutritionDocument,
 uploadMealPlanDocument,
} from "@/lib/actions/nutrition-documents";
import {
 NUTRITION_PDF_MAX_SIZE_BYTES,
} from "@/lib/nutrition-documents/constants";
import type {
 NutritionDocumentClientRecord,
 NutritionDocumentRecord,
} from "@/lib/nutrition-documents/types";
import { getPdfValidationError } from "@/lib/validations/nutrition-documents";
import { cn } from "@/lib/utils";

type NutritionDocumentManagerProps = {
 canManage: boolean;
 clients: NutritionDocumentClientRecord[];
 mealPlanDocuments: NutritionDocumentRecord[];
 professionalName?: string | null;
};

type FieldErrors = Record<string, string | undefined>;

type ConfirmationState = {
 document: NutritionDocumentRecord;
 type: "deactivate-document" | "activate-document" | "delete-document";
};

function formatDate(value: string) {
 return new Intl.DateTimeFormat("es-CR", {
 dateStyle: "medium",
 timeZone: "America/Costa_Rica",
 }).format(new Date(value));
}

function formatFileSize(bytes: number) {
 if (bytes < 1024 * 1024) {
 return `${Math.max(1, Math.round(bytes / 1024))} KB`;
 }

 return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function PdfOpenButton({
 documentId,
 label = "Abrir PDF",
 variant = "outline",
}: {
 documentId: string;
 label?: string;
 variant?: "default" | "outline";
}) {
 const [isPending, setIsPending] = useState(false);

 async function openDocument() {
 setIsPending(true);

 try {
 const result = await createNutritionDocumentSignedUrl(documentId);

 if (result.status === "error" || !result.signedUrl) {
 toast.error(result.message);
 return;
 }

 window.open(result.signedUrl, "_blank", "noopener,noreferrer");
 } finally {
 setIsPending(false);
 }
 }

 return (
 <Button
 type="button"
 variant={variant}
 size="sm"
 onClick={openDocument}
 disabled={isPending}
 title={isPending ? "Preparando enlace seguro del PDF" : label}
 >
 {isPending ? (
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 ) : (
 <Download className="size-4" aria-hidden="true" />
 )}
 {label}
 </Button>
 );
}

function CurrentMealPlanCard({
 document,
 professionalName,
}: {
 document: NutritionDocumentRecord | null;
 professionalName?: string | null;
}) {
 return (
 <section className="h-fit self-start rounded-[28px] border-primary/30 bg-primary-soft/70 p-5 sm:p-6">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 <div className="flex min-w-0 items-start gap-3">
 <div className="grid size-11 shrink-0 place-items-center rounded-[16px] bg-surface text-muted-foreground">
 <FileText className="size-5" aria-hidden="true" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 Plan vigente
 </p>
 <h2 className="mt-2 break-words text-2xl font-bold leading-tight text-foreground">
 {document?.title ?? "Tu plan aparecerá aquí"}
 </h2>
 {document ? (
 <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted-foreground">
 <div>
 <dt className="sr-only">Actualizado</dt>
 <dd>Actualizado {formatDate(document.updatedAt)}</dd>
 </div>
 {professionalName || document.createdByName ? (
 <div>
 <dt className="sr-only">Profesional</dt>
 <dd>{professionalName ?? document.createdByName}</dd>
 </div>
 ) : null}
 </dl>
 ) : (
 <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
 Cuando tu nutricionista comparta un PDF activo, podrás abrirlo
 desde esta pantalla.
 </p>
 )}
 </div>
 </div>

 {document ? (
 <PdfOpenButton
 documentId={document.id}
 label="Abrir plan"
 variant="default"
 />
 ) : null}
 </div>

 {document?.description ? (
 <p className="mt-5 max-w-3xl rounded-[18px] border-primary/25 bg-surface/80 px-4 py-3 text-sm leading-6 text-muted">
 {document.description}
 </p>
 ) : null}
 </section>
 );
}

function DocumentCard({
 canManage,
 document,
 onActivate,
 onDeactivate,
 onDelete,
 onEdit,
}: {
 canManage: boolean;
 document: NutritionDocumentRecord;
 onActivate?: (document: NutritionDocumentRecord) => void;
 onDeactivate?: (document: NutritionDocumentRecord) => void;
 onDelete?: (document: NutritionDocumentRecord) => void;
 onEdit?: (document: NutritionDocumentRecord) => void;
}) {
 const isInactive = document.status === "inactive";
 const documentTypeLabel =
 document.documentType === "meal_plan" ? "Plan de alimentación" : "Documento";

 return (
 <article
 className={cn(
 "flex h-fit min-w-0 self-start flex-col rounded-[24px] bg-background p-5 ",
 isInactive && "opacity-70",
 )}
 >
 <div className="flex items-start justify-between gap-3">
 <div className="flex min-w-0 items-start gap-3">
 <div className="grid size-11 shrink-0 place-items-center rounded-[16px] bg-primary-soft text-muted-foreground">
 <FileText className="size-5" aria-hidden="true" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 {documentTypeLabel}
 </p>
 <h3 className="mt-1 break-words text-xl font-extrabold leading-tight text-foreground">
 {document.title}
 </h3>
 </div>
 </div>

 {canManage && onEdit && onDeactivate && onActivate && onDelete ? (
 <CardActionsMenu
 label={document.title}
 items={[
 {
 icon: Pencil,
 label: "Editar",
 onSelect: () => onEdit(document),
 },
 isInactive
 ? {
 icon: RotateCcw,
 label: "Activar",
 onSelect: () => onActivate(document),
 }
 : {
 destructive: true,
 icon: Power,
 label: "Desactivar",
 onSelect: () => onDeactivate(document),
 },
 {
 destructive: true,
 icon: Trash2,
 label: "Eliminar",
 onSelect: () => onDelete(document),
 separatorBefore: true,
 },
 ]}
 />
 ) : null}
 </div>

 <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">
 {document.description || "Documento PDF disponible para consulta."}
 </p>

 <dl className="mt-5 grid gap-3 border-t pt-4 text-xs font-bold text-muted-foreground sm:grid-cols-2">
 {document.clientName ? (
 <div>
 <dt className="text-muted">Clienta asignada</dt>
 <dd className="mt-1 break-words">{document.clientName}</dd>
 </div>
 ) : null}
 <div>
 <dt className="text-muted">Subido</dt>
 <dd className="mt-1 tabular-nums">{formatDate(document.createdAt)}</dd>
 </div>
 <div>
 <dt className="text-muted">Archivo</dt>
 <dd className="mt-1 break-words">
 {document.fileName} · {formatFileSize(document.fileSize)}
 </dd>
 </div>
 {canManage ? (
 <div>
 <dt className="text-muted">Estado</dt>
 <dd className="mt-1.5">
 <span
 className={cn(
 "rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider",
 isInactive
 ? "bg-muted/15 text-muted"
 : "bg-primary-soft text-foreground",
 )}
 >
 {isInactive ? "Inactivo" : "Activo"}
 </span>
 </dd>
 </div>
 ) : null}
 </dl>

 <div className="mt-5">
 <PdfOpenButton documentId={document.id} />
 </div>
 </article>
 );
}

function readFileError(formData: FormData, required: boolean) {
 const value = formData.get("file");

 if (value instanceof File && value.size > 0) {
 return getPdfValidationError(value);
 }

 return required ? "Selecciona un archivo PDF." : null;
}

function MealPlanUploadForm({
 clients,
}: {
 clients: NutritionDocumentClientRecord[];
}) {
 const router = useRouter();
 const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
 const [message, setMessage] = useState("");
 const [isPending, setIsPending] = useState(false);

 async function onSubmit(event: FormEvent<HTMLFormElement>) {
 event.preventDefault();
 setMessage("");
 setFieldErrors({});

 const form = event.currentTarget;
 const formData = new FormData(form);
 const fileError = readFileError(formData, true);

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
 {clients.length === 0 ? (
 <FormAlert tone="notice">
 No tienes clientas de nutrición asignadas para subir planes de alimentación.
 </FormAlert>
 ) : null}

 <Select
 id="meal-plan-client"
 name="clientId"
 label="Clienta"
 labelClassName="font-extrabold"
 error={fieldErrors.clientId}
 required
 disabled={isPending}
 >
 <option value="">Seleccionar clienta</option>
 {clients.map((client) => (
 <option key={client.id} value={client.id}>
 {client.name}
 </option>
 ))}
 </Select>

 <div>
 <Label htmlFor="meal-plan-title" className="font-extrabold text-foreground">
 Título
 </Label>
 <Input
 id="meal-plan-title"
 name="title"
 className="mt-2"
 maxLength={180}
 required
 disabled={isPending}
 />
 <FieldError id="meal-plan-title-error" message={fieldErrors.title} />
 </div>

 <div>
 <Label htmlFor="meal-plan-description" className="font-extrabold text-foreground">
 Descripción opcional
 </Label>
 <Textarea
 id="meal-plan-description"
 name="description"
 rows={4}
 maxLength={2000}
 disabled={isPending}
 className="mt-2"
 />
 <FieldError
 id="meal-plan-description-error"
 message={fieldErrors.description}
 />
 </div>

 <div>
 <Label htmlFor="meal-plan-file" className="font-extrabold text-foreground">
 PDF
 </Label>
 <Input
 id="meal-plan-file"
 name="file"
 type="file"
 accept="application/pdf,.pdf"
 disabled={isPending}
 className="mt-2 h-auto py-3"
 required
 />
 <p className="mt-2 text-sm leading-6 text-muted">
 Máximo {Math.round(NUTRITION_PDF_MAX_SIZE_BYTES / 1024 / 1024)} MB.
 </p>
 <FieldError id="meal-plan-file-error" message={fieldErrors.file} />
 </div>

 <FormAlert message={message} />

 <Button
 type="submit"
 size="lg"
 disabled={isPending || clients.length === 0}
 title={
 clients.length === 0
 ? "Necesitas una clienta de nutrición asignada para subir un plan."
 : isPending
 ? "Subiendo el PDF."
 : "Subir plan de alimentación"
 }
 >
 {isPending ? (
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 ) : (
 <Upload className="size-4" aria-hidden="true" />
 )}
 Subir plan
 </Button>
 </form>
 );
}

function DocumentEditForm({
 document,
 onCancel,
}: {
 document: NutritionDocumentRecord;
 onCancel: () => void;
}) {
 const router = useRouter();
 const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
 const [message, setMessage] = useState("");
 const [isPending, setIsPending] = useState(false);

 async function onSubmit(event: FormEvent<HTMLFormElement>) {
 event.preventDefault();
 setMessage("");
 setFieldErrors({});

 const form = event.currentTarget;
 const formData = new FormData(form);
 const fileError = readFileError(formData, false);

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
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 Edición
 </p>
 <h2 className="mt-2 text-2xl font-bold text-foreground">
 Editar documento
 </h2>
 </div>
 <Button type="button" variant="ghost" onClick={onCancel}>
 <X className="size-4" aria-hidden="true" />
 Cancelar
 </Button>
 </div>

 <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
 <input type="hidden" name="id" value={document.id} />

 <div>
 <Label htmlFor="document-edit-title" className="font-extrabold text-foreground">
 Título
 </Label>
 <Input
 id="document-edit-title"
 name="title"
 className="mt-2 h-12 rounded-control"
 defaultValue={document.title}
 maxLength={180}
 required
 />
 <FieldError id="document-edit-title-error" message={fieldErrors.title} />
 </div>

 <div>
 <Label htmlFor="document-edit-description" className="font-extrabold text-foreground">
 Descripción opcional
 </Label>
 <Textarea
 id="document-edit-description"
 name="description"
 rows={4}
 maxLength={2000}
 defaultValue={document.description ?? ""}
 className="mt-2 min-h-0 rounded-[20px] border-input"
 />
 <FieldError id="document-edit-description-error" message={fieldErrors.description} />
 </div>

 <div>
 <Label htmlFor="document-edit-file" className="font-extrabold text-foreground">
 Reemplazar PDF opcional
 </Label>
 <Input
 id="document-edit-file"
 name="file"
 type="file"
 accept="application/pdf,.pdf"
 className="mt-2 h-auto rounded-control py-3"
 />
 <FieldError id="document-edit-file-error" message={fieldErrors.file} />
 </div>

 <FormAlert message={message} />

 <Button type="submit" size="lg" disabled={isPending}>
 {isPending ? (
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 ) : (
 <RefreshCw className="size-4" aria-hidden="true" />
 )}
 Guardar cambios
 </Button>
 </form>
 </section>
 );
}

function ClientMealPlanSummary({
 clients,
}: {
 clients: NutritionDocumentClientRecord[];
}) {
 return (
 <section className="h-fit self-start rounded-[28px] bg-surface p-5 sm:p-6">
 <div className="flex items-center gap-3">
 <div className="grid size-11 place-items-center rounded-[16px] bg-secondary-soft text-muted-foreground">
 <FileText className="size-5" aria-hidden="true" />
 </div>
 <div>
 <h2 className="text-2xl font-bold text-foreground">
 Plan por clienta
 </h2>
 <p className="mt-1 text-sm leading-6 text-muted">
 Último PDF activo asignado a cada clienta de nutrición.
 </p>
 </div>
 </div>

 <div className="mt-5 grid gap-3">
 {clients.length === 0 ? (
 <div className="h-fit self-start rounded-[20px] bg-background p-5 text-sm font-semibold text-muted">
 No hay clientas de nutrición disponibles para asignar documentos.
 </div>
 ) : (
 clients.map((client) => (
 <div
 key={client.id}
 className="flex h-fit flex-col gap-3 self-start rounded-[20px] bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
 >
 <div className="min-w-0">
 <p className="font-extrabold text-foreground">{client.name}</p>
 <p className="mt-1 text-sm leading-6 text-muted">
 {client.currentMealPlan
 ? client.currentMealPlan.title
 : "Sin plan PDF activo"}
 </p>
 </div>
 {client.currentMealPlan ? (
 <PdfOpenButton documentId={client.currentMealPlan.id} />
 ) : null}
 </div>
 ))
 )}
 </div>
 </section>
 );
}

export function NutritionDocumentManager({
 canManage,
 clients,
 mealPlanDocuments,
 professionalName = null,
}: NutritionDocumentManagerProps) {
 const router = useRouter();
 const [editingDocument, setEditingDocument] =
 useState<NutritionDocumentRecord | null>(null);
 const [confirmation, setConfirmation] = useState<ConfirmationState | null>(
 null,
 );
 const activeMealPlans = mealPlanDocuments.filter(
 (document) => document.status === "active",
 );

 async function confirmAction() {
 if (!confirmation) {
 return;
 }

 let result;
 switch (confirmation.type) {
 case "deactivate-document":
 result = await deactivateNutritionDocument(confirmation.document.id);
 break;
 case "activate-document":
 result = await activateNutritionDocument(confirmation.document.id);
 break;
 case "delete-document":
 result = await deleteNutritionDocument(confirmation.document.id);
 break;
 }

 if (!result) return;

 if (result.status === "error") {
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 router.refresh();
 }

 if (!canManage) {
 const currentPlan = activeMealPlans[0] ?? null;

 return (
 <div className="space-y-6">
 <CurrentMealPlanCard
 document={currentPlan}
 professionalName={professionalName}
 />
 </div>
 );
 }

 let confirmTitle = "";
 let confirmDescription = "";
 let confirmLabel = "";
 let pendingLabel = "";
 let confirmTone: "default" | "destructive" = "default";

 if (confirmation) {
 if (confirmation.type === "deactivate-document") {
 confirmTitle = "Desactivar documento";
 confirmDescription = `El documento "${confirmation.document.title}" dejará de estar disponible para las clientas.`;
 confirmLabel = "Desactivar";
 pendingLabel = "Desactivando...";
 confirmTone = "destructive";
 } else if (confirmation.type === "activate-document") {
 confirmTitle = "Activar documento";
 confirmDescription = `El documento "${confirmation.document.title}" volverá a estar disponible para las clientas.`;
 confirmLabel = "Activar";
 pendingLabel = "Activando...";
 } else if (confirmation.type === "delete-document") {
 confirmTitle = "Eliminar documento";
 confirmDescription = `Se eliminará permanentemente el documento "${confirmation.document.title}" y su archivo PDF. Esta acción no se puede deshacer.`;
 confirmLabel = "Eliminar permanentemente";
 pendingLabel = "Eliminando...";
 confirmTone = "destructive";
 }
 }

 return (
 <div className="space-y-6">
 {editingDocument ? (
 <DocumentEditForm
 document={editingDocument}
 onCancel={() => setEditingDocument(null)}
 />
 ) : null}

 <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
 <section className="h-fit self-start rounded-[28px] bg-surface p-5 sm:p-6">
 <div className="flex items-center gap-3">
 <div className="grid size-11 place-items-center rounded-[16px] bg-primary-soft text-muted-foreground">
 <Plus className="size-5" aria-hidden="true" />
 </div>
 <div>
 <h2 className="text-2xl font-bold text-foreground">
 Subir plan de alimentación
 </h2>
 <p className="mt-1 text-sm leading-6 text-muted">
 Al subir uno nuevo para una clienta se desactiva el PDF activo anterior.
 </p>
 </div>
 </div>
 <div className="mt-5">
 <MealPlanUploadForm clients={clients} />
 </div>
 </section>

 <ClientMealPlanSummary clients={clients} />
 </div>

 <section className="h-fit self-start rounded-[28px] bg-surface p-5 sm:p-6">
 <div className="flex items-center gap-3">
 <div className="grid size-11 place-items-center rounded-[16px] bg-secondary-soft text-muted-foreground">
 <FileText className="size-5" aria-hidden="true" />
 </div>
 <div>
 <h2 className="text-2xl font-bold text-foreground">
 Planes cargados
 </h2>
 <p className="mt-1 text-sm leading-6 text-muted">
 Planes alimenticios con estado, fecha y asignación.
 </p>
 </div>
 </div>

 <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">
 {mealPlanDocuments.length > 0 ? (
 mealPlanDocuments.map((document) => (
 <DocumentCard
 key={document.id}
 canManage
 document={document}
 onDeactivate={(selected) =>
 setConfirmation({
 document: selected,
 type: "deactivate-document",
 })
 }
 onActivate={(selected) =>
 setConfirmation({
 document: selected,
 type: "activate-document",
 })
 }
 onDelete={(selected) =>
 setConfirmation({
 document: selected,
 type: "delete-document",
 })
 }
 onEdit={setEditingDocument}
 />
 ))
 ) : (
 <div className="h-fit self-start rounded-[22px] bg-background px-5 py-12 text-center lg:col-span-2">
 <p className="font-extrabold text-foreground">
 Todavía no hay documentos PDF cargados.
 </p>
 <p className="mt-2 text-sm leading-6 text-muted">
 Sube un plan de alimentación y asígnalo a una clienta para que quede visible.
 </p>
 </div>
 )}
 </div>
 </section>

 <ConfirmationDialog
 open={Boolean(confirmation)}
 onOpenChange={(open) => {
 if (!open) {
 setConfirmation(null);
 }
 }}
 title={confirmTitle}
 description={confirmDescription}
 confirmLabel={confirmLabel}
 pendingLabel={pendingLabel}
 tone={confirmTone}
 onConfirm={confirmAction}
 />
 </div>
 );
}
