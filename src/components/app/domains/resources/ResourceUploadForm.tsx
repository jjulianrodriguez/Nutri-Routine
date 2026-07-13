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

import { Button } from "@/components/ui/actions/button";
import { FormAlert, FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import { Textarea } from "@/components/ui/forms/textarea";
import {
 updatePdfResource,
 uploadPdfResource,
} from "@/lib/actions/resources";
import { RESOURCE_PDF_MAX_SIZE_BYTES } from "@/lib/resources/constants";
import type {
 MultimediaResource,
 ResourceFolder,
} from "@/lib/resources/data";

import { AreaSelector } from "./ResourceAreaSelector";
import type { ResourceArea, ResourceFieldErrorMap } from "./types";
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
 const [fieldErrors, setFieldErrors] = useState<ResourceFieldErrorMap>({});
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
 <FormField
 controlId="pdf-area"
 error={fieldErrors.area}
 errorId="pdf-area-error"
 label="Area"
 >
 <AreaSelector
 value={selectedArea}
 manageableAreas={manageableAreas}
 disabled={isPending}
 onChange={setSelectedArea}
 />
 </FormField>

 <FormField
 controlId="pdf-folder"
 error={fieldErrors.folderId}
 errorId="pdf-folder-error"
 label="Carpeta opcional"
 >
 <Select
 key={selectedArea}
 name="folderId"
 disabled={isPending}
 defaultValue={
 selectedFolder?.area === selectedArea ? selectedFolder.id : ""
 }
 >
 <option value="">Sin carpeta</option>
 {availableFolders.map((folder) => (
 <option key={folder.id} value={folder.id}>
 {folder.name}
 </option>
 ))}
 </Select>
 </FormField>

 <FormField
 controlId="pdf-title"
 error={fieldErrors.title}
 errorId="pdf-title-error"
 label="Titulo"
 >
 <Input
 name="title"
 maxLength={180}
 required
 disabled={isPending}
 />
 </FormField>

 <FormField
 controlId="pdf-description"
 error={fieldErrors.description}
 errorId="pdf-description-error"
 label="Descripcion opcional"
 >
 <Textarea
 name="description"
 rows={4}
 maxLength={2000}
 disabled={isPending}
 />
 </FormField>

 <FormField
 controlId="pdf-file"
 error={fieldErrors.file}
 errorId="pdf-file-error"
 hint={`Maximo ${Math.round(RESOURCE_PDF_MAX_SIZE_BYTES / 1024 / 1024)} MB.`}
 label="Archivo PDF"
 >
 <Input
 name="file"
 type="file"
 accept="application/pdf,.pdf"
 disabled={isPending}
 className="h-auto rounded-control py-3"
 required
 />
 </FormField>

 <FormAlert message={message} />

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
 const [fieldErrors, setFieldErrors] = useState<ResourceFieldErrorMap>({});
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
 <Input type="hidden" name="id" value={resource.id} />

 <FormField
 controlId="pdf-edit-title"
 error={fieldErrors.title}
 errorId="pdf-edit-title-error"
 label="Titulo"
 >
 <Input
 name="title"
 defaultValue={resource.title}
 maxLength={180}
 required
 disabled={isPending}
 />
 </FormField>

 <FormField
 controlId="pdf-edit-area"
 error={fieldErrors.area}
 errorId="pdf-edit-area-error"
 label="Area"
 >
 <AreaSelector
 value={selectedArea}
 manageableAreas={manageableAreas}
 disabled={isPending}
 onChange={setSelectedArea}
 />
 </FormField>

 <FormField
 controlId="pdf-edit-folder"
 error={fieldErrors.folderId}
 errorId="pdf-edit-folder-error"
 label="Carpeta opcional"
 >
 <Select
 key={selectedArea}
 name="folderId"
 disabled={isPending}
 defaultValue={selectedArea === resource.area ? resource.folder_id ?? "" : ""}
 >
 <option value="">Sin carpeta</option>
 {availableFolders.map((folder) => (
 <option key={folder.id} value={folder.id}>
 {folder.name}
 </option>
 ))}
 </Select>
 </FormField>

 <FormField
 controlId="pdf-edit-description"
 error={fieldErrors.description}
 errorId="pdf-edit-description-error"
 label="Descripcion opcional"
 >
 <Textarea
 name="description"
 rows={4}
 maxLength={2000}
 defaultValue={resource.description ?? ""}
 disabled={isPending}
 />
 </FormField>

 <FormField
 controlId="pdf-edit-file"
 error={fieldErrors.file}
 errorId="pdf-edit-file-error"
 label="Reemplazar PDF opcional"
 >
 <Input
 name="file"
 type="file"
 accept="application/pdf,.pdf"
 disabled={isPending}
 className="h-auto rounded-control py-3"
 />
 </FormField>

 <FormAlert message={message} />

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
