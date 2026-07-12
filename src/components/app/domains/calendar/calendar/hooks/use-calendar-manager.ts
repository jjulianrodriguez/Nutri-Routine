"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import {
 createCalendarEvent,
 deleteCalendarEvent,
 updateCalendarEvent,
} from "@/lib/actions/calendar";
import type {
 CalendarEventItem,
 CalendarFilters as CalendarFilterValues,
 CalendarPageData,
} from "@/lib/calendar/types";
import {
 calendarEventValuesSchema,
 type CalendarEventValues,
} from "@/lib/validations/calendar";

import {
 buildCalendarHref,
 buildMonthDays,
 defaultFormValues,
 eventToFormValues,
 formatMonthKeyFromDateKey,
 formatMonthLabel,
 professionalAllowsArea,
 toDateKey,
} from "../calendar-utils";

export function useCalendarManager(data: CalendarPageData) {
 const router = useRouter();
 const [selectedDate, setSelectedDate] = useState(data.defaultSelectedDate);
 const [selectedEventId, setSelectedEventId] = useState(
 data.events[0]?.id ?? "",
 );
 const [editingEvent, setEditingEvent] = useState<CalendarEventItem | null>(
 null,
 );
 const [formOpen, setFormOpen] = useState(false);
 const [serverMessage, setServerMessage] = useState("");
 const [deleteTarget, setDeleteTarget] = useState<CalendarEventItem | null>(
 null,
 );
 const form = useForm<CalendarEventValues>({
 defaultValues: defaultFormValues({ data, date: data.defaultSelectedDate }),
 resolver: zodResolver(calendarEventValuesSchema),
 });
 const {
 clearErrors,
 control,
 reset,
 setError,
 setValue,
 } = form;
 const selectedClientId = useWatch({ control, name: "clientId" });
 const selectedArea = useWatch({ control, name: "area" });
 const selectedProfessionalId = useWatch({ control, name: "professionalId" });
 const days = useMemo(() => buildMonthDays(data.monthKey), [data.monthKey]);
 const eventsByDate = useMemo(() => {
 const grouped = new Map<string, CalendarEventItem[]>();

 data.events.forEach((event) => {
 const dayEvents = grouped.get(event.dateKey) ?? [];
 dayEvents.push(event);
 grouped.set(event.dateKey, dayEvents);
 });

 return grouped;
 }, [data.events]);
 const activeSelectedDate = selectedDate.startsWith(`${data.monthKey}-`)
 ? selectedDate
 : data.defaultSelectedDate;
 const selectedDayEvents = eventsByDate.get(activeSelectedDate) ?? [];
 const selectedEvent =
 data.events.find((event) => event.id === selectedEventId) ??
 selectedDayEvents[0] ??
 null;
 const selectedClient = useMemo(
 () => data.clientOptions.find((client) => client.id === selectedClientId),
 [data.clientOptions, selectedClientId],
 );
 const areaOptions = useMemo(() => {
 const allowedAreas = data.manageableAreas.filter((area) =>
 selectedClient ? selectedClient.availableAreas.includes(area) : true,
 );

 return allowedAreas.length > 0 ? allowedAreas : data.manageableAreas;
 }, [data.manageableAreas, selectedClient]);
 const professionalOptions = useMemo(
 () =>
 data.professionalOptions.filter((professional) =>
 professionalAllowsArea(professional, selectedArea),
 ),
 [data.professionalOptions, selectedArea],
 );
 const canCreate = data.canManageEvents && data.clientOptions.length > 0;
 const timeFormat = data.timeFormat;
 const monthLabel = formatMonthLabel(data.monthKey);
 const todayKey = toDateKey(new Date());
 const todayMonthKey = formatMonthKeyFromDateKey(todayKey);
 const selectedIsToday = activeSelectedDate === todayKey;

 useEffect(() => {
 if (areaOptions.length > 0 && !areaOptions.includes(selectedArea)) {
 setValue("area", areaOptions[0], { shouldValidate: true });
 }
 }, [areaOptions, selectedArea, setValue]);

 useEffect(() => {
 if (!data.isAdmin || professionalOptions.length === 0) {
 return;
 }

 const selectedProfessional = professionalOptions.some(
 (professional) => professional.id === selectedProfessionalId,
 );

 if (!selectedProfessional) {
 setValue("professionalId", professionalOptions[0].id, {
 shouldValidate: true,
 });
 }
 }, [data.isAdmin, professionalOptions, selectedProfessionalId, setValue]);

 function pushFilters(overrides: Partial<CalendarFilterValues>) {
 router.push(buildCalendarHref(data.filters, overrides));
 }

 function clearForm() {
 setEditingEvent(null);
 setServerMessage("");
 clearErrors();
 reset(defaultFormValues({ data, date: activeSelectedDate }));
 }

 function startCreating(dateKey = activeSelectedDate) {
 setSelectedDate(dateKey);
 setFormOpen(true);
 setEditingEvent(null);
 setServerMessage("");
 clearErrors();
 reset(defaultFormValues({ data, date: dateKey }));
 }

 function startEditing(event: CalendarEventItem) {
 setSelectedDate(event.dateKey);
 setSelectedEventId(event.id);
 setFormOpen(true);
 setEditingEvent(event);
 setServerMessage("");
 clearErrors();
 reset(eventToFormValues(event));
 }

 function canEditEvent(event: CalendarEventItem) {
 return data.isAdmin || event.professionalId === data.currentUserId;
 }

 const onSubmit: SubmitHandler<CalendarEventValues> = async (values) => {
 setServerMessage("");
 clearErrors("root");

 const result = editingEvent
 ? await updateCalendarEvent({ ...values, id: editingEvent.id })
 : await createCalendarEvent(values);

 if (result.status === "error") {
 if (result.fieldErrors) {
 Object.entries(result.fieldErrors).forEach(([field, message]) => {
 if (message) {
 setError(field as keyof CalendarEventValues, { message });
 }
 });
 }

 setServerMessage(result.message);
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 if (result.id) {
 setSelectedEventId(result.id);
 }
 setSelectedDate(values.date);
 setFormOpen(false);
 clearForm();
 router.refresh();
 };

 async function updateEventStatus(
 event: CalendarEventItem,
 status: CalendarEventItem["status"],
 ) {
 const result = await updateCalendarEvent({
 ...eventToFormValues(event),
 id: event.id,
 status,
 });

 if (result.status === "error") {
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 setSelectedEventId(event.id);
 router.refresh();
 }

 async function confirmDelete() {
 if (!deleteTarget) {
 return;
 }

 const result = await deleteCalendarEvent(deleteTarget.id);

 if (result.status === "error") {
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 setSelectedEventId("");
 if (editingEvent?.id === deleteTarget.id) {
 clearForm();
 setFormOpen(false);
 }
 router.refresh();
 }

 function handleFormOpenChange(open: boolean) {
 setFormOpen(open);
 if (!open) {
 clearForm();
 }
 }

 function selectDate(dateKey: string) {
 const dayEvents = eventsByDate.get(dateKey) ?? [];
 setSelectedDate(dateKey);
 setSelectedEventId(dayEvents[0]?.id ?? "");
 }

 function selectEvent(dateKey: string, eventId: string) {
 setSelectedDate(dateKey);
 setSelectedEventId(eventId);
 }

 function selectToday() {
 selectDate(todayKey);
 }

 function openEvent(event: CalendarEventItem) {
 setSelectedEventId(event.id);
 }

 function openUpcomingEvent(event: CalendarEventItem) {
 setSelectedDate(event.dateKey);
 setSelectedEventId(event.id);

 if (formatMonthKeyFromDateKey(event.dateKey) !== data.monthKey) {
 router.push(
 buildCalendarHref(data.filters, {
 month: formatMonthKeyFromDateKey(event.dateKey),
 }),
 );
 }
 }

 return {
 activeSelectedDate,
 areaOptions,
 canCreate,
 canEditEvent,
 confirmDelete,
 data,
 days,
 deleteTarget,
 editingEvent,
 eventsByDate,
 form,
 formOpen,
 handleFormOpenChange,
 monthLabel,
 onSubmit,
 openEvent,
 openUpcomingEvent,
 professionalOptions,
 pushFilters,
 selectDate,
 selectEvent,
 selectToday,
 selectedDayEvents,
 selectedEvent,
 selectedIsToday,
 setDeleteTarget,
 startCreating,
 startEditing,
 timeFormat,
 todayMonthKey,
 updateEventStatus,
 serverMessage,
 };
}