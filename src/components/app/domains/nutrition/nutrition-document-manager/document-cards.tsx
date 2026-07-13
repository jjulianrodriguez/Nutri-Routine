"use client";

import { FileText, Pencil, Power, RotateCcw, Trash2 } from "lucide-react";

import { CardActionsMenu } from "@/components/app/shared/card-actions-menu";
import type {
 NutritionDocumentClientRecord,
 NutritionDocumentRecord,
} from "@/lib/nutrition-documents/types";
import { cn } from "@/lib/utils";

import { formatNutritionDocumentDate, formatNutritionFileSize } from "./helpers";
import { PdfOpenButton } from "./pdf-open-button";

export function CurrentMealPlanCard({
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
     <div className="grid size-11 shrink-0 place-items-center rounded-[16px] bg-surface text-muted-foreground"><FileText className="size-5" aria-hidden="true" /></div>
     <div className="min-w-0">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Plan vigente</p>
      <h2 className="mt-2 break-words text-2xl font-bold leading-tight text-foreground">{document?.title ?? "Tu plan aparecerá aquí"}</h2>
      {document ? (
       <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted-foreground">
        <div><dt className="sr-only">Actualizado</dt><dd>Actualizado {formatNutritionDocumentDate(document.updatedAt)}</dd></div>
        {professionalName || document.createdByName ? <div><dt className="sr-only">Profesional</dt><dd>{professionalName ?? document.createdByName}</dd></div> : null}
       </dl>
      ) : <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Cuando tu nutricionista comparta un PDF activo, podrás abrirlo desde esta pantalla.</p>}
     </div>
    </div>
    {document ? <PdfOpenButton documentId={document.id} label="Abrir plan" variant="default" /> : null}
   </div>
   {document?.description ? <p className="mt-5 max-w-3xl rounded-[18px] border-primary/25 bg-surface/80 px-4 py-3 text-sm leading-6 text-muted">{document.description}</p> : null}
  </section>
 );
}

export function NutritionDocumentCard({
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
 const documentTypeLabel = document.documentType === "meal_plan" ? "Plan de alimentación" : "Documento";

 return (
  <article className={cn("flex h-fit min-w-0 self-start flex-col rounded-[24px] bg-background p-5 ", isInactive && "opacity-70")}>
   <div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-start gap-3">
     <div className="grid size-11 shrink-0 place-items-center rounded-[16px] bg-primary-soft text-muted-foreground"><FileText className="size-5" aria-hidden="true" /></div>
     <div className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">{documentTypeLabel}</p><h3 className="mt-1 break-words text-xl font-extrabold leading-tight text-foreground">{document.title}</h3></div>
    </div>
    {canManage && onEdit && onDeactivate && onActivate && onDelete ? (
     <CardActionsMenu label={document.title} items={[
      { icon: Pencil, label: "Editar", onSelect: () => onEdit(document) },
      isInactive ? { icon: RotateCcw, label: "Activar", onSelect: () => onActivate(document) } : { destructive: true, icon: Power, label: "Desactivar", onSelect: () => onDeactivate(document) },
      { destructive: true, icon: Trash2, label: "Eliminar", onSelect: () => onDelete(document), separatorBefore: true },
     ]} />
    ) : null}
   </div>
   <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{document.description || "Documento PDF disponible para consulta."}</p>
   <dl className="mt-5 grid gap-3 border-t pt-4 text-xs font-bold text-muted-foreground sm:grid-cols-2">
    {document.clientName ? <div><dt className="text-muted">Clienta asignada</dt><dd className="mt-1 break-words">{document.clientName}</dd></div> : null}
    <div><dt className="text-muted">Subido</dt><dd className="mt-1 tabular-nums">{formatNutritionDocumentDate(document.createdAt)}</dd></div>
    <div><dt className="text-muted">Archivo</dt><dd className="mt-1 break-words">{document.fileName} · {formatNutritionFileSize(document.fileSize)}</dd></div>
    {canManage ? <div><dt className="text-muted">Estado</dt><dd className="mt-1.5"><span className={cn("rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider", isInactive ? "bg-muted/15 text-muted" : "bg-primary-soft text-foreground")}>{isInactive ? "Inactivo" : "Activo"}</span></dd></div> : null}
   </dl>
   <div className="mt-5"><PdfOpenButton documentId={document.id} /></div>
  </article>
 );
}

export function ClientMealPlanSummary({ clients }: { clients: NutritionDocumentClientRecord[] }) {
 return (
  <section className="h-fit self-start rounded-[28px] bg-surface p-5 sm:p-6">
   <div className="flex items-center gap-3">
    <div className="grid size-11 place-items-center rounded-[16px] bg-secondary-soft text-muted-foreground"><FileText className="size-5" aria-hidden="true" /></div>
    <div><h2 className="text-2xl font-bold text-foreground">Plan por clienta</h2><p className="mt-1 text-sm leading-6 text-muted">Último PDF activo asignado a cada clienta de nutrición.</p></div>
   </div>
   <div className="mt-5 grid gap-3">
    {clients.length === 0 ? <div className="h-fit self-start rounded-[20px] bg-background p-5 text-sm font-semibold text-muted">No hay clientas de nutrición disponibles para asignar documentos.</div> : clients.map((client) => (
     <div key={client.id} className="flex h-fit flex-col gap-3 self-start rounded-[20px] bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0"><p className="font-extrabold text-foreground">{client.name}</p><p className="mt-1 text-sm leading-6 text-muted">{client.currentMealPlan ? client.currentMealPlan.title : "Sin plan PDF activo"}</p></div>
      {client.currentMealPlan ? <PdfOpenButton documentId={client.currentMealPlan.id} /> : null}
     </div>
    ))}
   </div>
  </section>
 );
}
