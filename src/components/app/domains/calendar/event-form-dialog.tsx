"use client";

import { Loader2, Trash2, X } from "lucide-react";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/actions/button";
import { FormAlert, FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import { Textarea } from "@/components/ui/forms/textarea";
import {
 AppDialog,
 AppDialogContent,
 AppDialogOverlay,
 AppDialogPortal,
} from "@/components/ui/overlays/app-dialog";
import {
 AREA_LABELS,
 CALENDAR_EVENT_TYPES,
 EVENT_TYPE_LABELS,
 STATUS_LABELS,
} from "@/lib/calendar/constants";
import type {
 CalendarArea,
 CalendarEventItem,
 CalendarPageData,
 CalendarProfessionalOption,
} from "@/lib/calendar/types";
import type { CalendarEventValues } from "@/lib/validations/calendar";
import { cn } from "@/lib/utils";

type EventFormDialogProps = {
 areaOptions: CalendarArea[];
 data: CalendarPageData;
 editingEvent: CalendarEventItem | null;
 form: UseFormReturn<CalendarEventValues>;
 onDelete: (event: CalendarEventItem) => void;
 onOpenChange: (open: boolean) => void;
 onSubmit: SubmitHandler<CalendarEventValues>;
 open: boolean;
 professionalOptions: CalendarProfessionalOption[];
 serverMessage: string;
};

export function EventFormDialog({
 areaOptions,
 data,
 editingEvent,
 form,
 onDelete,
 onOpenChange,
 onSubmit,
 open,
 professionalOptions,
 serverMessage,
}: EventFormDialogProps) {
 if (!open) {
 return null;
 }

 const {
 formState: { errors, isSubmitting },
 handleSubmit,
 register,
 } = form;

 return (
 <AppDialog open={open} onOpenChange={onOpenChange}>
 <AppDialogPortal>
 <AppDialogOverlay
 className={cn(
 "fixed inset-0 z-[140] bg-foreground/45 backdrop-blur-[2px]",
 "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
 "data-[state=open]:animate-in data-[state=open]:fade-in-0",
 )}
 />
 <AppDialogContent asChild>
 <section
 className={cn(
 "fixed inset-x-0 bottom-0 z-[150] max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface p-5 focus-visible:outline-none sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[calc(100%-2rem)] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px] sm:p-6",
 "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 sm:data-[state=closed]:zoom-out-95",
 "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 sm:data-[state=open]:zoom-in-95",
 )}
 >
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 {editingEvent ? "Edición" : "Nuevo evento"}
 </p>
 <h2 className="mt-2 text-2xl font-bold text-foreground">
 {editingEvent ? "Editar evento" : "Crear evento"}
 </h2>
 </div>
 <Button
 type="button"
 variant="ghost"
 size="icon-sm"
 onClick={() => onOpenChange(false)}
 aria-label="Cerrar formulario"
 >
 <X className="size-4" aria-hidden="true" />
 </Button>
 </div>

 <FormAlert className="mt-5" message={serverMessage} />

 <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
 <FormField
 controlId="calendar-title"
 error={errors.title?.message}
 errorId="calendar-title-error"
 label="Titulo"
 >
 <Input
 maxLength={180}
 aria-invalid={Boolean(errors.title)}
 {...register("title")}
 />
 </FormField>

 <div className="grid gap-4 sm:grid-cols-2">
 <FormField
 controlId="calendar-event-type"
 hint="Los cambios del calendario se reflejan en notificaciones si la persona tiene activos los avisos de citas y recordatorios."
 hintClassName="text-xs font-semibold leading-5"
 label="Tipo"
 >
 <Select {...register("eventType")}>
 {CALENDAR_EVENT_TYPES.map((eventType) => (
 <option key={eventType} value={eventType}>
 {EVENT_TYPE_LABELS[eventType]}
 </option>
 ))}
 </Select>
 </FormField>

 <FormField
 controlId="calendar-status"
 hint="Programado: activo. Completado: ya atendido. Cancelado: anulado y guardado como referencia."
 hintClassName="text-xs font-semibold leading-5"
 label="Estado"
 >
 <Select {...register("status")}>
 {Object.entries(STATUS_LABELS).map(([value, label]) => (
 <option key={value} value={value}>
 {label}
 </option>
 ))}
 </Select>
 </FormField>
 </div>

 <FormField
 controlId="calendar-client"
 error={errors.clientId?.message}
 errorId="calendar-client-error"
 label="Cliente relacionado"
 >
 <Select
 aria-invalid={Boolean(errors.clientId)}
 {...register("clientId")}
 >
 <option value="">Selecciona cliente</option>
 {data.clientOptions.map((client) => (
 <option key={client.id} value={client.id}>
 {client.fullName}
 {client.email ? ` - ${client.email}` : ""} - {client.serviceSummary}
 </option>
 ))}
 </Select>
 </FormField>

 {data.isAdmin ? (
 <FormField
 controlId="calendar-professional"
 error={errors.professionalId?.message}
 errorId="calendar-professional-error"
 label="Profesional"
 >
 <Select
 aria-invalid={Boolean(errors.professionalId)}
 {...register("professionalId")}
 >
 <option value="">Selecciona profesional</option>
 {professionalOptions.map((professional) => (
 <option key={professional.id} value={professional.id}>
 {professional.fullName}
 </option>
 ))}
 </Select>
 </FormField>
 ) : (
 <Input type="hidden" {...register("professionalId")} />
 )}

 <div className="grid gap-4 sm:grid-cols-3">
 <FormField
 controlId="calendar-date"
 error={errors.date?.message}
 errorId="calendar-date-error"
 label="Dia"
 >
 <Input
 type="date"
 aria-invalid={Boolean(errors.date)}
 {...register("date")}
 />
 </FormField>
 <FormField
 controlId="calendar-start-time"
 error={errors.startTime?.message}
 errorId="calendar-start-time-error"
 label="Hora"
 >
 <Input
 type="time"
 aria-invalid={Boolean(errors.startTime)}
 {...register("startTime")}
 />
 </FormField>
 <FormField
 controlId="calendar-end-time"
 error={errors.endTime?.message}
 errorId="calendar-end-time-error"
 label="Final opcional"
 >
 <Input
 type="time"
 aria-invalid={Boolean(errors.endTime)}
 {...register("endTime")}
 />
 </FormField>
 </div>

 <FormField
 controlId="calendar-area"
 error={errors.area?.message}
 errorId="calendar-area-error"
 label="Área"
 >
 <Select
 aria-invalid={Boolean(errors.area)}
 {...register("area")}
 >
 {areaOptions.map((area) => (
 <option key={area} value={area}>
 {AREA_LABELS[area]}
 </option>
 ))}
 </Select>
 </FormField>

 <FormField
 controlId="calendar-description"
 error={errors.description?.message}
 errorId="calendar-description-error"
 label="Descripción de texto"
 >
 <Textarea
 rows={4}
 maxLength={2000}
 aria-invalid={Boolean(errors.description)}
 {...register("description")}
 />
 </FormField>

 <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
 {editingEvent ? (
 <Button type="button" variant="destructive" onClick={() => onDelete(editingEvent)}>
 <Trash2 className="size-4" aria-hidden="true" />
 Eliminar
 </Button>
 ) : (
 <span />
 )}
 <Button type="submit" disabled={isSubmitting}>
 {isSubmitting ? (
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 ) : null}
 {editingEvent ? "Guardar cambios" : "Crear evento"}
 </Button>
 </div>
 </form>
 </section>
 </AppDialogContent>
 </AppDialogPortal>
 </AppDialog>
 );
}
