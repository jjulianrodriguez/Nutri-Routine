"use client";

import { Loader2, Trash2, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/actions/button";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { FieldError } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Textarea } from "@/components/ui/forms/textarea";
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

import { selectClasses } from "./calendar-utils";

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
 <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
 <DialogPrimitive.Portal>
 <DialogPrimitive.Overlay
 className={cn(
 "fixed inset-0 z-[140] bg-foreground/45 backdrop-blur-[2px]",
 "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
 "data-[state=open]:animate-in data-[state=open]:fade-in-0",
 )}
 />
 <DialogPrimitive.Content asChild>
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

 {serverMessage ? (
 <Alert
 variant="destructive"
 className="mt-5 rounded-[18px] border-danger/20 bg-danger/5"
 >
 <AlertDescription className="font-semibold text-danger">
 {serverMessage}
 </AlertDescription>
 </Alert>
 ) : null}

 <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
 <div>
 <Label htmlFor="calendar-title">Titulo</Label>
 <Input
 id="calendar-title"
 className="mt-2"
 maxLength={180}
 aria-invalid={Boolean(errors.title)}
 aria-describedby={errors.title ? "calendar-title-error" : undefined}
 {...register("title")}
 />
 <FieldError id="calendar-title-error" message={errors.title?.message} />
 </div>

 <div className="grid gap-4 sm:grid-cols-2">
 <div>
 <Label htmlFor="calendar-event-type">Tipo</Label>
 <select
 id="calendar-event-type"
 className={selectClasses}
 {...register("eventType")}
 >
 {CALENDAR_EVENT_TYPES.map((eventType) => (
 <option key={eventType} value={eventType}>
 {EVENT_TYPE_LABELS[eventType]}
 </option>
 ))}
 </select>
 <p className="mt-2 text-xs font-semibold leading-5 text-muted">
 Los cambios del calendario se reflejan en notificaciones si la persona tiene
 activos los avisos de citas y recordatorios.
 </p>
 </div>

 <div>
 <Label htmlFor="calendar-status">Estado</Label>
 <select id="calendar-status" className={selectClasses} {...register("status")}>
 {Object.entries(STATUS_LABELS).map(([value, label]) => (
 <option key={value} value={value}>
 {label}
 </option>
 ))}
 </select>
 <p className="mt-2 text-xs font-semibold leading-5 text-muted">
 Programado: activo. Completado: ya atendido. Cancelado: anulado y guardado
 como referencia.
 </p>
 </div>
 </div>

 <div>
 <Label htmlFor="calendar-client">Cliente relacionado</Label>
 <select
 id="calendar-client"
 className={selectClasses}
 aria-invalid={Boolean(errors.clientId)}
 aria-describedby={errors.clientId ? "calendar-client-error" : undefined}
 {...register("clientId")}
 >
 <option value="">Selecciona cliente</option>
 {data.clientOptions.map((client) => (
 <option key={client.id} value={client.id}>
 {client.fullName}
 {client.email ? ` - ${client.email}` : ""} - {client.serviceSummary}
 </option>
 ))}
 </select>
 <FieldError id="calendar-client-error" message={errors.clientId?.message} />
 </div>

 {data.isAdmin ? (
 <div>
 <Label htmlFor="calendar-professional">Profesional</Label>
 <select
 id="calendar-professional"
 className={selectClasses}
 aria-invalid={Boolean(errors.professionalId)}
 aria-describedby={
 errors.professionalId ? "calendar-professional-error" : undefined
 }
 {...register("professionalId")}
 >
 <option value="">Selecciona profesional</option>
 {professionalOptions.map((professional) => (
 <option key={professional.id} value={professional.id}>
 {professional.fullName}
 </option>
 ))}
 </select>
 <FieldError
 id="calendar-professional-error"
 message={errors.professionalId?.message}
 />
 </div>
 ) : (
 <input type="hidden" {...register("professionalId")} />
 )}

 <div className="grid gap-4 sm:grid-cols-3">
 <div>
 <Label htmlFor="calendar-date">Dia</Label>
 <Input
 id="calendar-date"
 type="date"
 className="mt-2"
 aria-invalid={Boolean(errors.date)}
 aria-describedby={errors.date ? "calendar-date-error" : undefined}
 {...register("date")}
 />
 <FieldError id="calendar-date-error" message={errors.date?.message} />
 </div>
 <div>
 <Label htmlFor="calendar-start-time">Hora</Label>
 <Input
 id="calendar-start-time"
 type="time"
 className="mt-2"
 aria-invalid={Boolean(errors.startTime)}
 aria-describedby={
 errors.startTime ? "calendar-start-time-error" : undefined
 }
 {...register("startTime")}
 />
 <FieldError
 id="calendar-start-time-error"
 message={errors.startTime?.message}
 />
 </div>
 <div>
 <Label htmlFor="calendar-end-time">Final opcional</Label>
 <Input
 id="calendar-end-time"
 type="time"
 className="mt-2"
 aria-invalid={Boolean(errors.endTime)}
 aria-describedby={errors.endTime ? "calendar-end-time-error" : undefined}
 {...register("endTime")}
 />
 <FieldError id="calendar-end-time-error" message={errors.endTime?.message} />
 </div>
 </div>

 <div>
 <Label htmlFor="calendar-area">Área</Label>
 <select
 id="calendar-area"
 className={selectClasses}
 aria-invalid={Boolean(errors.area)}
 aria-describedby={errors.area ? "calendar-area-error" : undefined}
 {...register("area")}
 >
 {areaOptions.map((area) => (
 <option key={area} value={area}>
 {AREA_LABELS[area]}
 </option>
 ))}
 </select>
 <FieldError id="calendar-area-error" message={errors.area?.message} />
 </div>

 <div>
 <Label htmlFor="calendar-description">Descripción de texto</Label>
 <Textarea
 id="calendar-description"
 rows={4}
 maxLength={2000}
 className="mt-2"
 aria-invalid={Boolean(errors.description)}
 aria-describedby={
 errors.description ? "calendar-description-error" : undefined
 }
 {...register("description")}
 />
 <FieldError
 id="calendar-description-error"
 message={errors.description?.message}
 />
 </div>

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
 </DialogPrimitive.Content>
 </DialogPrimitive.Portal>
 </DialogPrimitive.Root>
 );
}