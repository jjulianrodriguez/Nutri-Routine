"use client";

import {
  BookOpen,
  Download,
  FileText,
  Folder,
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CardActionsMenu } from "@/components/app/card-actions-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createNutritionDocumentSignedUrl,
  createNutritionFolder,
  deactivateNutritionDocument,
  deleteNutritionFolder,
  updateNutritionDocument,
  updateNutritionFolder,
  uploadEducationalDocument,
  uploadMealPlanDocument,
} from "@/lib/actions/nutrition-documents";
import {
  NUTRITION_PDF_MAX_SIZE_BYTES,
} from "@/lib/nutrition-documents/constants";
import type {
  NutritionDocumentClientRecord,
  NutritionDocumentFolderRecord,
  NutritionDocumentRecord,
} from "@/lib/nutrition-documents/types";
import { getPdfValidationError } from "@/lib/validations/nutrition-documents";
import { cn } from "@/lib/utils";

type NutritionDocumentManagerProps = {
  canManage: boolean;
  clients: NutritionDocumentClientRecord[];
  folders: NutritionDocumentFolderRecord[];
  libraryDocuments: NutritionDocumentRecord[];
  mealPlanDocuments: NutritionDocumentRecord[];
};

type FieldErrors = Record<string, string | undefined>;

type ConfirmationState =
  | {
      document: NutritionDocumentRecord;
      type: "deactivate-document";
    }
  | {
      folder: NutritionDocumentFolderRecord;
      type: "delete-folder";
    };

const DOCUMENT_TYPE_LABELS = {
  educational_library: "Biblioteca educativa",
  meal_plan: "Plan de alimentacion",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Costa_Rica",
  }).format(new Date(value));
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-2 text-sm font-semibold text-danger" role="alert">
      {message}
    </p>
  );
}

function PdfOpenButton({ documentId }: { documentId: string }) {
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
      variant="outline"
      size="sm"
      onClick={openDocument}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Download className="size-4" aria-hidden="true" />
      )}
      Abrir PDF
    </Button>
  );
}

