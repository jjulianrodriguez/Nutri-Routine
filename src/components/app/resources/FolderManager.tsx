"use client";

import {
 Folder,
 FolderPlus,
 Loader2,
 Pencil,
 Power,
 RotateCcw,
 Save,
 Trash2,
 X,
} from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CardActionsMenu } from "@/components/app/card-actions-menu";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
 createResourceFolder,
 updateResourceFolder,
} from "@/lib/actions/resources";
import type { ResourceFolder } from "@/lib/resources/data";
import { cn } from "@/lib/utils";

import { AreaSelector } from "./ResourceAreaSelector";
import type { FieldErrors, ResourceArea } from "./types";
import { getAreaLabel } from "./utils";

export function FolderManager({
 editingFolder,
 folders,
 manageableAreas,
 onDelete,
 onEditingFolderChange,
 onToggleActive,
}: {
 editingFolder: ResourceFolder | null;
 folders: ResourceFolder[];
 manageableAreas: ResourceArea[];
 onDelete: (folder: ResourceFolder) => void;
 onEditingFolderChange: (folder: ResourceFolder | null) => void;
 onToggleActive: (folder: ResourceFolder) => void;
}) {
 const router = useRouter();
 const sectionRef = useRef<HTMLElement>(null);
 const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
 const [selectedArea, setSelectedArea] = useState<ResourceArea>(
 manageableAreas[0] ?? "general",
 );
 const [isPending, setIsPending] = useState(false);

 function clearFolderForm(form?: HTMLFormElement) {
 onEditingFolderChange(null);
 setFieldErrors({});
 setSelectedArea(manageableAreas[0] ?? "general");
 form?.reset();
 }

 function startEditing(folder: ResourceFolder) {
 onEditingFolderChange(folder);
 setSelectedArea(folder.area);
 setFieldErrors({});
 sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
 }

 async function onSubmit(event: FormEvent<HTMLFormElement>) {
 event.preventDefault();
 setFieldErrors({});
 setIsPending(true);

 const form = event.currentTarget;
 const formData = new FormData(form);
 const values = {
 area: editingFolder?.area ?? selectedArea,
 description: String(formData.get("description") ?? ""),
 id: editingFolder?.id,
 name: String(formData.get("name") ?? ""),
 };

 try {
 const result = editingFolder
 ? await updateResourceFolder({ ...values, id: editingFolder.id })
 : await createResourceFolder(values);

 if (result.status === "error") {
 setFieldErrors(result.fieldErrors ?? {});
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 clearFolderForm(form);
 router.refresh();
 } finally {
 setIsPending(false);
 }
 }

 return (
 <section
 ref={sectionRef}
 className="rounded-[28px] bg-surface p-5 sm:p-6"
 >
 <div className="flex items-center gap-3">
 <div className="grid size-11 place-items-center rounded-[16px] bg-secondary-soft text-muted-foreground">
 <Folder className="size-5" aria-hidden="true" />
 </div>
 <div>
 <h2 className="text-2xl font-bold text-foreground">
 Carpetas
 </h2>
 <p className="mt-1 text-sm leading-6 text-muted">
 Organiza PDFs y enlaces por tema y area.
 </p>
 </div>
 </div>

 <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
 <div>
 <Label htmlFor="resource-folder-name" className="font-extrabold text-foreground">
 Nombre
 </Label>
 <Input
 key={editingFolder?.id ?? "new-folder"}
 id="resource-folder-name"
 name="name"
 className="mt-2"
 defaultValue={editingFolder?.name ?? ""}
 maxLength={120}
 placeholder="Salud digestiva"
 required
 disabled={isPending}
 />
 <FieldError id="resource-folder-name-error" message={fieldErrors.name} />
 </div>

 <div>
 <Label htmlFor="resource-folder-description" className="font-extrabold text-foreground">
 Descripcion opcional
 </Label>
 <Textarea
 key={`${editingFolder?.id ?? "new-folder"}-description`}
 id="resource-folder-description"
 name="description"
 rows={3}
 maxLength={500}
 defaultValue={editingFolder?.description ?? ""}
 disabled={isPending}
 className="mt-2"
 />
 <FieldError
 id="resource-folder-description-error"
 message={fieldErrors.description}
 />
 </div>

 <div>
 <Label htmlFor="resource-folder-area" className="font-extrabold text-foreground">
 Area
 </Label>
 <AreaSelector
 id="resource-folder-area"
 value={editingFolder?.area ?? selectedArea}
 manageableAreas={
 editingFolder ? [editingFolder.area] : manageableAreas
 }
 disabled={isPending || Boolean(editingFolder)}
 onChange={setSelectedArea}
 />
 <FieldError id="resource-folder-area-error" message={fieldErrors.area} />
 </div>

 <div className="flex flex-wrap gap-2">
 <Button type="submit" disabled={isPending}>
 {isPending ? (
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 ) : editingFolder ? (
 <Save className="size-4" aria-hidden="true" />
 ) : (
 <FolderPlus className="size-4" aria-hidden="true" />
 )}
 {editingFolder ? "Guardar carpeta" : "Crear carpeta"}
 </Button>
 {editingFolder ? (
 <Button
 type="button"
 variant="ghost"
 onClick={() => clearFolderForm()}
 >
 <X className="size-4" aria-hidden="true" />
 Cancelar
 </Button>
 ) : null}
 </div>
 </form>

 <div className="mt-6 space-y-2">
 {folders.length > 0 ? (
 folders.map((folder) => {
 const isInactive = !folder.active;

 return (
 <div
 key={folder.id}
 className={cn(
 "flex items-center justify-between gap-3 rounded-[18px] bg-background px-4 py-3",
 isInactive && "opacity-70",
 )}
 >
 <button
 type="button"
 className="min-w-0 text-left"
 onClick={() => startEditing(folder)}
 >
 <p className="truncate font-extrabold text-foreground">
 {folder.name}
 </p>
 <p className="mt-1 text-xs font-bold text-muted">
 {getAreaLabel(folder.area)} · {folder.documentCount} documentos
 </p>
 </button>
 <CardActionsMenu
 label={folder.name}
 items={[
 {
 icon: Pencil,
 label: "Editar",
 onSelect: () => startEditing(folder),
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
 </div>
 );
 })
 ) : (
 <div className="rounded-[18px] bg-background p-4 text-sm font-semibold text-muted">
 Todavia no hay carpetas.
 </div>
 )}
 </div>
 </section>
 );
}
