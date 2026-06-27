"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Download,
  Dumbbell,
  ExternalLink,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  ImageIcon,
  Layers3,
  Leaf,
  Link2,
  Loader2,
  Pencil,
  PlaySquare,
  Plus,
  Power,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { CardActionsMenu } from "@/components/app/card-actions-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  activateResource,
  createResource,
  createResourceFolder,
  createResourceSignedUrl,
  deactivateResource,
  deleteResource,
  deleteResourceFolder,
  toggleResourceFolderActive,
  updatePdfResource,
  updateResource,
  updateResourceFolder,
  uploadPdfResource,
} from "@/lib/actions/resources";
import { getExternalResourcePresentation } from "@/lib/exercises/multimedia";
import { RESOURCE_PDF_MAX_SIZE_BYTES } from "@/lib/resources/constants";
import type {
  MultimediaResource,
  ResourceFolder,
} from "@/lib/resources/data";
import {
  getResourcePdfValidationError,
  resourceValuesSchema,
  type ResourceValues,
} from "@/lib/validations/resources";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";

type ResourceArea = Enums<"service_area">;
type ResourceFilter = ResourceArea | "all";
type FieldErrors = Record<string, string | undefined>;

type ResourceManagerProps = {
  activeFilter: ResourceFilter;
  availableFilters?: ResourceFilter[];
  canManage: boolean;
  emptyHint?: string;
  emptyMessage?: string;
  folders: ResourceFolder[];
  manageableAreas?: ResourceArea[];
  resources: MultimediaResource[];
  selectedFolderId?: string | null;
};

type ResourceConfirmation =
  | {
      resource: MultimediaResource;
      type: "delete-resource" | "toggle-resource";
    }
  | {
      resource: MultimediaResource;
      type: "update-external";
      values: ResourceValues;
    }
  | {
      folder: ResourceFolder;
      type: "delete-folder" | "toggle-folder";
    };

const AREA_DETAILS: Record<
  ResourceArea,
  { icon: LucideIcon; label: string; summary: string }
> = {
  general: {
    icon: Layers3,
    label: "Ambos",
    summary: "Entrenamiento y nutricion",
  },
  nutrition: {
    icon: Leaf,
    label: "Nutricion",
    summary: "Solo plan de nutricion",
  },
  training: {
    icon: Dumbbell,
    label: "Entrenamiento",
    summary: "Solo plan de entrenamiento",
  },
};

const FILTERS: Array<{ label: string; value: ResourceFilter }> = [
  { label: "Todos", value: "all" },
  { label: "Entrenamiento", value: "training" },
  { label: "Nutricion", value: "nutrition" },
  { label: "Ambos", value: "general" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Costa_Rica",
  }).format(new Date(value));
}

