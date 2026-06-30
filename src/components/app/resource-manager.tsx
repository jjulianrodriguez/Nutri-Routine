"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ChevronRight,
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
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
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
type ResourceContentFilter = "all" | "folders" | "links" | "pdf";
type ResourceStatusFilter = "active" | "all" | "inactive";
type FieldErrors = Record<string, string | undefined>;

type ResourceManagerProps = {
  activeFilter: ResourceFilter;
  availableFilters?: ResourceFilter[];
  canManage: boolean;
  emptyHint?: string;
  emptyMessage?: string;
  folders: ResourceFolder[];
  initialContentFilter?: ResourceContentFilter;
  initialSearchQuery?: string;
  initialStatusFilter?: ResourceStatusFilter;
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
    label: "Compartido",
    summary: "Disponible para nutricion y entrenamiento",
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
  { label: "Compartido", value: "general" },
];

const CONTENT_FILTERS: Array<{ label: string; value: ResourceContentFilter }> = [
  { label: "Todos", value: "all" },
  { label: "PDFs", value: "pdf" },
  { label: "Enlaces", value: "links" },
  { label: "Carpetas", value: "folders" },
];

const STATUS_FILTERS: Array<{ label: string; value: ResourceStatusFilter }> = [
  { label: "Todos", value: "all" },
  { label: "Activos", value: "active" },
  { label: "Inactivos", value: "inactive" },
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

function getAreaLabel(area: ResourceArea) {
  return AREA_DETAILS[area].label;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getResourceKindLabel(resource: MultimediaResource) {
  return resource.kind === "pdf" ? "PDF" : "Enlace";
}

function getResourceSearchText(resource: MultimediaResource) {
  return normalizeSearchText(
    [
      resource.title,
      resource.description,
      resource.folderName,
      getResourceKindLabel(resource),
      getAreaLabel(resource.area),
      AREA_DETAILS[resource.area].summary,
      resource.kind === "pdf" ? resource.file_name : resource.file_url,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function getFolderSearchText(folder: ResourceFolder) {
  return normalizeSearchText(
    [
      folder.name,
      folder.description,
      "Carpeta",
      getAreaLabel(folder.area),
      AREA_DETAILS[folder.area].summary,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function matchesSearch(haystack: string, query: string) {
  return !query || haystack.includes(query);
}

function matchesResourceContent(
  resource: MultimediaResource,
  filter: ResourceContentFilter,
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "pdf") {
    return resource.kind === "pdf";
  }

  if (filter === "links") {
    return resource.kind === "external_link";
  }

  return false;
}

function matchesFolderContent(filter: ResourceContentFilter) {
  return filter === "all" || filter === "folders";
}

function matchesResourceStatus(
  resource: MultimediaResource,
  filter: ResourceStatusFilter,
) {
  if (filter === "all") {
    return true;
  }

  return resource.status === filter;
}

function matchesFolderStatus(
  folder: ResourceFolder,
  filter: ResourceStatusFilter,
) {
  if (filter === "all") {
    return true;
  }

  return filter === "active" ? folder.active : !folder.active;
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
  content,
  folderId,
  q,
  status,
}: {
  area?: ResourceFilter;
  content?: ResourceContentFilter;
  folderId?: string | null;
  q?: string;
  status?: ResourceStatusFilter;
}) {
  const params = new URLSearchParams();

  if (area && area !== "all") {
    params.set("area", area);
  }

  if (content && content !== "all") {
    params.set("type", content);
  }

  if (status && status !== "all") {
    params.set("status", status);
  }

  const search = q?.trim();

  if (search) {
    params.set("q", search);
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

  const Icon = download ? Download : ExternalLink;

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
        <Icon className="size-4" aria-hidden="true" />
      )}
      {download ? "Descargar" : "Abrir PDF"}
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
        "flex min-w-0 flex-col rounded-[20px] border border-border bg-background p-4 shadow-soft",
        isInactive && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-[16px] border border-border",
            isPdf ? "bg-primary-soft text-primary-hover" : "bg-accent-soft text-warm-brown",
          )}
        >
          <PreviewIcon className="size-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-charcoal px-2.5 py-1 text-xs font-extrabold text-white">
              {kindLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-extrabold text-charcoal">
              <AreaIcon className="size-3.5" aria-hidden="true" />
              {getAreaLabel(resource.area)}
            </span>
            {canManage ? (
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-extrabold",
                  isInactive
                    ? "bg-muted/15 text-muted"
                    : "bg-primary-soft text-charcoal",
                )}
              >
                {isInactive ? "Inactivo" : "Activo"}
              </span>
            ) : null}
          </div>

          <h3 className="mt-2 min-w-0 break-words text-lg font-bold leading-tight text-charcoal">
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

      <dl className="mt-4 grid gap-3 border-t border-border pt-4 text-xs font-bold text-warm-brown sm:grid-cols-2">
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

      <div className="mt-4 flex flex-wrap gap-2">
        {isPdf ? (
          <>
            <PdfActionButton resourceId={resource.id} />
            <PdfActionButton resourceId={resource.id} download />
          </>
        ) : resource.file_url ? (
          <Button asChild variant="outline" size="sm">
            <a
              href={resource.file_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Abrir enlace
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function FolderCard({
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
        "relative flex min-w-0 flex-col rounded-[20px] border border-border bg-background p-4 pt-6 shadow-soft",
        isInactive && "opacity-70",
      )}
    >
      <div className="absolute left-5 top-0 h-3 w-24 -translate-y-px rounded-t-[14px] border border-b-0 border-border bg-accent-soft" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex flex-1 items-start gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-accent-soft text-warm-brown">
            <FolderOpen className="size-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-charcoal px-2.5 py-1 text-xs font-extrabold text-white">
                Carpeta
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-extrabold text-charcoal">
                <AreaIcon className="size-3.5" aria-hidden="true" />
                {getAreaLabel(folder.area)}
              </span>
              {canManage ? (
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-extrabold",
                    isInactive
                      ? "bg-muted/15 text-muted"
                      : "bg-primary-soft text-charcoal",
                  )}
                >
                  {isInactive ? "Inactiva" : "Activa"}
                </span>
              ) : null}
            </div>
            <h3 className="mt-2 break-words text-lg font-bold leading-tight text-charcoal">
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

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-extrabold text-charcoal">
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
      className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6"
    >
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-[16px] bg-accent-soft text-warm-brown">
          <Folder className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-charcoal">
            Carpetas
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Organiza PDFs y enlaces por tema y area.
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
          <div className="rounded-[18px] border border-dashed border-border bg-background p-4 text-sm font-semibold text-muted">
            Todavia no hay carpetas.
          </div>
        )}
      </div>
    </section>
  );
}

