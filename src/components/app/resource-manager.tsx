"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dumbbell,
  ExternalLink,
  FileText,
  ImageIcon,
  Layers3,
  Leaf,
  Link2,
  Loader2,
  Pencil,
  PlaySquare,
  Plus,
  Save,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { CardActionsMenu } from "@/components/app/card-actions-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createResource,
  deleteResource,
  updateResource,
} from "@/lib/actions/resources";
import type { MultimediaResource } from "@/lib/resources/data";
import {
  resourceValuesSchema,
  type ResourceValues,
} from "@/lib/validations/resources";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";

type ResourceArea = Enums<"service_area">;
type ResourceFilter = ResourceArea | "all";

type ResourceManagerProps = {
  activeFilter: ResourceFilter;
  canManage: boolean;
  resources: MultimediaResource[];
};

type ResourceConfirmation =
  | {
      resource: MultimediaResource;
      type: "delete";
    }
  | {
      resource: MultimediaResource;
      type: "update";
      values: ResourceValues;
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

function getUrlPresentation(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");
    const pathname = url.pathname.toLowerCase();
    const isVideo =
      hostname.includes("youtube.com") ||
      hostname === "youtu.be" ||
      hostname.includes("vimeo.com") ||
      /\.(mp4|webm|mov)$/.test(pathname);
    const isImage = /\.(avif|gif|jpe?g|png|webp)$/.test(pathname);
    const isDocument = /\.(docx?|pdf|pptx?|xlsx?)$/.test(pathname);

    return {
      domain: hostname,
      icon: isVideo
        ? PlaySquare
        : isImage
          ? ImageIcon
          : isDocument
            ? FileText
            : Link2,
      kind: isVideo
        ? "Video"
        : isImage
          ? "Imagen"
          : isDocument
            ? "Documento"
            : "Enlace externo",
    };
  } catch {
    return {
      domain: "Enlace externo",
      icon: Link2,
      kind: "Recurso",
    };
  }
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

function ResourceCard({
  canManage,
  onDelete,
  onEdit,
  resource,
}: {
  canManage: boolean;
  onDelete: (resource: MultimediaResource) => void;
  onEdit: (resource: MultimediaResource) => void;
  resource: MultimediaResource;
}) {
  const area = AREA_DETAILS[resource.area];
  const AreaIcon = area.icon;
  const presentation = getUrlPresentation(resource.file_url);
  const PreviewIcon = presentation.icon;

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-border bg-background shadow-soft">
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
            {area.label}
          </span>
          <span className="rounded-full bg-charcoal/80 px-3 py-1 text-xs font-bold text-white">
            {presentation.kind}
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
          {presentation.domain}
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
              {
                external: true,
                href: resource.file_url,
                icon: ExternalLink,
                label: "Abrir recurso",
              },
              ...(canManage
                ? [
                    {
                      icon: Pencil,
                      label: "Editar",
                      onSelect: () => onEdit(resource),
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
          {resource.creatorName ? (
            <div>
              <dt className="text-muted">Creador</dt>
              <dd className="mt-1 break-words">{resource.creatorName}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted">Actualizado</dt>
            <dd className="mt-1 tabular-nums">
              {formatDate(resource.updated_at)}
            </dd>
          </div>
        </dl>

      </div>
    </article>
  );
}

export function ResourceManager({
  activeFilter,
  canManage,
  resources,
}: ResourceManagerProps) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [editingResource, setEditingResource] =
    useState<MultimediaResource | null>(null);
  const [confirmation, setConfirmation] =
    useState<ResourceConfirmation | null>(null);
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

  function clearForm() {
    setEditingResource(null);
    setServerMessage("");
    clearErrors();
    reset({
      area: "general",
      description: "",
      title: "",
      url: "",
    });
  }

  function startEditing(resource: MultimediaResource) {
    setEditingResource(resource);
    setServerMessage("");
    clearErrors();
    reset({
      area: resource.area,
      description: resource.description ?? "",
      title: resource.title,
      url: resource.file_url,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveResource(
    values: ResourceValues,
    resource: MultimediaResource | null,
  ) {
    setServerMessage("");
    clearErrors("root");

    const result = resource
      ? await updateResource({ ...values, id: resource.id })
      : await createResource(values);

    if (result.status === "error") {
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          if (message) {
            setError(field as keyof ResourceValues, { message });
          }
        });
      }

      setServerMessage(result.message);
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    clearForm();
    router.refresh();
  }

  async function onSubmit(values: ResourceValues) {
    if (editingResource) {
      setConfirmation({
        resource: editingResource,
        type: "update",
        values,
      });
      return;
    }

    await saveResource(values, null);
  }

  function confirmDelete(resource: MultimediaResource) {
    setConfirmation({ resource, type: "delete" });
  }

  async function removeResource(resource: MultimediaResource) {
    try {
      const result = await deleteResource(resource.id);

      if (result.status === "error") {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        if (editingResource?.id === resource.id) {
          clearForm();
        }
        router.refresh();
      }
    } catch {
      toast.error(
        "Ocurrió un error inesperado al eliminar el recurso. Inténtalo de nuevo.",
      );
    }
  }

  async function confirmAction() {
    if (!confirmation) {
      return;
    }

    if (confirmation.type === "update") {
      await saveResource(confirmation.values, confirmation.resource);
      return;
    }

    await removeResource(confirmation.resource);
  }

  const library = (
    <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
            Biblioteca
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-charcoal">
            Recursos disponibles
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Las tarjetas usan una vista previa segura con el tipo y dominio del
            enlace. Una URL sin portada nunca rompe la biblioteca.
          </p>
        </div>
      </div>

      <nav
        className="mt-5 flex flex-wrap gap-2"
        aria-label="Filtrar recursos por acceso"
      >
        {FILTERS.map((filter) => {
          const href =
            filter.value === "all"
              ? "/app/recursos"
              : `/app/recursos?area=${filter.value}`;

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
                {filter.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      {resources.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              canManage={canManage}
              onDelete={confirmDelete}
              onEdit={startEditing}
              resource={resource}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[22px] border border-dashed border-border bg-background px-5 py-12 text-center">
          <p className="font-extrabold text-charcoal">
            No hay recursos en este filtro.
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {canManage
              ? "Crea el primer recurso o selecciona otra categoria."
              : "Selecciona otra categoria para revisar el contenido disponible."}
          </p>
        </div>
      )}
    </section>
  );

  if (!canManage) {
    return library;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:items-start">
      <div
        ref={formRef}
        className="scroll-mt-6 rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
              {editingResource ? "Edicion" : "Nuevo recurso"}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-charcoal">
              {editingResource ? "Editar recurso" : "Crear recurso"}
            </h2>
          </div>
          {editingResource ? (
            <Button type="button" variant="ghost" onClick={clearForm}>
              <X className="size-4" aria-hidden="true" />
              Cancelar
            </Button>
          ) : null}
        </div>

        <form
          className="mt-6 space-y-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div>
            <Label
              htmlFor="resource-title"
              className="font-extrabold text-charcoal"
            >
              Titulo
            </Label>
            <Input
              id="resource-title"
              className="mt-2 h-12 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft"
              aria-describedby={
                errors.title ? "resource-title-error" : undefined
              }
              aria-invalid={Boolean(errors.title)}
              autoComplete="off"
              maxLength={180}
              {...register("title")}
            />
            <FieldError
              id="resource-title-error"
              message={errors.title?.message}
            />
          </div>

          <div>
            <Label
              htmlFor="resource-description"
              className="font-extrabold text-charcoal"
            >
              Descripcion opcional
            </Label>
            <textarea
              id="resource-description"
              rows={5}
              maxLength={2000}
              className="mt-2 w-full resize-y rounded-[22px] border border-input bg-surface/90 px-4 py-4 text-base leading-7 text-foreground shadow-soft outline-none placeholder:text-muted focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 disabled:opacity-50"
              aria-describedby={
                errors.description
                  ? "resource-description-error"
                  : "resource-description-help"
              }
              aria-invalid={Boolean(errors.description)}
              placeholder="Explica brevemente que encontrara la persona…"
              {...register("description")}
            />
            <p
              id="resource-description-help"
              className="mt-2 text-sm leading-6 text-muted"
            >
              Si queda vacia, la tarjeta mostrara el tipo de acceso.
            </p>
            <FieldError
              id="resource-description-error"
              message={errors.description?.message}
            />
          </div>

          <div>
            <Label
              htmlFor="resource-url"
              className="font-extrabold text-charcoal"
            >
              URL externa
            </Label>
            <Input
              id="resource-url"
              type="url"
              inputMode="url"
              className="mt-2 h-12 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft"
              aria-describedby={[
                "resource-url-help",
                errors.url ? "resource-url-error" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-invalid={Boolean(errors.url)}
              autoComplete="off"
              spellCheck={false}
              maxLength={2048}
              placeholder="https://ejemplo.com/recurso…"
              {...register("url")}
            />
            <p
              id="resource-url-help"
              className="mt-2 text-sm leading-6 text-muted"
            >
              Se acepta HTTP o HTTPS. El recurso se guardara como enlace externo.
            </p>
            <FieldError
              id="resource-url-error"
              message={errors.url?.message}
            />
          </div>

          <fieldset>
            <legend className="text-sm font-extrabold text-charcoal">
              Tipo de acceso
            </legend>
            <div className="mt-3 grid gap-3">
              {(
                ["training", "nutrition", "general"] as ResourceArea[]
              ).map((areaValue) => {
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
            <FieldError
              id="resource-area-error"
              message={errors.area?.message}
            />
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
                <Loader2
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
                Guardando…
              </>
            ) : editingResource ? (
              <>
                <Save className="size-4" aria-hidden="true" />
                Guardar cambios
              </>
            ) : (
              <>
                <Plus className="size-4" aria-hidden="true" />
                Crear recurso
              </>
            )}
          </Button>
        </form>
      </div>

      {library}

      <ConfirmationDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmation(null);
          }
        }}
        title={
          confirmation?.type === "delete"
            ? "Eliminar recurso"
            : "Guardar cambios del recurso"
        }
        description={
          confirmation?.type === "delete"
            ? `Se eliminará definitivamente "${confirmation.resource.title}". Esta acción no se puede deshacer.`
            : confirmation
              ? `Se actualizará "${confirmation.values.title}" con la información del formulario.`
              : ""
        }
        confirmLabel={
          confirmation?.type === "delete"
            ? "Eliminar recurso"
            : "Guardar cambios"
        }
        pendingLabel={
          confirmation?.type === "delete" ? "Eliminando…" : "Guardando…"
        }
        tone={confirmation?.type === "delete" ? "destructive" : "default"}
        onConfirm={confirmAction}
      />
    </div>
  );
}