function formatFileSize(bytes: number | null) {
  if (!bytes || bytes <= 0) {
    return "PDF";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getUrlPresentation(value: string) {
  const presentation = getExternalResourcePresentation(value);
  const iconByType = {
    document: FileText,
    external: Link2,
    image: ImageIcon,
    video: PlaySquare,
  };

  return {
    domain: presentation.domain,
    icon: iconByType[presentation.type],
    kind: presentation.label,
  };
}

function getAreaLabel(area: ResourceArea, canManage: boolean) {
  if (!canManage && area === "general") {
    return "General";
  }

  return AREA_DETAILS[area].label;
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

function readFileError(formData: FormData, required: boolean) {
  const value = formData.get("file");

  if (value instanceof File && value.size > 0) {
    return getResourcePdfValidationError(value);
  }

  return required ? "Selecciona un archivo PDF." : null;
}

function buildResourcesHref({
  area,
  folderId,
}: {
  area?: ResourceFilter;
  folderId?: string | null;
}) {
  const params = new URLSearchParams();

  if (area && area !== "all") {
    params.set("area", area);
  }

  if (folderId) {
    params.set("folder", folderId);
  }

  const query = params.toString();

  return query ? `/app/recursos?${query}` : "/app/recursos";
}

function PdfActionButton({
  download = false,
  resourceId,
}: {
  download?: boolean;
  resourceId: string;
}) {
  const [isPending, setIsPending] = useState(false);

  async function openPdf() {
    setIsPending(true);

    try {
      const result = await createResourceSignedUrl(resourceId, { download });

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
      onClick={openPdf}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Download className="size-4" aria-hidden="true" />
      )}
      {download ? "Descargar PDF" : "Abrir PDF"}
    </Button>
  );
}

function ResourceCard({
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
  const PreviewIcon = isPdf ? FileText : presentation?.icon ?? Link2;
  const kindLabel = isPdf ? "PDF" : presentation?.kind ?? "Enlace";
  const sourceLabel = isPdf
    ? resource.file_name ?? "Documento PDF"
    : presentation?.domain ?? "Enlace externo";

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-border bg-background shadow-soft",
        isInactive && "opacity-70",
      )}
    >
      <div
        className={cn(
          "relative grid min-h-40 place-items-center overflow-hidden border-b border-border px-5 py-8",
          resource.area === "training" &&
            "bg-[radial-gradient(circle_at_top_left,var(--primary),transparent_68%)]",
          resource.area === "nutrition" &&
            "bg-[radial-gradient(circle_at_top_left,var(--accent),transparent_68%)]",
          resource.area === "general" &&
            "bg-[linear-gradient(135deg,var(--primary-soft),var(--accent-soft))]",
        )}
      >
        <div className="absolute inset-x-5 top-4 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/10 bg-surface/90 px-3 py-1 text-xs font-extrabold text-charcoal shadow-soft">
            <AreaIcon className="size-3.5" aria-hidden="true" />
            {getAreaLabel(resource.area, canManage)}
          </span>
          <span className="rounded-full bg-charcoal/80 px-3 py-1 text-xs font-bold text-white">
            {kindLabel}
          </span>
        </div>
        <PreviewIcon
          className="mt-8 size-12 text-warm-brown"
          aria-hidden="true"
        />
        <p
          className="mt-3 max-w-full truncate text-sm font-extrabold text-charcoal"
          translate="no"
        >
          {sourceLabel}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 break-words text-2xl font-semibold leading-tight text-charcoal">
            {resource.title}
          </h3>
          <CardActionsMenu
            label={resource.title}
            items={[
              ...(isPdf
                ? [
                    {
                      icon: Download,
                      label: "Abrir PDF",
                      onSelect: () => {
                        void createResourceSignedUrl(resource.id).then(
                          (result) => {
                            if (result.status === "error" || !result.signedUrl) {
                              toast.error(result.message);
                              return;
                            }

                            window.open(
                              result.signedUrl,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          },
                        );
                      },
                    },
                    {
                      icon: Download,
                      label: "Descargar PDF",
                      onSelect: () => {
                        void createResourceSignedUrl(resource.id, {
                          download: true,
                        }).then((result) => {
                          if (result.status === "error" || !result.signedUrl) {
                            toast.error(result.message);
                            return;
                          }

                          window.open(
                            result.signedUrl,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        });
                      },
                    },
                  ]
                : resource.file_url
                  ? [
                      {
                        external: true,
                        href: resource.file_url,
                        icon: ExternalLink,
                        label: "Abrir recurso",
                      },
                    ]
                  : []),
              ...(canManage
                ? [
                    {
                      icon: Pencil,
                      label: "Editar",
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
                : []),
            ]}
          />
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
          {resource.description || area.summary}
        </p>

        <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-xs font-bold text-warm-brown sm:grid-cols-2">
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
            <dd className="mt-1 tabular-nums">
              {formatDate(resource.updated_at)}
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
                      : "bg-primary-soft text-charcoal",
                  )}
                >
                  {isInactive ? "Inactivo" : "Activo"}
                </span>
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          {isPdf ? (
            <PdfActionButton resourceId={resource.id} />
          ) : resource.file_url ? (
            <Button asChild variant="outline" size="sm">
              <a
                href={resource.file_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                Abrir recurso
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function FolderCard({
  activeFilter,
  canManage,
  folder,
  onDelete,
  onEdit,
  onToggleActive,
}: {
  activeFilter: ResourceFilter;
  canManage: boolean;
  folder: ResourceFolder;
  onDelete: (folder: ResourceFolder) => void;
  onEdit: (folder: ResourceFolder) => void;
  onToggleActive: (folder: ResourceFolder) => void;
}) {
  const details = AREA_DETAILS[folder.area];
  const AreaIcon = details.icon;
  const isInactive = !folder.active;
  const href = buildResourcesHref({
    area: activeFilter,
    folderId: folder.id,
  });

  return (
    <article
      className={cn(
        "group flex min-w-0 flex-col rounded-[24px] border border-border bg-background p-5 shadow-soft transition-colors hover:border-primary/35",
        isInactive && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Link href={href} className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-primary-soft text-warm-brown">
              <FolderOpen className="size-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
                <AreaIcon className="size-3.5" aria-hidden="true" />
                {getAreaLabel(folder.area, canManage)}
              </p>
              <h3 className="mt-1 break-words text-2xl font-semibold leading-tight text-charcoal">
                {folder.name}
              </h3>
            </div>
          </div>
        </Link>

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

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">
        {folder.description || "Carpeta de recursos PDF."}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-extrabold text-charcoal">
          {folder.documentCount} documentos
        </span>
        {canManage ? (
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-extrabold",
              isInactive
                ? "bg-muted/15 text-muted"
                : "bg-primary-soft text-charcoal",
            )}
          >
            {isInactive ? "Inactiva" : "Activa"}
          </span>
        ) : null}
      </div>
    </article>
  );
}

function AreaSelector({
  disabled,
  id,
  manageableAreas,
  name = "area",
  onChange,
  value,
}: {
  disabled?: boolean;
  id: string;
  manageableAreas: ResourceArea[];
  name?: string;
  onChange?: (value: ResourceArea) => void;
  value: ResourceArea;
}) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value as ResourceArea)}
      className="mt-2 h-12 w-full rounded-control border border-input bg-surface px-4 text-sm font-semibold text-charcoal shadow-soft outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
    >
      {manageableAreas.map((area) => (
        <option key={area} value={area}>
          {AREA_DETAILS[area].label}
        </option>
      ))}
    </select>
  );
}

function FolderManager({
  folders,
  manageableAreas,
  onDelete,
  onToggleActive,
}: {
  folders: ResourceFolder[];
  manageableAreas: ResourceArea[];
  onDelete: (folder: ResourceFolder) => void;
  onToggleActive: (folder: ResourceFolder) => void;
}) {
  const router = useRouter();
  const [editingFolder, setEditingFolder] = useState<ResourceFolder | null>(
    null,
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [selectedArea, setSelectedArea] = useState<ResourceArea>(
    manageableAreas[0] ?? "general",
  );
  const [isPending, setIsPending] = useState(false);

  function clearFolderForm(form?: HTMLFormElement) {
    setEditingFolder(null);
    setFieldErrors({});
    setSelectedArea(manageableAreas[0] ?? "general");
    form?.reset();
  }

  function startEditing(folder: ResourceFolder) {
    setEditingFolder(folder);
    setSelectedArea(folder.area);
    setFieldErrors({});
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setIsPending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const values = {
      area: editingFolder?.area ?? String(formData.get("area") ?? ""),
      description: String(formData.get("description") ?? ""),
      id: editingFolder?.id,
      name: String(formData.get("name") ?? ""),
    };

    try {
      const result = editingFolder
        ? await updateResourceFolder(values)
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
    <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-[16px] bg-accent-soft text-warm-brown">
          <Folder className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-charcoal">
            Carpetas
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Organiza PDFs por tema y area.
          </p>
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <Label htmlFor="resource-folder-name" className="font-extrabold text-charcoal">
            Nombre
          </Label>
          <Input
            key={editingFolder?.id ?? "new-folder"}
            id="resource-folder-name"
            name="name"
            className="mt-2 h-12 rounded-control"
            defaultValue={editingFolder?.name ?? ""}
            maxLength={120}
            placeholder="Salud digestiva"
            required
            disabled={isPending}
          />
          <FieldError id="resource-folder-name-error" message={fieldErrors.name} />
        </div>

        <div>
          <Label htmlFor="resource-folder-description" className="font-extrabold text-charcoal">
            Descripcion opcional
          </Label>
          <textarea
            key={`${editingFolder?.id ?? "new-folder"}-description`}
            id="resource-folder-description"
            name="description"
            rows={3}
            maxLength={500}
            defaultValue={editingFolder?.description ?? ""}
            disabled={isPending}
            className="mt-2 w-full resize-y rounded-[20px] border border-input bg-surface/90 px-4 py-3 text-sm leading-6 text-foreground shadow-soft outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          />
          <FieldError
            id="resource-folder-description-error"
            message={fieldErrors.description}
          />
        </div>

        <div>
          <Label htmlFor="resource-folder-area" className="font-extrabold text-charcoal">
            Area
          </Label>
          <AreaSelector
            id="resource-folder-area"
            value={selectedArea}
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
                  "flex items-center justify-between gap-3 rounded-[18px] border border-border bg-background px-4 py-3",
                  isInactive && "opacity-70",
                )}
              >
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() => startEditing(folder)}
                >
                  <p className="truncate font-extrabold text-charcoal">
                    {folder.name}
                  </p>
                  <p className="mt-1 text-xs font-bold text-muted">
                    {getAreaLabel(folder.area, true)} · {folder.documentCount} documentos
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
          <div className="rounded-[18px] border border-dashed border-border bg-background p-4 text-sm font-semibold text-muted">
            Aun no hay carpetas.
          </div>
        )}
      </div>
    </section>
  );
}

