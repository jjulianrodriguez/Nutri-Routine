"use client";

import {
 Loader2,
 RefreshCw,
 Upload,
 X,
} from "lucide-react";
import { type FormEvent, useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
 updatePdfResource,
 uploadPdfResource,
} from "@/lib/actions/resources";
import { RESOURCE_PDF_MAX_SIZE_BYTES } from "@/lib/resources/constants";
import type {
 MultimediaResource,
 ResourceFolder,
} from "@/lib/resources/data";

import { selectClasses } from "./constants";
import { AreaSelector } from "./ResourceAreaSelector";
import type { FieldErrors, ResourceArea } from "./types";
import { readFileError } from "./utils";

type ResourceUploadFormProps = {
 folders: ResourceFolder[];
 manageableAreas: ResourceArea[];
 selectedFolder?: ResourceFolder | null;
};

export function ResourceUploadForm({
 folders,
 manageableAreas,
 selectedFolder,
}: ResourceUploadFormProps) {
 const router = useRouter();
 const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
 const [message, setMessage] = useState("");
 const [selectedArea, setSelectedArea] = useState<ResourceArea>(
 selectedFolder?.area ?? manageableAreas[0] ?? "general",
 );
 const [isPending, setIsPending] = useState(false);
 const availableFolders = folders.filter(
 (folder) => folder.active && folder.area === selectedArea,
 );

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
 const result = await uploadPdfResource(formData);

 if (result.status === "error") {
 setFieldErrors(result.fieldErrors ?? {});
 setMessage(result.message);
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 form.reset();
 setSelectedArea(selectedFolder?.area ?? manageableAreas[0] ?? "general");
 router.refresh();
 } finally {
 setIsPending(false);
 }
 }

 return (
 <section className="rounded-[28px] bg-surface p-5 sm:p-6">
 <div className="flex items-center gap-3">
 <div className="grid size-11 place-items-center rounded-[16px] bg-primary-soft text-muted-foreground">
 <Upload className="size-5" aria-hidden="true" />
 </div>
 <div>
 <h2 className="text-2xl font-bold text-foreground">Subir PDF</h2>
 <p className="mt-1 text-sm leading-6 text-muted">
 Puede quedar sin carpeta o dentro de una carpeta.
 </p>
 </div>
 </div>

 <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
 <div>
 <Label htmlFor="pdf-area" className="font-extrabold text-foreground">
 Area
 </Label>
 <AreaSelector
 id="pdf-area"
 value={selectedArea}
 manageableAreas={manageableAreas}
 disabled={isPending}
 onChange={setSelectedArea}
 />
 <FieldError id="pdf-area-error" message={fieldErrors.area} />
 </div>

 <div>
 <Label htmlFor="pdf-folder" className="font-extrabold text-foreground">
 Carpeta opcional
 </Label>
 <select
 key={selectedArea}
 id="pdf-folder"
 name="folderId"
 disabled={isPending}
 defaultValue={
 selectedFolder?.area === selectedArea ? selectedFolder.id : ""
 }
 className={selectClasses}
 >
 <option value="">Sin carpeta</option>
 {availableFolders.map((folder) => (
 <option key={folder.id} value={folder.id}>
 {folder.name}
 </option>
 ))}
 </select>
 <FieldError id="pdf-folder-error" message={fieldErrors.folderId} />
 </div>

 <div>
 <Label htmlFor="pdf-title" className="font-extrabold text-foreground">
 Titulo
 </Label>
 <Input
 id="pdf-title"
 name="title"
 className="mt-2"
 maxLength={180}
 required
 disabled={isPending}
 />
 <FieldError id="pdf-title-error" message={fieldErrors.title} />
 </div>

 <div>
 <Label htmlFor="pdf-description" className="font-extrabold text-foreground">
 Descripcion opcional
 </Label>
 <Textarea
 id="pdf-description"
 name="description"
 rows={4}
 maxLength={2000}
 disabled={isPending}
 className="mt-2"
 />
 <FieldError id="pdf-description-error" message={fieldErrors.description} />
 </div>

 <div>
 <Label htmlFor="pdf-file" className="font-extrabold text-foreground">
 Archivo PDF
 </Label>
 <Input
 id="pdf-file"
 name="file"
 type="file"
 accept="application/pdf,.pdf"
 disabled={isPending}
 className="mt-2 h-auto rounded-control py-3"
 required
 />
 <p className="mt-2 text-sm leading-6 text-muted">
 Maximo {Math.round(RESOURCE_PDF_MAX_SIZE_BYTES / 1024 / 1024)} MB.
 </p>
 <FieldError id="pdf-file-error" message={fieldErrors.file} />
 </div>

 {message ? (
 <Alert
 variant="destructive"
 className="rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3"
 >
 <AlertDescription className="font-semibold text-danger">
 {message}
 </AlertDescription>
 </Alert>
 ) : null}

 <Button type="submit" size="lg" disabled={isPending}>
 {isPending ? (
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 ) : (
 <Upload className="size-4" aria-hidden="true" />
 )}
 Subir PDF
 </Button>
 </form>
 </section>
 );
}

