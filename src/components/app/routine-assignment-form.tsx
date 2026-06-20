"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarPlus,
  CheckCircle2,
  Layers3,
  Loader2,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  AssignmentEntitySelector,
  ClientSearchCard,
  WorkoutTemplateSearchCard,
} from "@/components/app/assignment-entity-selector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProgressiveResults } from "@/hooks/use-progressive-results";
import { assignWorkoutTemplateToClient } from "@/lib/actions/workout-templates";
import {
  workoutTemplateAssignmentSchema,
  type WorkoutTemplateAssignmentFormValues,
} from "@/lib/validations/workout-templates";
import { cn } from "@/lib/utils";
import type {
  AssignableTrainingClient,
} from "@/types/routine";
import type { AssignableWorkoutTemplate } from "@/types/workout-template";

const inputClasses =
  "mt-2 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft focus-visible:ring-primary/20";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

export function WorkoutTemplateAssignmentForm({
  clients,
  defaultClientId = "",
  defaultTemplateId = "",
  defaultStartDate,
  templates,
}: {
  clients: AssignableTrainingClient[];
  defaultClientId?: string;
  defaultTemplateId?: string;
  defaultStartDate: string;
  templates: AssignableWorkoutTemplate[];
}) {
  const router = useRouter();
  const [clientQuery, setClientQuery] = useState("");
  const [templateQuery, setTemplateQuery] = useState("");
  const [pendingReplacement, setPendingReplacement] = useState<{
    client: AssignableTrainingClient;
    values: WorkoutTemplateAssignmentFormValues;
  } | null>(null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<WorkoutTemplateAssignmentFormValues>({
    defaultValues: {
      clientId: defaultClientId,
      durationWeeks: "6",
      startDate: defaultStartDate,
      templateId: defaultTemplateId,
    },
    resolver: zodResolver(workoutTemplateAssignmentSchema),
  });
  const selectedClientId = useWatch({ control, name: "clientId" });
  const selectedTemplateId = useWatch({ control, name: "templateId" });
  const selectedDurationWeeks = useWatch({
    control,
    name: "durationWeeks",
  });
  const selectedStartDate = useWatch({ control, name: "startDate" });
  const selectedClient = clients.find(
    (client) => client.id === selectedClientId,
  );
  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId,
  );
  const missingAssignmentReasons = [
    !selectedClient ? "Falta seleccionar cliente." : null,
    !selectedTemplate ? "Falta seleccionar plantilla." : null,
    !selectedStartDate?.trim() ? "Falta fecha de inicio." : null,
    !selectedDurationWeeks?.trim() ? "Falta duracion." : null,
  ].filter(Boolean) as string[];
  const filteredClients = useMemo(() => {
    const query = normalizeSearch(clientQuery.trim());

    if (!query) {
      return clients;
    }

    return clients.filter((client) =>
      normalizeSearch(
        [
          client.name,
          client.contact,
          client.assignedTrainerName,
          client.trainingPlanStatus,
          client.currentAssignment?.title,
          client.id,
        ]
          .filter(Boolean)
          .join(" "),
      ).includes(query),
    );
  }, [clientQuery, clients]);
  const filteredTemplates = useMemo(() => {
    const query = normalizeSearch(templateQuery.trim());

    if (!query) {
      return templates;
    }

    return templates.filter((template) =>
      normalizeSearch(
        [
          template.name,
          template.description,
          template.identifier,
          template.cycleDays,
        ]
          .filter(Boolean)
          .join(" "),
      ).includes(query),
    );
  }, [templateQuery, templates]);
  const clientResults = useProgressiveResults(filteredClients, 5);
  const templateResults = useProgressiveResults(filteredTemplates, 5);

  function updateClientQuery(value: string) {
    setClientQuery(value);
    clientResults.reset();
  }

  function updateTemplateQuery(value: string) {
    setTemplateQuery(value);
    templateResults.reset();
  }

  function toggleClient(clientId: string) {
    setValue(
      "clientId",
      clientId === selectedClientId ? "" : clientId,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  function toggleTemplate(templateId: string) {
    setValue(
      "templateId",
      templateId === selectedTemplateId ? "" : templateId,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  async function assignTemplate(
    values: WorkoutTemplateAssignmentFormValues,
  ) {
    const result = await assignWorkoutTemplateToClient(values);

    if (result.status === "error") {
      setError("root", { message: result.message });
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    reset({
      clientId: "",
      durationWeeks: values.durationWeeks,
      startDate: values.startDate,
      templateId: values.templateId,
    });
    router.refresh();
  }

  async function onSubmit(values: WorkoutTemplateAssignmentFormValues) {
    const client = clients.find((item) => item.id === values.clientId);

    if (client?.currentAssignment) {
      setPendingReplacement({ client, values });
      return;
    }

    await assignTemplate(values);
  }

  async function confirmReplacement() {
    if (pendingReplacement) {
      await assignTemplate(pendingReplacement.values);
    }
  }
  const replacementTemplate = pendingReplacement
    ? templates.find(
        (template) => template.id === pendingReplacement.values.templateId,
      )
    : null;

  if (clients.length === 0) {
    return (
      <Alert className="rounded-[18px] border-border bg-background px-4 py-3">
        <AlertDescription className="space-y-1 font-semibold text-muted">
          <p>No hay clientes con plan de entrenamiento activo.</p>
          <p>
            Activa el plan de entrenamiento de un cliente antes de asignarle
            una plantilla.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  if (templates.length === 0) {
    return (
      <Alert className="rounded-[18px] border-border bg-background px-4 py-3">
        <AlertDescription className="font-semibold text-muted">
          No hay plantillas activas disponibles para asignar.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <input type="hidden" {...register("clientId")} />
      <input type="hidden" {...register("templateId")} />

      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <AssignmentEntitySelector
          id="assignment-client-search"
          label="1. Selecciona un cliente"
          query={clientQuery}
          onQueryChange={updateClientQuery}
          resultCount={filteredClients.length}
          totalCount={clients.length}
          visibleCount={clientResults.visibleItems.length}
          searchPlaceholder="Buscar por nombre, contacto o plan..."
          emptyMessage="No encontramos clientes que coincidan con la busqueda."
          error={errors.clientId?.message}
          isLoading={clientResults.isLoading}
          loadMoreLabel="Cargar mas clientes"
          onLoadMore={clientResults.loadMore}
        >
          {clientResults.visibleItems.map((client) => (
            <ClientSearchCard
              key={client.id}
              client={client}
              selected={client.id === selectedClientId}
              onSelect={toggleClient}
            />
          ))}
        </AssignmentEntitySelector>

        <AssignmentEntitySelector
          id="assignment-template-search"
          label="2. Selecciona una plantilla"
          query={templateQuery}
          onQueryChange={updateTemplateQuery}
          resultCount={filteredTemplates.length}
          totalCount={templates.length}
          visibleCount={templateResults.visibleItems.length}
          searchPlaceholder="Buscar por nombre, identificador o cantidad de días..."
          emptyMessage="No encontramos plantillas activas que coincidan con la búsqueda."
          error={errors.templateId?.message}
          isLoading={templateResults.isLoading}
          loadMoreLabel="Cargar más plantillas"
          onLoadMore={templateResults.loadMore}
        >
          {templateResults.visibleItems.map((template) => (
            <WorkoutTemplateSearchCard
              key={template.id}
              template={template}
              selected={template.id === selectedTemplateId}
              onSelect={toggleTemplate}
            />
          ))}
        </AssignmentEntitySelector>
      </div>

      <section className="rounded-[24px] border border-charcoal/10 bg-surface p-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-5 text-warm-brown" aria-hidden="true" />
          <h2 className="font-extrabold text-charcoal">
            Seleccion para asignar
          </h2>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <SelectedEntity
            icon={UserRound}
            label="Cliente"
            selected={Boolean(selectedClient)}
            value={selectedClient?.name ?? "Selecciona un cliente"}
            detail={
              selectedClient
                ? `Entrenamiento activo / ${selectedClient.assignedTrainerName ?? "Profesional en entrenamiento"}`
                : "Usa el buscador de clientes"
            }
          />
          <SelectedEntity
            icon={Layers3}
            label="Plantilla"
            selected={Boolean(selectedTemplate)}
            value={selectedTemplate?.name ?? "Selecciona una plantilla"}
            detail={
              selectedTemplate
                ? [
                    `Ciclo de ${selectedTemplate.cycleDays} días`,
                    selectedTemplate.identifier
                      ? `ID: ${selectedTemplate.identifier}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "Usa el buscador de plantillas"
            }
          />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(8rem,0.55fr)_minmax(10rem,0.65fr)_auto] xl:items-end">
        <div>
          <Label
            htmlFor="assignment-duration"
            className="font-extrabold text-charcoal"
          >
            Duracion
          </Label>
          <div className="relative">
            <Input
              id="assignment-duration"
              type="number"
              min="1"
              max="104"
              inputMode="numeric"
              className={`${inputClasses} pr-20`}
              aria-invalid={Boolean(errors.durationWeeks)}
              {...register("durationWeeks")}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 translate-y-0.5 text-xs font-bold text-muted">
              semanas
            </span>
          </div>
          {errors.durationWeeks ? (
            <p className="mt-2 text-sm font-semibold text-danger" role="alert">
              {errors.durationWeeks.message}
            </p>
          ) : null}
        </div>

        <div>
          <Label
            htmlFor="assignment-start-date"
            className="font-extrabold text-charcoal"
          >
            Fecha de inicio
          </Label>
          <Input
            id="assignment-start-date"
            type="date"
            className={inputClasses}
            aria-invalid={Boolean(errors.startDate)}
            {...register("startDate")}
          />
          {errors.startDate ? (
            <p className="mt-2 text-sm font-semibold text-danger" role="alert">
              {errors.startDate.message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || missingAssignmentReasons.length > 0}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <CalendarPlus aria-hidden="true" />
          )}
          {isSubmitting ? "Asignando..." : "Confirmar asignacion"}
        </Button>
      </div>

      {missingAssignmentReasons.length > 0 ? (
        <Alert className="rounded-[18px] border-primary/40 bg-primary-soft/45 px-4 py-3">
          <TriangleAlert
            className="size-5 text-warm-brown"
            aria-hidden="true"
          />
          <AlertDescription className="font-semibold leading-6 text-charcoal">
            Para confirmar la asignacion:{" "}
            {missingAssignmentReasons.join(" ")}
          </AlertDescription>
        </Alert>
      ) : null}

      {errors.root?.message ? (
        <Alert
          variant="destructive"
          className="rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3"
        >
          <AlertDescription className="font-semibold text-danger">
            {errors.root.message}
          </AlertDescription>
        </Alert>
      ) : null}

      <ConfirmationDialog
        open={Boolean(pendingReplacement)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingReplacement(null);
          }
        }}
        title="Reemplazar plantilla activa"
        description={
          pendingReplacement
            ? `${pendingReplacement.client.name} tiene "${pendingReplacement.client.currentAssignment?.title}" como plantilla actual. Se archivara en su historial y se reemplazara por "${replacementTemplate?.name ?? "la nueva plantilla"}" desde ${pendingReplacement.values.startDate}.`
            : ""
        }
        confirmLabel="Reemplazar plantilla"
        pendingLabel="Asignando..."
        tone="destructive"
        onConfirm={confirmReplacement}
      />
    </form>
  );
}

function SelectedEntity({
  detail,
  icon: Icon,
  label,
  selected,
  value,
}: {
  detail: string;
  icon: typeof UserRound;
  label: string;
  selected: boolean;
  value: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-start gap-3 rounded-[18px] border p-4",
        selected
          ? "border-primary/70 bg-primary-soft"
          : "border-dashed border-border bg-background",
      )}
    >
      <div
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-full",
          selected
            ? "bg-primary text-charcoal"
            : "bg-stone-soft text-stone-hover",
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
          {label}
        </p>
        <p className="mt-1 truncate font-extrabold text-charcoal">{value}</p>
        <p className="mt-1 truncate text-xs font-semibold text-muted">
          {detail}
        </p>
      </div>
    </div>
  );
}
