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
} from "@/components/app/domains/clients/assignment-entity-selector";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Button } from "@/components/ui/actions/button";
import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";
import {
 FormAlert,
 FormControl,
 FormField,
} from "@/components/ui/forms/form-field";
import { Input, NumberInput } from "@/components/ui/forms/input";
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

const assignmentSectionClasses =
 "rounded-[24px] bg-surface p-4 sm:p-5 ";

function normalizeSearch(value: string) {
 return value
 .normalize("NFD")
 .replace(/[\u0300-\u036f]/g, "")
 .toLocaleLowerCase("es");
}

export function WorkoutTemplateAssignmentForm({
 clients,
 currentUserId,
 defaultClientId = "",
 defaultTemplateId = "",
 defaultStartDate,
 isAdmin,
 isProfessional,
 templates,
}: {
 clients: AssignableTrainingClient[];
 currentUserId: string;
 defaultClientId?: string;
 defaultTemplateId?: string;
 defaultStartDate: string;
 isAdmin: boolean;
 isProfessional: boolean;
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
 <Alert className="rounded-[18px] bg-background px-4 py-3">
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
 <Alert className="rounded-[18px] bg-background px-4 py-3">
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
 <Input type="hidden" {...register("clientId")} />
 <Input type="hidden" {...register("templateId")} />

 <div className="grid min-w-0 gap-5 xl:grid-cols-2 xl:items-start">
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
 loadMoreLabel="Cargar más clientes"
 onLoadMore={clientResults.loadMore}
 >
 {clientResults.visibleItems.map((client) => (
 <ClientSearchCard
 key={client.id}
 client={client}
 currentUserId={currentUserId}
 isAdmin={isAdmin}
 isProfessional={isProfessional}
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

 <section className={assignmentSectionClasses}>
 <div className="flex items-center gap-2">
 <CheckCircle2 className="size-5 text-muted-foreground" aria-hidden="true" />
 <h2 className="font-extrabold text-foreground">
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
 ? [
 selectedClient.contact ?? "Correo no disponible",
 `Responsable: ${
 selectedClient.assignedTrainerName ??
 "Sin profesional asignado"
 }`,
 ].join(" / ")
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

 <section className={assignmentSectionClasses}>
 <div className="flex items-center gap-2">
 <CalendarPlus className="size-5 text-muted-foreground" aria-hidden="true" />
 <h2 className="font-extrabold text-foreground">
 Fechas de asignación
 </h2>
 </div>

 <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(8rem,0.55fr)_minmax(10rem,0.65fr)_auto] xl:items-end">
 <FormField
 autoControl={false}
 controlId="assignment-duration"
 error={errors.durationWeeks?.message}
 errorId="assignment-duration-error"
 label="Duracion"
 >
 <div className="relative">
 <FormControl>
 <NumberInput
 min="1"
 max="104"
 inputMode="numeric"
 className="pr-20"
 invalid={Boolean(errors.durationWeeks)}
 {...register("durationWeeks")}
 />
 </FormControl>
 <span className="pointer-events-none absolute right-4 top-1/2 translate-y-0.5 text-xs font-bold text-muted">
 semanas
 </span>
 </div>
 </FormField>

 <FormField
 controlId="assignment-start-date"
 error={errors.startDate?.message}
 errorId="assignment-start-date-error"
 label="Fecha de inicio"
 >
 <Input
 type="date"
 invalid={Boolean(errors.startDate)}
 {...register("startDate")}
 />
 </FormField>

 <Button
 type="submit"
 size="lg"
 className="w-full md:col-span-2 xl:col-span-1 xl:w-auto"
 disabled={isSubmitting || missingAssignmentReasons.length > 0}
 >
 {isSubmitting ? (
 <Loader2 className="animate-spin" aria-hidden="true" />
 ) : (
 <CalendarPlus aria-hidden="true" />
 )}
 {isSubmitting ? "Asignando..." : "Confirmar asignación"}
 </Button>
 </div>
 </section>

 <FormAlert
 tone="notice"
 message={missingAssignmentReasons.length > 0 ? (
 <span className="flex items-start gap-3">
 <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
 <span className="leading-6">
 Para confirmar la asignación: {missingAssignmentReasons.join(" ")}
 </span>
 </span>
 ) : null}
 />

 <FormAlert message={errors.root?.message} />

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
 "flex min-w-0 items-start gap-3 rounded-[18px] p-4",
 selected
 ? "border-primary/70 bg-primary-soft"
 : " bg-background",
 )}
 >
 <div
 className={cn(
 "grid size-11 shrink-0 place-items-center rounded-full",
 selected
 ? "bg-primary text-primary-foreground"
 : "bg-surface-muted text-foreground",
 )}
 >
 <Icon className="size-5" aria-hidden="true" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
 {label}
 </p>
 <p className="mt-1 break-words font-extrabold text-foreground">{value}</p>
 <p className="mt-1 break-words text-xs font-semibold leading-5 text-muted">
 {detail}
 </p>
 </div>
 </div>
 );
}