function DocumentCard({
  canManage,
  document,
  onDeactivate,
  onEdit,
}: {
  canManage: boolean;
  document: NutritionDocumentRecord;
  onDeactivate?: (document: NutritionDocumentRecord) => void;
  onEdit?: (document: NutritionDocumentRecord) => void;
}) {
  const isInactive = document.status === "inactive";

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col rounded-[24px] border border-border bg-background p-5 shadow-soft",
        isInactive && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-[16px] bg-primary-soft text-warm-brown">
            <FileText className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
              {DOCUMENT_TYPE_LABELS[document.documentType]}
            </p>
            <h3 className="mt-1 break-words text-xl font-extrabold leading-tight text-charcoal">
              {document.title}
            </h3>
          </div>
        </div>

        {canManage && onEdit && onDeactivate ? (
          <CardActionsMenu
            label={document.title}
            items={[
              {
                icon: Pencil,
                label: "Editar",
                onSelect: () => onEdit(document),
              },
              {
                destructive: true,
                disabled: isInactive,
                icon: Trash2,
                label: "Desactivar",
                onSelect: () => onDeactivate(document),
                separatorBefore: true,
              },
            ]}
          />
        ) : null}
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">
        {document.description || "Documento PDF disponible para consulta."}
      </p>

      <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-xs font-bold text-warm-brown sm:grid-cols-2">
        {document.clientName ? (
          <div>
            <dt className="text-muted">Clienta asignada</dt>
            <dd className="mt-1 break-words">{document.clientName}</dd>
          </div>
        ) : null}
        {document.folderName ? (
          <div>
            <dt className="text-muted">Carpeta</dt>
            <dd className="mt-1 break-words">{document.folderName}</dd>
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
            <dd className="mt-1">{isInactive ? "Inactivo" : "Activo"}</dd>
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

    const formData = new FormData(event.currentTarget);
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
      event.currentTarget.reset();
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div>
        <Label htmlFor="meal-plan-client" className="font-extrabold text-charcoal">
          Clienta
        </Label>
        <select
          id="meal-plan-client"
          name="clientId"
          required
          className="mt-2 h-12 w-full rounded-control border border-input bg-surface px-4 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
        >
          <option value="">Seleccionar clienta</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <FieldError id="meal-plan-client-error" message={fieldErrors.clientId} />
      </div>

      <div>
        <Label htmlFor="meal-plan-title" className="font-extrabold text-charcoal">
          Titulo
        </Label>
        <Input
          id="meal-plan-title"
          name="title"
          className="mt-2 h-12 rounded-control"
          maxLength={180}
          required
        />
        <FieldError id="meal-plan-title-error" message={fieldErrors.title} />
      </div>

      <div>
        <Label htmlFor="meal-plan-description" className="font-extrabold text-charcoal">
          Descripcion opcional
        </Label>
        <textarea
          id="meal-plan-description"
          name="description"
          rows={4}
          maxLength={2000}
          className="mt-2 w-full resize-y rounded-[20px] border border-input bg-surface/90 px-4 py-3 text-sm leading-6 text-foreground shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
        />
        <FieldError
          id="meal-plan-description-error"
          message={fieldErrors.description}
        />
      </div>

      <div>
        <Label htmlFor="meal-plan-file" className="font-extrabold text-charcoal">
          PDF
        </Label>
        <Input
          id="meal-plan-file"
          name="file"
          type="file"
          accept="application/pdf,.pdf"
          className="mt-2 h-auto rounded-control py-3"
          required
        />
        <p className="mt-2 text-sm leading-6 text-muted">
          Maximo {Math.round(NUTRITION_PDF_MAX_SIZE_BYTES / 1024 / 1024)} MB.
        </p>
        <FieldError id="meal-plan-file-error" message={fieldErrors.file} />
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

      <Button type="submit" size="lg" disabled={isPending || clients.length === 0}>
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

function FolderManager({
  folders,
  onDelete,
}: {
  folders: NutritionDocumentFolderRecord[];
  onDelete: (folder: NutritionDocumentFolderRecord) => void;
}) {
  const router = useRouter();
  const [editingFolder, setEditingFolder] =
    useState<NutritionDocumentFolderRecord | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const values = {
      id: editingFolder?.id,
      name: String(formData.get("name") ?? ""),
    };

    try {
      const result = editingFolder
        ? await updateNutritionFolder(values)
        : await createNutritionFolder(values);

      if (result.status === "error") {
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      event.currentTarget.reset();
      setEditingFolder(null);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <form className="space-y-3" onSubmit={onSubmit} noValidate>
        <div>
          <Label htmlFor="folder-name" className="font-extrabold text-charcoal">
            Carpeta educativa
          </Label>
          <Input
            key={editingFolder?.id ?? "new-folder"}
            id="folder-name"
            name="name"
            className="mt-2 h-12 rounded-control"
            defaultValue={editingFolder?.name ?? ""}
            maxLength={120}
            placeholder="Salud digestiva"
            required
          />
          <FieldError id="folder-name-error" message={fieldErrors.name} />
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
              onClick={() => setEditingFolder(null)}
            >
              <X className="size-4" aria-hidden="true" />
              Cancelar
            </Button>
          ) : null}
        </div>
      </form>

      <div className="space-y-2">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="flex items-center justify-between gap-3 rounded-[18px] border border-border bg-background px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-extrabold text-charcoal">
                {folder.name}
              </p>
              <p className="mt-1 text-xs font-bold text-muted">
                {folder.documentCount} documentos
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label={`Editar ${folder.name}`}
                title={`Editar ${folder.name}`}
                onClick={() => setEditingFolder(folder)}
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label={`Eliminar ${folder.name}`}
                title={
                  folder.documentCount > 0
                    ? "Solo se eliminan carpetas vacias"
                    : `Eliminar ${folder.name}`
                }
                disabled={folder.documentCount > 0}
                onClick={() => onDelete(folder)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationalUploadForm({
  folders,
}: {
  folders: NutritionDocumentFolderRecord[];
}) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const activeFolders = folders.filter((folder) => folder.active);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const fileError = readFileError(formData, true);

    if (fileError) {
      setFieldErrors({ file: fileError });
      setMessage(fileError);
      toast.error(fileError);
      return;
    }

    setIsPending(true);

    try {
      const result = await uploadEducationalDocument(formData);

      if (result.status === "error") {
        setFieldErrors(result.fieldErrors ?? {});
        setMessage(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      event.currentTarget.reset();
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div>
        <Label htmlFor="library-folder" className="font-extrabold text-charcoal">
          Carpeta
        </Label>
        <select
          id="library-folder"
          name="folderId"
          required
          className="mt-2 h-12 w-full rounded-control border border-input bg-surface px-4 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
        >
          <option value="">Seleccionar carpeta</option>
          {activeFolders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
        <FieldError id="library-folder-error" message={fieldErrors.folderId} />
      </div>

      <div>
        <Label htmlFor="library-title" className="font-extrabold text-charcoal">
          Titulo
        </Label>
        <Input
          id="library-title"
          name="title"
          className="mt-2 h-12 rounded-control"
          maxLength={180}
          required
        />
        <FieldError id="library-title-error" message={fieldErrors.title} />
      </div>

      <div>
        <Label htmlFor="library-description" className="font-extrabold text-charcoal">
          Descripcion opcional
        </Label>
        <textarea
          id="library-description"
          name="description"
          rows={4}
          maxLength={2000}
          className="mt-2 w-full resize-y rounded-[20px] border border-input bg-surface/90 px-4 py-3 text-sm leading-6 text-foreground shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
        />
        <FieldError id="library-description-error" message={fieldErrors.description} />
      </div>

      <div>
        <Label htmlFor="library-file" className="font-extrabold text-charcoal">
          PDF
        </Label>
        <Input
          id="library-file"
          name="file"
          type="file"
          accept="application/pdf,.pdf"
          className="mt-2 h-auto rounded-control py-3"
          required
        />
        <FieldError id="library-file-error" message={fieldErrors.file} />
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

      <Button
        type="submit"
        size="lg"
        disabled={isPending || activeFolders.length === 0}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Upload className="size-4" aria-hidden="true" />
        )}
        Subir recurso
      </Button>
    </form>
  );
}

function DocumentEditForm({
  document,
  folders,
  onCancel,
}: {
  document: NutritionDocumentRecord;
  folders: NutritionDocumentFolderRecord[];
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

    const formData = new FormData(event.currentTarget);
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
    <section className="rounded-[28px] border border-primary/25 bg-primary-soft/65 p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
            Edicion
          </p>
          <h2 className="mt-2 text-2xl font-bold text-charcoal">
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
          <Label htmlFor="document-edit-title" className="font-extrabold text-charcoal">
            Titulo
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

        {document.documentType === "educational_library" ? (
          <div>
            <Label htmlFor="document-edit-folder" className="font-extrabold text-charcoal">
              Carpeta
            </Label>
            <select
              id="document-edit-folder"
              name="folderId"
              required
              defaultValue={document.folderId ?? ""}
              className="mt-2 h-12 w-full rounded-control border border-input bg-surface px-4 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
            >
              {folders
                .filter((folder) => folder.active)
                .map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
            </select>
            <FieldError id="document-edit-folder-error" message={fieldErrors.folderId} />
          </div>
        ) : null}

        <div>
          <Label htmlFor="document-edit-description" className="font-extrabold text-charcoal">
            Descripcion opcional
          </Label>
          <textarea
            id="document-edit-description"
            name="description"
            rows={4}
            maxLength={2000}
            defaultValue={document.description ?? ""}
            className="mt-2 w-full resize-y rounded-[20px] border border-input bg-surface/90 px-4 py-3 text-sm leading-6 text-foreground shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          />
          <FieldError id="document-edit-description-error" message={fieldErrors.description} />
        </div>

        <div>
          <Label htmlFor="document-edit-file" className="font-extrabold text-charcoal">
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
    <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-[16px] bg-accent-soft text-warm-brown">
          <FileText className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-charcoal">
            Plan por clienta
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Ultimo PDF activo asignado a cada clienta de nutricion.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {clients.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border bg-background p-5 text-sm font-semibold text-muted">
            No hay clientas de nutricion disponibles para asignar documentos.
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className="flex flex-col gap-3 rounded-[20px] border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-extrabold text-charcoal">{client.name}</p>
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

function groupByFolder(
  documents: NutritionDocumentRecord[],
  folders: NutritionDocumentFolderRecord[],
) {
  const fallback = "sin-carpeta";
  const grouped = new Map<string, NutritionDocumentRecord[]>();

  documents.forEach((document) => {
    const key = document.folderId ?? fallback;
    grouped.set(key, [...(grouped.get(key) ?? []), document]);
  });

  return folders
    .filter((folder) => grouped.has(folder.id))
    .map((folder) => ({
      documents: grouped.get(folder.id) ?? [],
      folder,
    }));
}

export function NutritionDocumentManager({
  canManage,
  clients,
  folders,
  libraryDocuments,
  mealPlanDocuments,
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
  const activeLibraryDocuments = libraryDocuments.filter(
    (document) => document.status === "active",
  );
  const groupedLibrary = useMemo(
    () => groupByFolder(activeLibraryDocuments, folders),
    [activeLibraryDocuments, folders],
  );

  async function confirmAction() {
    if (!confirmation) {
      return;
    }

    const result =
      confirmation.type === "delete-folder"
        ? await deleteNutritionFolder(confirmation.folder.id)
        : await deactivateNutritionDocument(confirmation.document.id);

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
        <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-[16px] bg-primary-soft text-warm-brown">
              <FileText className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-charcoal">
                Plan de alimentacion
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Tu documento PDF asignado por nutricion.
              </p>
            </div>
          </div>

          <div className="mt-5">
            {currentPlan ? (
              <DocumentCard canManage={false} document={currentPlan} />
            ) : (
              <div className="rounded-[22px] border border-dashed border-border bg-background px-5 py-12 text-center">
                <p className="font-extrabold text-charcoal">
                  Aun no tienes un plan PDF asignado.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Tu nutricionista podra compartirlo contigo desde esta seccion.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-[16px] bg-accent-soft text-warm-brown">
              <BookOpen className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-charcoal">
                Biblioteca educativa
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Recursos PDF organizados por carpeta.
              </p>
            </div>
          </div>

          {groupedLibrary.length > 0 ? (
            <div className="mt-6 space-y-6">
              {groupedLibrary.map(({ documents, folder }) => (
                <section key={folder.id}>
                  <h3 className="flex items-center gap-2 text-lg font-extrabold text-charcoal">
                    <Folder className="size-5 text-warm-brown" aria-hidden="true" />
                    {folder.name}
                  </h3>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    {documents.map((document) => (
                      <DocumentCard
                        key={document.id}
                        canManage={false}
                        document={document}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[22px] border border-dashed border-border bg-background px-5 py-12 text-center">
              <p className="font-extrabold text-charcoal">
                No hay recursos educativos disponibles.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Cuando haya PDFs activos apareceran organizados por carpeta.
              </p>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {editingDocument ? (
        <DocumentEditForm
          document={editingDocument}
          folders={folders}
          onCancel={() => setEditingDocument(null)}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
        <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-[16px] bg-primary-soft text-warm-brown">
              <Plus className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-charcoal">
                Subir plan de alimentacion
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

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr] xl:items-start">
        <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-[16px] bg-accent-soft text-warm-brown">
              <Folder className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-charcoal">
                Carpetas educativas
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Organiza la biblioteca por temas.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <FolderManager
              folders={folders}
              onDelete={(folder) =>
                setConfirmation({ folder, type: "delete-folder" })
              }
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-[16px] bg-primary-soft text-warm-brown">
              <Upload className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-charcoal">
                Subir recurso educativo
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Guarda PDFs dentro de una carpeta de la biblioteca.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <EducationalUploadForm folders={folders} />
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-[16px] bg-accent-soft text-warm-brown">
            <BookOpen className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-charcoal">
              Documentos cargados
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Planes y recursos educativos con estado, fecha y asignacion.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[...mealPlanDocuments, ...libraryDocuments].length > 0 ? (
            [...mealPlanDocuments, ...libraryDocuments].map((document) => (
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
                onEdit={setEditingDocument}
              />
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-border bg-background px-5 py-12 text-center lg:col-span-2">
              <p className="font-extrabold text-charcoal">
                Aun no hay documentos PDF.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Sube un plan de alimentacion o un recurso educativo para comenzar.
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
        title={
          confirmation?.type === "delete-folder"
            ? "Eliminar carpeta"
            : "Desactivar documento"
        }
        description={
          confirmation?.type === "delete-folder"
            ? `Se eliminara la carpeta "${confirmation.folder.name}" porque no tiene documentos.`
            : confirmation
              ? `El documento "${confirmation.document.title}" dejara de estar disponible para las clientas.`
              : ""
        }
        confirmLabel={
          confirmation?.type === "delete-folder"
            ? "Eliminar carpeta"
            : "Desactivar"
        }
        pendingLabel={
          confirmation?.type === "delete-folder" ? "Eliminando..." : "Desactivando..."
        }
        tone="destructive"
        onConfirm={confirmAction}
      />
    </div>
  );
}