function PdfUploadForm({
  folders,
  manageableAreas,
  selectedFolder,
}: {
  folders: ResourceFolder[];
  manageableAreas: ResourceArea[];
  selectedFolder?: ResourceFolder | null;
}) {
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
    <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-[16px] bg-primary-soft text-warm-brown">
          <Upload className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Subir PDF</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Puede quedar sin carpeta o dentro de una carpeta.
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
            key={selectedArea}
            id="pdf-folder"
            name="folderId"
            disabled={isPending}
            defaultValue={
              selectedFolder?.area === selectedArea ? selectedFolder.id : ""
            }
            className="mt-2 h-12 w-full rounded-control border border-input bg-surface px-4 text-sm font-semibold text-charcoal shadow-soft outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
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
            key={selectedArea}
            id="pdf-edit-folder"
            name="folderId"
            disabled={isPending}
            defaultValue={selectedArea === resource.area ? resource.folder_id ?? "" : ""}
            className="mt-2 h-12 w-full rounded-control border border-input bg-surface px-4 text-sm font-semibold text-charcoal shadow-soft outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
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
  folders,
  manageableAreas,
  onCancel,
  onSave,
  selectedFolder,
}: {
  editingResource: MultimediaResource | null;
  formRef: RefObject<HTMLDivElement | null>;
  folders: ResourceFolder[];
  manageableAreas: ResourceArea[];
  onCancel: () => void;
  onSave: (
    values: ResourceValues,
    resource: MultimediaResource | null,
  ) => Promise<void>;
  selectedFolder?: ResourceFolder | null;
}) {
  const [serverMessage, setServerMessage] = useState("");
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

        <div>
          <Label htmlFor="resource-folder" className="font-extrabold text-charcoal">
            Carpeta opcional
          </Label>
          <select
            id="resource-folder"
            className="mt-2 h-12 w-full rounded-control border border-input bg-surface px-4 text-sm font-semibold text-charcoal shadow-soft outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
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

export function ResourceManager({
  activeFilter,
  availableFilters = FILTERS.map((filter) => filter.value),
  canManage,
  emptyHint,
  emptyMessage,
  folders,
  initialContentFilter = "all",
  initialSearchQuery = "",
  initialStatusFilter = "all",
  manageableAreas = ["training", "nutrition", "general"],
  resources,
  selectedFolderId,
}: ResourceManagerProps) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const initialSafeContentFilter =
    selectedFolderId && initialContentFilter === "folders"
      ? "all"
      : initialContentFilter;
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [contentFilter, setContentFilter] = useState<ResourceContentFilter>(
    initialSafeContentFilter,
  );
  const [statusFilter, setStatusFilter] = useState<ResourceStatusFilter>(
    canManage ? initialStatusFilter : "all",
  );
  const [editingExternalResource, setEditingExternalResource] =
    useState<MultimediaResource | null>(null);
  const [editingPdfResource, setEditingPdfResource] =
    useState<MultimediaResource | null>(null);
  const [editingFolder, setEditingFolder] = useState<ResourceFolder | null>(
    null,
  );
  const [confirmation, setConfirmation] =
    useState<ResourceConfirmation | null>(null);
  const visibleAreaFilters = FILTERS.filter((filter) =>
    availableFilters.includes(filter.value),
  );
  const selectedFolder =
    selectedFolderId
      ? folders.find((folder) => folder.id === selectedFolderId) ?? null
      : null;
  const effectiveContentFilter =
    selectedFolder && contentFilter === "folders" ? "all" : contentFilter;
  const effectiveStatusFilter = canManage ? statusFilter : "all";
  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const visibleContentFilters = selectedFolder
    ? CONTENT_FILTERS.filter((filter) => filter.value !== "folders")
    : CONTENT_FILTERS;
  const rootFolders = selectedFolder ? [] : folders;
  const resourcesInScope = selectedFolder
    ? resources.filter((resource) => resource.folder_id === selectedFolder.id)
    : resources.filter((resource) => !resource.folder_id);
  const filteredFolders = rootFolders.filter(
    (folder) =>
      matchesFolderContent(effectiveContentFilter) &&
      matchesFolderStatus(folder, effectiveStatusFilter) &&
      matchesSearch(getFolderSearchText(folder), normalizedSearchQuery),
  );
  const filteredResources = resourcesInScope.filter(
    (resource) =>
      matchesResourceContent(resource, effectiveContentFilter) &&
      matchesResourceStatus(resource, effectiveStatusFilter) &&
      matchesSearch(getResourceSearchText(resource), normalizedSearchQuery),
  );
  const hasAnyContentInScope =
    rootFolders.length > 0 || resourcesInScope.length > 0;
  const hasVisibleContent =
    filteredFolders.length > 0 || filteredResources.length > 0;
  const hasActiveLocalFilters =
    Boolean(normalizedSearchQuery) ||
    effectiveContentFilter !== "all" ||
    effectiveStatusFilter !== "all";
  const hasActiveFilters =
    hasActiveLocalFilters || (!selectedFolder && activeFilter !== "all");
  const visibleResultCount = filteredFolders.length + filteredResources.length;
  const backHref = buildResourcesHref({
    area: activeFilter,
    content: effectiveContentFilter,
    q: searchQuery,
    status: effectiveStatusFilter,
  });

  function clearLocalFilters() {
    setSearchQuery("");
    setContentFilter("all");
    setStatusFilter("all");
  }

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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {selectedFolder ? (
            <nav
              className="flex flex-wrap items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-muted"
              aria-label="Ruta de recursos"
            >
              <Link href={backHref} className="hover:text-primary-hover">
                Recursos
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <span className="min-w-0 truncate">{selectedFolder.name}</span>
            </nav>
          ) : (
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
              Biblioteca de materiales
            </p>
          )}
          <h2 className="mt-2 break-words text-3xl font-semibold text-charcoal">
            {selectedFolder ? selectedFolder.name : "Recursos disponibles"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {selectedFolder
              ? selectedFolder.description ||
                "Documentos y enlaces dentro de esta carpeta."
              : canManage
                ? "Carpetas, PDFs y enlaces visibles segun area, tipo y estado."
                : "Abre los materiales compartidos para acompanar tu plan."}
          </p>
        </div>

        {selectedFolder ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={backHref}>
                <ArrowLeft className="size-4" aria-hidden="true" />
                Volver a Recursos
              </Link>
            </Button>
            {canManage ? (
              <Button
                type="button"
                onClick={() =>
                  formRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              >
                <Plus className="size-4" aria-hidden="true" />
                Agregar recurso
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5 rounded-[22px] border border-border bg-background p-4">
        <div>
          <Label htmlFor="resource-library-search" className="sr-only">
            Buscar recursos
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              id="resource-library-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar por titulo, carpeta, tipo o area"
              className="h-12 rounded-control border-border bg-surface pl-11 pr-4 text-charcoal shadow-soft"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {!selectedFolder ? (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
                <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                Area
              </p>
              <div className="flex flex-wrap gap-2">
                {visibleAreaFilters.map((filter) => {
                  const href = buildResourcesHref({
                    area: filter.value,
                    content: effectiveContentFilter,
                    q: searchQuery,
                    status: effectiveStatusFilter,
                  });

                  return (
                    <Button
                      key={filter.value}
                      asChild
                      size="sm"
                      variant={
                        activeFilter === filter.value ? "default" : "outline"
                      }
                    >
                      <Link
                        href={href}
                        aria-current={
                          activeFilter === filter.value ? "page" : undefined
                        }
                      >
                        {filter.label}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
                Area
              </p>
              <span className="inline-flex min-h-9 items-center gap-1.5 rounded-control border border-border bg-surface px-3 text-sm font-bold text-charcoal shadow-soft">
                {getAreaLabel(selectedFolder.area)}
              </span>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
              Tipo
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleContentFilters.map((filter) => (
                <Button
                  key={filter.value}
                  type="button"
                  size="sm"
                  variant={
                    effectiveContentFilter === filter.value
                      ? "default"
                      : "outline"
                  }
                  onClick={() => setContentFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {canManage ? (
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
                Estado
              </p>
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((filter) => (
                  <Button
                    key={filter.value}
                    type="button"
                    size="sm"
                    variant={
                      effectiveStatusFilter === filter.value
                        ? "default"
                        : "outline"
                    }
                    onClick={() => setStatusFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-sm font-semibold text-muted">
            {hasVisibleContent
              ? `${visibleResultCount} resultado${visibleResultCount === 1 ? "" : "s"}`
              : hasActiveFilters
                ? "Sin resultados con los filtros actuales"
                : "Biblioteca sin materiales visibles"}
          </p>
          {hasActiveLocalFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearLocalFilters}
            >
              <X className="size-4" aria-hidden="true" />
              Limpiar filtros
            </Button>
          ) : null}
        </div>
      </div>

      {selectedFolder ? (
        filteredResources.length > 0 ? (
          <section className="mt-6" aria-labelledby="folder-resources-title">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3
                  id="folder-resources-title"
                  className="text-lg font-extrabold text-charcoal"
                >
                  Documentos de la carpeta
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Solo se muestran recursos dentro de esta carpeta.
                </p>
              </div>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-extrabold text-charcoal">
                {filteredResources.length} recurso
                {filteredResources.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  canManage={
                    canManage && manageableAreas.includes(resource.area)
                  }
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
          </section>
        ) : hasActiveLocalFilters ? (
          <div className="mt-6 rounded-[22px] border border-dashed border-border bg-background px-5 py-12 text-center">
            <p className="font-extrabold text-charcoal">
              No encontramos recursos con esos filtros.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Prueba con otra busqueda o limpia los filtros.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-[22px] border border-dashed border-border bg-background px-5 py-12 text-center">
            <p className="font-extrabold text-charcoal">
              Esta carpeta todavia no tiene documentos.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {canManage
                ? "Agrega un PDF o enlace para empezar."
                : "Cuando haya recursos activos apareceran aqui."}
            </p>
          </div>
        )
      ) : hasVisibleContent ? (
        <div className="mt-6 space-y-7">
          {filteredFolders.length > 0 ? (
            <section aria-labelledby="resource-folders-title">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3
                    id="resource-folders-title"
                    className="text-lg font-extrabold text-charcoal"
                  >
                    Carpetas
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    Organizacion principal de la biblioteca.
                  </p>
                </div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-extrabold text-charcoal">
                  {filteredFolders.length} carpeta
                  {filteredFolders.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {filteredFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    activeFilter={activeFilter}
                    canManage={
                      canManage && manageableAreas.includes(folder.area)
                    }
                    contentFilter={effectiveContentFilter}
                    folder={folder}
                    onDelete={(selected) =>
                      setConfirmation({ folder: selected, type: "delete-folder" })
                    }
                    onEdit={setEditingFolder}
                    onToggleActive={(selected) =>
                      setConfirmation({ folder: selected, type: "toggle-folder" })
                    }
                    searchQuery={searchQuery}
                    statusFilter={effectiveStatusFilter}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {filteredResources.length > 0 ? (
            <section aria-labelledby="root-resources-title">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3
                    id="root-resources-title"
                    className="text-lg font-extrabold text-charcoal"
                  >
                    Recursos sin carpeta
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    PDFs y enlaces disponibles en el nivel principal.
                  </p>
                </div>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold text-charcoal">
                  {filteredResources.length} recurso
                  {filteredResources.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    canManage={
                      canManage && manageableAreas.includes(resource.area)
                    }
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
            </section>
          ) : null}
        </div>
      ) : hasAnyContentInScope || hasActiveFilters ? (
        <div className="mt-6 rounded-[22px] border border-dashed border-border bg-background px-5 py-12 text-center">
          <p className="font-extrabold text-charcoal">
            No encontramos recursos con esos filtros.
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Prueba con otra busqueda, cambia el tipo o vuelve a Todos.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-[22px] border border-dashed border-border bg-background px-5 py-12 text-center">
          <p className="font-extrabold text-charcoal">
            {emptyMessage ?? "Todavia no hay recursos disponibles."}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {emptyHint ??
              (canManage
                ? "Crea una carpeta, sube un PDF o agrega un enlace."
                : "Tu profesional asignado puede compartir recursos contigo.")}
          </p>
          {canManage ? (
            <div className="mt-5 flex justify-center">
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  formRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              >
                <Plus className="size-4" aria-hidden="true" />
                Crear recurso
              </Button>
            </div>
          ) : null}
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
            key={
              editingExternalResource?.id ??
              `new-external-${selectedFolder?.id ?? "root"}`
            }
            editingResource={editingExternalResource}
            formRef={formRef}
            folders={folders}
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
            selectedFolder={selectedFolder}
          />
        )}

        <PdfUploadForm
          key={`pdf-upload-${selectedFolder?.id ?? "root"}`}
          folders={folders}
          manageableAreas={manageableAreas}
          selectedFolder={selectedFolder}
        />
        <FolderManager
          editingFolder={editingFolder}
          folders={folders}
          manageableAreas={manageableAreas}
          onDelete={(folder) =>
            setConfirmation({ folder, type: "delete-folder" })
          }
          onEditingFolderChange={setEditingFolder}
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
