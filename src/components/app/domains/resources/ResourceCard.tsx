import {
 Pencil,
 Power,
 RotateCcw,
 Trash2,
} from "lucide-react";

import { CardActionsMenu } from "@/components/app/shared/card-actions-menu";
import type { MultimediaResource } from "@/lib/resources/data";
import { cn } from "@/lib/utils";

import { AREA_DETAILS } from "./constants";
import { ResourcePreview, ResourcePreviewIcon } from "./ResourcePreview";
import {
 formatDate,
 formatFileSize,
 getAreaLabel,
 getResourceKindLabel,
 getUrlPresentation,
} from "./utils";

export function ResourceCard({
 canManage,
 onDelete,
 onEditExternal,
 onEditPdf,
 onToggleStatus,
 resource,
}: {
 canManage: boolean;
 onDelete: (resource: MultimediaResource) => void;
 onEditExternal: (resource: MultimediaResource) => void;
 onEditPdf: (resource: MultimediaResource) => void;
 onToggleStatus: (resource: MultimediaResource) => void;
 resource: MultimediaResource;
}) {
 const area = AREA_DETAILS[resource.area];
 const AreaIcon = area.icon;
 const isPdf = resource.kind === "pdf";
 const isInactive = resource.status === "inactive";
 const presentation =
 !isPdf && resource.file_url ? getUrlPresentation(resource.file_url) : null;
 const kindLabel = getResourceKindLabel(resource);
 const sourceLabel = isPdf
 ? resource.file_name ?? "Documento PDF"
 : presentation?.domain ?? "Enlace externo";
 const actionItems = canManage
 ? [
 {
 icon: Pencil,
 label: resource.folder_id
 ? "Editar o quitar carpeta"
 : "Editar o mover",
 onSelect: () =>
 isPdf ? onEditPdf(resource) : onEditExternal(resource),
 },
 isInactive
 ? {
 icon: RotateCcw,
 label: "Activar",
 onSelect: () => onToggleStatus(resource),
 }
 : {
 destructive: true,
 icon: Power,
 label: "Desactivar",
 onSelect: () => onToggleStatus(resource),
 },
 {
 destructive: true,
 icon: Trash2,
 label: "Eliminar",
 onSelect: () => onDelete(resource),
 separatorBefore: true,
 },
 ]
 : [];

 return (
 <article
 className={cn(
 "flex h-fit min-w-0 self-start flex-col rounded-[20px] bg-background p-4 ",
 isInactive && "opacity-70",
 )}
 >
 <div className="flex items-start gap-3">
 <ResourcePreviewIcon resource={resource} />

 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-extrabold text-primary-foreground">
 {kindLabel}
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-extrabold text-foreground">
 <AreaIcon className="size-3.5" aria-hidden="true" />
 {getAreaLabel(resource.area)}
 </span>
 {canManage ? (
 <span
 className={cn(
 "rounded-full px-2.5 py-1 text-xs font-extrabold",
 isInactive
 ? "bg-muted-surface/15 text-muted"
 : "bg-primary-soft text-foreground",
 )}
 >
 {isInactive ? "Inactivo" : "Activo"}
 </span>
 ) : null}
 </div>

 <h3 className="mt-2 min-w-0 break-words text-lg font-bold leading-tight text-foreground">
 {resource.title}
 </h3>
 <p className="mt-1 truncate text-xs font-bold text-muted" translate="no">
 {sourceLabel}
 </p>
 </div>

 {canManage ? (
 <CardActionsMenu
 label={resource.title}
 items={actionItems}
 />
 ) : null}
 </div>

 <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">
 {resource.description || area.summary}
 </p>

 <dl className="mt-4 grid gap-3 border-t pt-4 text-xs font-bold text-muted-foreground sm:grid-cols-2">
 {resource.folderName ? (
 <div>
 <dt className="text-muted">Carpeta</dt>
 <dd className="mt-1 break-words">{resource.folderName}</dd>
 </div>
 ) : null}
 {resource.creatorName ? (
 <div>
 <dt className="text-muted">Creador</dt>
 <dd className="mt-1 break-words">{resource.creatorName}</dd>
 </div>
 ) : null}
 {isPdf ? (
 <div>
 <dt className="text-muted">Archivo</dt>
 <dd className="mt-1 break-words">
 {formatFileSize(resource.file_size)}
 </dd>
 </div>
 ) : null}
 <div>
 <dt className="text-muted">Actualizado</dt>
 <dd className="mt-1 tabular-nums">{formatDate(resource.updated_at)}</dd>
 </div>
 </dl>

 <ResourcePreview resource={resource} />
 </article>
 );
}