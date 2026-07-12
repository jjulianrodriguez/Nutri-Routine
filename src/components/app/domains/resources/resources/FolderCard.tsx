import {
 FolderOpen,
 Pencil,
 Power,
 RotateCcw,
 Trash2,
} from "lucide-react";
import Link from "next/link";

import { CardActionsMenu } from "@/components/app/shared/card-actions-menu";
import { Button } from "@/components/ui/actions/button";
import type { ResourceFolder } from "@/lib/resources/data";
import { cn } from "@/lib/utils";

import { AREA_DETAILS } from "./constants";
import type {
 ResourceContentFilter,
 ResourceFilter,
 ResourceStatusFilter,
} from "./types";
import { buildResourcesHref, getAreaLabel } from "./utils";

export function FolderCard({
 activeFilter,
 canManage,
 contentFilter,
 folder,
 onDelete,
 onEdit,
 onToggleActive,
 searchQuery,
 statusFilter,
}: {
 activeFilter: ResourceFilter;
 canManage: boolean;
 contentFilter: ResourceContentFilter;
 folder: ResourceFolder;
 onDelete: (folder: ResourceFolder) => void;
 onEdit: (folder: ResourceFolder) => void;
 onToggleActive: (folder: ResourceFolder) => void;
 searchQuery: string;
 statusFilter: ResourceStatusFilter;
}) {
 const details = AREA_DETAILS[folder.area];
 const AreaIcon = details.icon;
 const isInactive = !folder.active;
 const href = buildResourcesHref({
 area: activeFilter,
 content: contentFilter === "folders" ? "all" : contentFilter,
 folderId: folder.id,
 q: searchQuery,
 status: statusFilter,
 });

 return (
 <article
 className={cn(
 "relative flex h-fit min-w-0 self-start flex-col rounded-[20px] bg-background p-4 pt-6 ",
 isInactive && "opacity-70",
 )}
 >
 <div className="absolute left-5 top-0 h-3 w-24 -translate-y-px rounded-t-[14px] border-b-0 bg-secondary-soft" />
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0 flex flex-1 items-start gap-3">
 <div className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-secondary-soft text-muted-foreground">
 <FolderOpen className="size-6" aria-hidden="true" />
 </div>
 <div className="min-w-0">
 <div className="flex flex-wrap items-center gap-2">
 <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-extrabold text-primary-foreground">
 Carpeta
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-extrabold text-foreground">
 <AreaIcon className="size-3.5" aria-hidden="true" />
 {getAreaLabel(folder.area)}
 </span>
 {canManage ? (
 <span
 className={cn(
 "rounded-full px-2.5 py-1 text-xs font-extrabold",
 isInactive
 ? "bg-muted/15 text-muted"
 : "bg-primary-soft text-foreground",
 )}
 >
 {isInactive ? "Inactiva" : "Activa"}
 </span>
 ) : null}
 </div>
 <h3 className="mt-2 break-words text-lg font-bold leading-tight text-foreground">
 {folder.name}
 </h3>
 </div>
 </div>

 {canManage ? (
 <CardActionsMenu
 label={folder.name}
 items={[
 {
 icon: Pencil,
 label: "Editar",
 onSelect: () => onEdit(folder),
 },
 {
 destructive: folder.active,
 icon: folder.active ? Power : RotateCcw,
 label: folder.active ? "Desactivar" : "Activar",
 onSelect: () => onToggleActive(folder),
 },
 {
 destructive: true,
 disabled: folder.documentCount > 0,
 icon: Trash2,
 label: "Eliminar",
 onSelect: () => onDelete(folder),
 separatorBefore: true,
 },
 ]}
 />
 ) : null}
 </div>

 <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">
 {folder.description || "Carpeta de recursos."}
 </p>

 <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
 <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-extrabold text-foreground">
 {folder.documentCount} documentos
 </span>
 <Button asChild size="sm" variant="outline">
 <Link href={href}>
 <FolderOpen className="size-4" aria-hidden="true" />
 Abrir carpeta
 </Link>
 </Button>
 </div>
 </article>
 );
}