export function ResourcePdfEditForm({
 folders,
 manageableAreas,
 onCancel,
 resource,
}: {
 folders: ResourceFolder[];
 manageableAreas: ResourceArea[];
 onCancel: () => void;
 resource: MultimediaResource;
}) {
 const router = useRouter();
 const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
 const [message, setMessage] = useState("");
 const [selectedArea, setSelectedArea] = useState<ResourceArea>(resource.area);
 const [isPending, setIsPending] = useState(false);
 const availableFolders = folders.filter(
 (folder) => folder.active && folder.area === selectedArea,
 );

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
 const result = await updatePdfResource(formData);

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
 <section className="rounded-[28px] border-primary/25 bg-primary-soft/65 p-5 sm:p-6">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 Edicion
 </p>
 <h2 className="mt-2 text-2xl font-bold text-foreground">
 Editar PDF
 </h2>
 </div>
 <Button type="button" variant="ghost" onClick={onCancel}>
 <X className="size-4" aria-hidden="true" />
 Cancelar
 </Button>
 </div>

 <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
 <input type="hidden" name="id" value={resource.id} />

 <div>
 <Label htmlFor="pdf-edit-title" className="font-extrabold text-foreground">
 Titulo
 </Label>
 <Input
 id="pdf-edit-title"
 name="title"
 className="mt-2"
 defaultValue={resource.title}
 maxLength={180}
 required
 disabled={isPending}
 />
 <FieldError id="pdf-edit-title-error" message={fieldErrors.title} />
 </div>

 <div>
 <Label htmlFor="pdf-edit-area" className="font-extrabold text-foreground">
 Area
 </Label>
 <AreaSelector
 id="pdf-edit-area"
 value={selectedArea}
 manageableAreas={manageableAreas}
 disabled={isPending}
 onChange={setSelectedArea}
 />
 <FieldError id="pdf-edit-area-error" message={fieldErrors.area} />
 </div>

 <div>
 <Label htmlFor="pdf-edit-folder" className="font-extrabold text-foreground">
 Carpeta opcional
 </Label>
 <select
 key={selectedArea}
 id="pdf-edit-folder"
 name="folderId"
 disabled={isPending}
 defaultValue={selectedArea === resource.area ? resource.folder_id ?? "" : ""}
 className={selectClasses}
 >
 <option value="">Sin carpeta</option>
 {availableFolders.map((folder) => (
 <option key={folder.id} value={folder.id}>
 {folder.name}
 </option>
 ))}
 </select>
 <FieldError id="pdf-edit-folder-error" message={fieldErrors.folderId} />
 </div>

 <div>
 <Label htmlFor="pdf-edit-description" className="font-extrabold text-foreground">
 Descripcion opcional
 </Label>
 <Textarea
 id="pdf-edit-description"
 name="description"
 rows={4}
 maxLength={2000}
 defaultValue={resource.description ?? ""}
 disabled={isPending}
 className="mt-2"
 />
 <FieldError
 id="pdf-edit-description-error"
 message={fieldErrors.description}
 />
 </div>

 <div>
 <Label htmlFor="pdf-edit-file" className="font-extrabold text-foreground">
 Reemplazar PDF opcional
 </Label>
 <Input
 id="pdf-edit-file"
 name="file"
 type="file"
 accept="application/pdf,.pdf"
 disabled={isPending}
 className="mt-2 h-auto rounded-control py-3"
 />
 <FieldError id="pdf-edit-file-error" message={fieldErrors.file} />
 </div>

 {message ? (
 <Alert
 variant="destructive"
 className="rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3"
 >
 <AlertDescription className="font-semibold text-danger">
 {message}
 </AlertDescription>
 </Alert>
 ) : null}

 <Button type="submit" size="lg" disabled={isPending}>
 {isPending ? (
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 ) : (
 <RefreshCw className="size-4" aria-hidden="true" />
 )}
 Guardar PDF
 </Button>
 </form>
 </section>
 );
}
