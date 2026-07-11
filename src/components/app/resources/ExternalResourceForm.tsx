"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
 Loader2,
 Plus,
 Save,
 X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
 MultimediaResource,
 ResourceFolder,
} from "@/lib/resources/data";
import {
 resourceValuesSchema,
 type ResourceValues,
} from "@/lib/validations/resources";
import { cn } from "@/lib/utils";

import { AREA_DETAILS, selectClasses } from "./constants";
import type { FieldErrors, ResourceArea, ResourceFormRef } from "./types";

export function ExternalResourceForm({
 editingResource,
 formRef,
 folders,
 manageableAreas,
 onCancel,
 onSave,
 selectedFolder,
}: {
 editingResource: MultimediaResource | null;
 formRef: ResourceFormRef;
 folders: ResourceFolder[];
 manageableAreas: ResourceArea[];
 onCancel: () => void;
 onSave: (
 values: ResourceValues,
 resource: MultimediaResource | null,
 ) => Promise<void>;
 selectedFolder?: ResourceFolder | null;
}) {
 const defaultArea = selectedFolder?.area ?? manageableAreas[0] ?? "general";
 const defaultValues: ResourceValues =
 editingResource?.kind === "external_link"
 ? {
 area: editingResource.area,
 description: editingResource.description ?? "",
 folderId: editingResource.folder_id ?? "",
 title: editingResource.title,
 url: editingResource.file_url ?? "",
 }
 : {
 area: defaultArea,
 description: "",
 folderId: selectedFolder?.id ?? "",
 title: "",
 url: "",
 };
 const {
 clearErrors,
 control,
 formState: { errors, isSubmitting },
 handleSubmit,
 register,
 reset,
 setError,
 setValue,
 } = useForm<ResourceValues>({
 defaultValues,
 resolver: zodResolver(resourceValuesSchema),
 });
 const selectedArea = useWatch({ control, name: "area" }) ?? defaultArea;
 const selectedFolderId = useWatch({ control, name: "folderId" });
 const availableFolders = folders.filter(
 (folder) => folder.active && folder.area === selectedArea,
 );
 const [serverMessage, setServerMessage] = useState("");

 useEffect(() => {
 if (
 selectedFolderId &&
 !folders.some(
 (folder) =>
 folder.active &&
 folder.area === selectedArea &&
 folder.id === selectedFolderId,
 )
 ) {
 setValue("folderId", "");
 }
 }, [folders, selectedArea, selectedFolderId, setValue]);

 function resetForm() {
 setServerMessage("");
 clearErrors();
 reset({
 area: defaultArea,
 description: "",
 folderId: selectedFolder?.id ?? "",
 title: "",
 url: "",
 });
 onCancel();
 }

 async function submit(values: ResourceValues) {
 setServerMessage("");
 clearErrors("root");

 try {
 await onSave(values, editingResource);
 if (!editingResource) {
 reset({
 area: defaultArea,
 description: "",
 folderId: selectedFolder?.id ?? "",
 title: "",
 url: "",
 });
 }
 } catch (error) {
 const result = error as {
 fieldErrors?: FieldErrors;
 message?: string;
 };

 if (result.fieldErrors) {
 Object.entries(result.fieldErrors).forEach(([field, message]) => {
 if (message) {
 setError(field as keyof ResourceValues, { message });
 }
 });
 }

 const message =
 result.message ?? "No se pudo guardar el recurso. Intentalo de nuevo.";
 setServerMessage(message);
 }
 }

 return (
 <section
 ref={formRef}
 className="scroll-mt-6 rounded-[28px] bg-surface p-5 sm:p-6"
 >
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 {editingResource ? "Edicion" : "Nuevo enlace"}
 </p>
 <h2 className="mt-2 text-2xl font-bold text-foreground">
 {editingResource ? "Editar enlace" : "Crear enlace"}
 </h2>
 </div>
 {editingResource ? (
 <Button type="button" variant="ghost" onClick={resetForm}>
 <X className="size-4" aria-hidden="true" />
 Cancelar
 </Button>
 ) : null}
 </div>

 <form
 className="mt-6 space-y-5"
 onSubmit={handleSubmit(submit)}
 noValidate
 >
 <div>
 <Label htmlFor="resource-title" className="font-extrabold text-foreground">
 Titulo
 </Label>
 <Input
 id="resource-title"
 className="mt-2"
 aria-describedby={errors.title ? "resource-title-error" : undefined}
 aria-invalid={Boolean(errors.title)}
 autoComplete="off"
 maxLength={180}
 {...register("title")}
 />
 <FieldError id="resource-title-error" message={errors.title?.message} />
 </div>

 <div>
 <Label htmlFor="resource-description" className="font-extrabold text-foreground">
 Descripcion opcional
 </Label>
 <Textarea
 id="resource-description"
 rows={4}
 maxLength={2000}
 className="mt-2"
 aria-describedby={
 errors.description ? "resource-description-error" : undefined
 }
 aria-invalid={Boolean(errors.description)}
 {...register("description")}
 />
 <FieldError
 id="resource-description-error"
 message={errors.description?.message}
 />
 </div>

 <div>
 <Label htmlFor="resource-url" className="font-extrabold text-foreground">
 URL externa
 </Label>
 <Input
 id="resource-url"
 type="url"
 inputMode="url"
 className="mt-2"
 aria-describedby={errors.url ? "resource-url-error" : undefined}
 aria-invalid={Boolean(errors.url)}
 autoComplete="off"
 spellCheck={false}
 maxLength={2048}
 placeholder="https://ejemplo.com/recurso"
 {...register("url")}
 />
 <FieldError id="resource-url-error" message={errors.url?.message} />
 </div>

 <fieldset>
 <legend className="text-sm font-extrabold text-foreground">
 Tipo de acceso
 </legend>
 <div className="mt-3 grid gap-3">
 {manageableAreas.map((areaValue) => {
 const details = AREA_DETAILS[areaValue];
 const Icon = details.icon;

 return (
 <label
 key={areaValue}
 className={cn(
 "flex min-h-16 cursor-pointer items-center gap-3 rounded-[18px] px-4 py-3 transition-[background-color,border-color,box-shadow]",
 selectedArea === areaValue
 ? "border-primary/40 bg-primary-soft "
 : " bg-background hover:border-primary/30",
 )}
 >
 <input
 type="radio"
 value={areaValue}
 className="size-5 accent-[var(--primary-hover)]"
 {...register("area")}
 />
 <Icon
 className="size-5 shrink-0 text-muted-foreground"
 aria-hidden="true"
 />
 <span>
 <span className="block font-extrabold text-foreground">
 {details.label}
 </span>
 <span className="mt-1 block text-xs leading-5 text-muted">
 {details.summary}
 </span>
 </span>
 </label>
 );
 })}
 </div>
 <FieldError id="resource-area-error" message={errors.area?.message} />
 </fieldset>

 <div>
 <Label htmlFor="resource-folder" className="font-extrabold text-foreground">
 Carpeta opcional
 </Label>
 <select
 id="resource-folder"
 className={selectClasses}
 aria-describedby={
 errors.folderId ? "resource-folder-error" : undefined
 }
 aria-invalid={Boolean(errors.folderId)}
 {...register("folderId")}
 >
 <option value="">Sin carpeta</option>
 {availableFolders.map((folder) => (
 <option key={folder.id} value={folder.id}>
 {folder.name}
 </option>
 ))}
 </select>
 <FieldError
 id="resource-folder-error"
 message={errors.folderId?.message}
 />
 </div>

 {serverMessage ? (
 <Alert
 variant="destructive"
 className="rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3"
 >
 <AlertDescription className="font-semibold text-danger">
 {serverMessage}
 </AlertDescription>
 </Alert>
 ) : null}

 <Button type="submit" size="lg" disabled={isSubmitting}>
 {isSubmitting ? (
 <>
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 Guardando
 </>
 ) : editingResource ? (
 <>
 <Save className="size-4" aria-hidden="true" />
 Guardar enlace
 </>
 ) : (
 <>
 <Plus className="size-4" aria-hidden="true" />
 Crear enlace
 </>
 )}
 </Button>
 </form>
 </section>
 );
}