function PdfUploadForm({
  folders,
  manageableAreas,
}: {
  folders: ResourceFolder[];
  manageableAreas: ResourceArea[];
}) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [selectedArea, setSelectedArea] = useState<ResourceArea>(
    manageableAreas[0] ?? "general",
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
      setSelectedArea(manageableAreas[0] ?? "general");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-[16px] bg-primary-soft text-warm-brown">
          <Upload className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Subir PDF</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Puede quedar en raiz o dentro de una carpeta.
          </p>
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <Label htmlFor="pdf-area" className="font-extrabold text-charcoal">
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
          <Label htmlFor="pdf-folder" className="font-extrabold text-charcoal">
            Carpeta opcional
          </Label>
          <select
            id="pdf-folder"
            name="folderId"
            disabled={isPending}
            className="mt-2 h-12 w-full rounded-control border border-input bg-surface px-4 text-sm font-semibold text-charcoal shadow-soft outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          >
            <option value="">Sin carpeta (raiz)</option>
            {availableFolders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <FieldError id="pdf-folder-error" message={fieldErrors.folderId} />
        </div>

        <div>
          <Label htmlFor="pdf-title" className="font-extrabold text-charcoal">
            Titulo
          </Label>
          <Input
            id="pdf-title"
            name="title"
            className="mt-2 h-12 rounded-control"
            maxLength={180}
            required
            disabled={isPending}
          />
          <FieldError id="pdf-title-error" message={fieldErrors.title} />
        </div>

        <div>
          <Label htmlFor="pdf-description" className="font-extrabold text-charcoal">
            Descripcion opcional
          </Label>
          <textarea
            id="pdf-description"
            name="description"
            rows={4}
            maxLength={2000}
            disabled={isPending}
            className="mt-2 w-full resize-y rounded-[20px] border border-input bg-surface/90 px-4 py-3 text-sm leading-6 text-foreground shadow-soft outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          />
          <FieldError id="pdf-description-error" message={fieldErrors.description} />
        </div>

        <div>
          <Label htmlFor="pdf-file" className="font-extrabold text-charcoal">
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

function PdfEditForm({
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
    <section className="rounded-[28px] border border-primary/25 bg-primary-soft/65 p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
            Edicion
          </p>
          <h2 className="mt-2 text-2xl font-bold text-charcoal">
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
          <Label htmlFor="pdf-edit-title" className="font-extrabold text-charcoal">
            Titulo
          </Label>
          <Input
            id="pdf-edit-title"
            name="title"
            className="mt-2 h-12 rounded-control"
            defaultValue={resource.title}
            maxLength={180}
            required
            disabled={isPending}
          />
          <FieldError id="pdf-edit-title-error" message={fieldErrors.title} />
        </div>

        <div>
          <Label htmlFor="pdf-edit-area" className="font-extrabold text-charcoal">
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
          <Label htmlFor="pdf-edit-folder" className="font-extrabold text-charcoal">
            Carpeta opcional
          </Label>
          <select
            id="pdf-edit-folder"
            name="folderId"
            disabled={isPending}
            defaultValue={resource.folder_id ?? ""}
            className="mt-2 h-12 w-full rounded-control border border-input bg-surface px-4 text-sm font-semibold text-charcoal shadow-soft outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          >
            <option value="">Sin carpeta (raiz)</option>
            {availableFolders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <FieldError id="pdf-edit-folder-error" message={fieldErrors.folderId} />
        </div>

        <div>
          <Label htmlFor="pdf-edit-description" className="font-extrabold text-charcoal">
            Descripcion opcional
          </Label>
          <textarea
            id="pdf-edit-description"
            name="description"
            rows={4}
            maxLength={2000}
            defaultValue={resource.description ?? ""}
            disabled={isPending}
            className="mt-2 w-full resize-y rounded-[20px] border border-input bg-surface/90 px-4 py-3 text-sm leading-6 text-foreground shadow-soft outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          />
          <FieldError
            id="pdf-edit-description-error"
            message={fieldErrors.description}
          />
        </div>

        <div>
          <Label htmlFor="pdf-edit-file" className="font-extrabold text-charcoal">
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

function ExternalResourceForm({
  editingResource,
  formRef,
  manageableAreas,
  onCancel,
  onSave,
}: {
  editingResource: MultimediaResource | null;
  formRef: React.RefObject<HTMLDivElement | null>;
  manageableAreas: ResourceArea[];
  onCancel: () => void;
  onSave: (
    values: ResourceValues,
    resource: MultimediaResource | null,
  ) => Promise<void>;
}) {
  const [serverMessage, setServerMessage] = useState("");
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ResourceValues>({
    defaultValues: {
      area: "general",
      description: "",
      title: "",
      url: "",
    },
    resolver: zodResolver(resourceValuesSchema),
  });
  const selectedArea = useWatch({ control, name: "area" });

  function resetForm() {
    setServerMessage("");
    clearErrors();
    reset({
      area: "general",
      description: "",
      title: "",
      url: "",
    });
    onCancel();
  }

  useMemo(() => {
    if (!editingResource || editingResource.kind !== "external_link") {
      return;
    }

    setServerMessage("");
    clearErrors();
    reset({
      area: editingResource.area,
      description: editingResource.description ?? "",
      title: editingResource.title,
      url: editingResource.file_url ?? "",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [clearErrors, editingResource, formRef, reset]);

  async function submit(values: ResourceValues) {
    setServerMessage("");
    clearErrors("root");

    try {
      await onSave(values, editingResource);
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
      className="scroll-mt-6 rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
            {editingResource ? "Edicion" : "Nuevo enlace"}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-charcoal">
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
          <Label htmlFor="resource-title" className="font-extrabold text-charcoal">
            Titulo
          </Label>
          <Input
            id="resource-title"
            className="mt-2 h-12 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft"
            aria-describedby={errors.title ? "resource-title-error" : undefined}
            aria-invalid={Boolean(errors.title)}
            autoComplete="off"
            maxLength={180}
            {...register("title")}
          />
          <FieldError id="resource-title-error" message={errors.title?.message} />
        </div>

        <div>
          <Label htmlFor="resource-description" className="font-extrabold text-charcoal">
            Descripcion opcional
          </Label>
          <textarea
            id="resource-description"
            rows={4}
            maxLength={2000}
            className="mt-2 w-full resize-y rounded-[22px] border border-input bg-surface/90 px-4 py-4 text-base leading-7 text-foreground shadow-soft outline-none placeholder:text-muted focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 disabled:opacity-50"
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
          <Label htmlFor="resource-url" className="font-extrabold text-charcoal">
            URL externa
          </Label>
          <Input
            id="resource-url"
            type="url"
            inputMode="url"
            className="mt-2 h-12 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft"
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
          <legend className="text-sm font-extrabold text-charcoal">
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
                    "flex min-h-16 cursor-pointer items-center gap-3 rounded-[18px] border px-4 py-3 transition-[background-color,border-color,box-shadow]",
                    selectedArea === areaValue
                      ? "border-primary/40 bg-primary-soft shadow-soft"
                      : "border-border bg-background hover:border-primary/30",
                  )}
                >
                  <input
                    type="radio"
                    value={areaValue}
                    className="size-5 accent-[var(--primary-hover)]"
                    {...register("area")}
                  />
                  <Icon
                    className="size-5 shrink-0 text-warm-brown"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block font-extrabold text-charcoal">
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

export function ResourceManager({
  activeFilter,
  availableFilters = FILTERS.map((filter) => filter.value),
  canManage,
  emptyHint,
  emptyMessage,
  folders,
  manageableAreas = ["training", "nutrition", "general"],
  resources,
  selectedFolderId,
}: ResourceManagerProps) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [editingExternalResource, setEditingExternalResource] =
    useState<MultimediaResource | null>(null);
  const [editingPdfResource, setEditingPdfResource] =
    useState<MultimediaResource | null>(null);
  const [confirmation, setConfirmation] =
    useState<ResourceConfirmation | null>(null);
  const visibleFilters = FILTERS.filter((filter) =>
    availableFilters.includes(filter.value),
  );
  const selectedFolder =
    selectedFolderId
      ? folders.find((folder) => folder.id === selectedFolderId) ?? null
      : null;
  const rootFolders = selectedFolder ? [] : folders;
  const visibleResources = selectedFolder
    ? resources.filter((resource) => resource.folder_id === selectedFolder.id)
    : resources.filter((resource) => !resource.folder_id);
  const hasRootContent = rootFolders.length > 0 || visibleResources.length > 0;
  const backHref = buildResourcesHref({ area: activeFilter });

  async function saveExternalResource(
    values: ResourceValues,
    resource: MultimediaResource | null,
  ) {
    const result = resource
      ? await updateResource({ ...values, id: resource.id })
      : await createResource(values);

    if (result.status === "error") {
      toast.error(result.message);
      throw result;
    }

    toast.success(result.message);
    setEditingExternalResource(null);
    router.refresh();
  }

  function startEditingExternal(resource: MultimediaResource) {
    setEditingPdfResource(null);
    setEditingExternalResource(resource);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startEditingPdf(resource: MultimediaResource) {
    setEditingExternalResource(null);
    setEditingPdfResource(resource);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function removeResource(resource: MultimediaResource) {
    const result = await deleteResource(resource.id);

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    if (editingExternalResource?.id === resource.id) {
      setEditingExternalResource(null);
    }
    if (editingPdfResource?.id === resource.id) {
      setEditingPdfResource(null);
    }
    router.refresh();
  }

  async function toggleResourceStatus(resource: MultimediaResource) {
    const result =
      resource.status === "active"
        ? await deactivateResource(resource.id)
        : await activateResource(resource.id);

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  async function removeFolder(folder: ResourceFolder) {
    const result = await deleteResourceFolder(folder.id);

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  async function toggleFolder(folder: ResourceFolder) {
    const result = await toggleResourceFolderActive(folder.id);

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  async function confirmAction() {
    if (!confirmation) {
      return;
    }

    switch (confirmation.type) {
      case "delete-resource":
        await removeResource(confirmation.resource);
        break;
      case "toggle-resource":
        await toggleResourceStatus(confirmation.resource);
        break;
      case "update-external":
        await saveExternalResource(
          confirmation.values,
          confirmation.resource,
        );
        break;
      case "delete-folder":
        await removeFolder(confirmation.folder);
        break;
      case "toggle-folder":
        await toggleFolder(confirmation.folder);
        break;
    }
  }

  const library = (
    <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
            Biblioteca
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-charcoal">
            {selectedFolder ? selectedFolder.name : "Recursos disponibles"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {selectedFolder
              ? selectedFolder.description ||
                "Documentos dentro de esta carpeta."
              : canManage
                ? "Carpetas, PDFs y enlaces visibles segun area y estado."
                : "Abre los materiales compartidos para acompanar tu plan."}
          </p>
        </div>

        {selectedFolder ? (
          <Button asChild variant="outline">
            <Link href={backHref}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver a Recursos
            </Link>
          </Button>
        ) : null}
      </div>

      {!selectedFolder ? (
        <nav
          className="mt-5 flex flex-wrap gap-2"
          aria-label="Filtrar recursos por acceso"
        >
          {visibleFilters.map((filter) => {
            const href = buildResourcesHref({ area: filter.value });
            const label =
              !canManage && filter.value === "general"
                ? "General"
                : filter.label;

            return (
              <Button
                key={filter.value}
                asChild
                size="sm"
                variant={activeFilter === filter.value ? "default" : "outline"}
              >
                <Link
                  href={href}
                  aria-current={
                    activeFilter === filter.value ? "page" : undefined
                  }
                >
                  {label}
                </Link>
              </Button>
            );
          })}
        </nav>
      ) : null}

      {selectedFolder ? (
        visibleResources.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {visibleResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                canManage={canManage}
                onDelete={(selected) =>
                  setConfirmation({
                    resource: selected,
                    type: "delete-resource",
                  })
                }
                onEditExternal={startEditingExternal}
                onEditPdf={startEditingPdf}
                onToggleStatus={(selected) =>
                  setConfirmation({
                    resource: selected,
                    type: "toggle-resource",
                  })
                }
                resource={resource}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[22px] border border-dashed border-border bg-background px-5 py-12 text-center">
            <p className="font-extrabold text-charcoal">
              Esta carpeta no tiene documentos visibles.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {canManage
                ? "Sube un PDF y asignalo a esta carpeta."
                : "Cuando haya PDFs activos apareceran aqui."}
            </p>
          </div>
        )
      ) : hasRootContent ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {rootFolders.map((folder) => (
            <FolderCard
              key={folder.id}
              activeFilter={activeFilter}
              canManage={canManage}
              folder={folder}
              onDelete={(selected) =>
                setConfirmation({ folder: selected, type: "delete-folder" })
              }
              onEdit={() => {
                const target = document.getElementById("resource-folder-name");
                target?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              onToggleActive={(selected) =>
                setConfirmation({ folder: selected, type: "toggle-folder" })
              }
            />
          ))}
          {visibleResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              canManage={canManage}
              onDelete={(selected) =>
                setConfirmation({
                  resource: selected,
                  type: "delete-resource",
                })
              }
              onEditExternal={startEditingExternal}
              onEditPdf={startEditingPdf}
              onToggleStatus={(selected) =>
                setConfirmation({
                  resource: selected,
                  type: "toggle-resource",
                })
              }
              resource={resource}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[22px] border border-dashed border-border bg-background px-5 py-12 text-center">
          <p className="font-extrabold text-charcoal">
            {emptyMessage ?? "Aun no hay recursos disponibles."}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {emptyHint ??
              (canManage
                ? "Crea una carpeta, sube un PDF o agrega un enlace."
                : "Tu profesional asignado puede compartir recursos contigo.")}
          </p>
        </div>
      )}
    </section>
  );

  let confirmTitle = "";
  let confirmDescription = "";
  let confirmLabel = "";
  let pendingLabel = "";
  let confirmTone: "default" | "destructive" = "default";

  if (confirmation) {
    if (confirmation.type === "delete-resource") {
      confirmTitle = "Eliminar recurso";
      confirmDescription = `Se eliminara "${confirmation.resource.title}". Si es un PDF propio de Recursos tambien se eliminara de Storage.`;
      confirmLabel = "Eliminar recurso";
      pendingLabel = "Eliminando";
      confirmTone = "destructive";
    } else if (confirmation.type === "toggle-resource") {
      const active = confirmation.resource.status === "active";
      confirmTitle = active ? "Desactivar recurso" : "Activar recurso";
      confirmDescription = active
        ? `El recurso "${confirmation.resource.title}" dejara de estar visible para clientas.`
        : `El recurso "${confirmation.resource.title}" volvera a estar visible segun permisos.`;
      confirmLabel = active ? "Desactivar" : "Activar";
      pendingLabel = active ? "Desactivando" : "Activando";
      confirmTone = active ? "destructive" : "default";
    } else if (confirmation.type === "update-external") {
      confirmTitle = "Guardar cambios";
      confirmDescription = `Se actualizara "${confirmation.values.title}" con la informacion del formulario.`;
      confirmLabel = "Guardar cambios";
      pendingLabel = "Guardando";
    } else if (confirmation.type === "delete-folder") {
      confirmTitle = "Eliminar carpeta";
      confirmDescription = `Se eliminara la carpeta "${confirmation.folder.name}" porque no tiene documentos.`;
      confirmLabel = "Eliminar carpeta";
      pendingLabel = "Eliminando";
      confirmTone = "destructive";
    } else if (confirmation.type === "toggle-folder") {
      const active = confirmation.folder.active;
      confirmTitle = active ? "Desactivar carpeta" : "Activar carpeta";
      confirmDescription = active
        ? `La carpeta "${confirmation.folder.name}" y sus documentos se ocultaran para clientas.`
        : `La carpeta "${confirmation.folder.name}" volvera a estar visible segun permisos.`;
      confirmLabel = active ? "Desactivar" : "Activar";
      pendingLabel = active ? "Desactivando" : "Activando";
      confirmTone = active ? "destructive" : "default";
    }
  }

  if (!canManage) {
    return library;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] xl:items-start">
      <div className="space-y-6">
        {editingPdfResource ? (
          <div ref={formRef}>
            <PdfEditForm
              folders={folders}
              manageableAreas={manageableAreas}
              onCancel={() => setEditingPdfResource(null)}
              resource={editingPdfResource}
            />
          </div>
        ) : (
          <ExternalResourceForm
            editingResource={editingExternalResource}
            formRef={formRef}
            manageableAreas={manageableAreas}
            onCancel={() => setEditingExternalResource(null)}
            onSave={async (values, resource) => {
              if (resource) {
                setConfirmation({
                  resource,
                  type: "update-external",
                  values,
                });
                return;
              }

              await saveExternalResource(values, null);
            }}
          />
        )}

        <PdfUploadForm folders={folders} manageableAreas={manageableAreas} />
        <FolderManager
          folders={folders}
          manageableAreas={manageableAreas}
          onDelete={(folder) =>
            setConfirmation({ folder, type: "delete-folder" })
          }
          onToggleActive={(folder) =>
            setConfirmation({ folder, type: "toggle-folder" })
          }
        />
      </div>

      {library}

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
