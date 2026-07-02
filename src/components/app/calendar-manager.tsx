"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  CircleSlash,
  Dumbbell,
  Layers3,
  Leaf,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { RelationshipBadge } from "@/components/app/relationship-badges";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "@/lib/actions/calendar";
import {
  AREA_LABELS,
  CALENDAR_EVENT_TYPES,
  EVENT_TYPE_LABELS,
  STATUS_DESCRIPTIONS,
  STATUS_LABELS,
} from "@/lib/calendar/constants";
import type {
  CalendarArea,
  CalendarEventItem,
  CalendarFilters,
  CalendarPageData,
  CalendarProfessionalOption,
} from "@/lib/calendar/types";
import {
  calendarEventValuesSchema,
  type CalendarEventValues,
} from "@/lib/validations/calendar";
import { formatTimeInputLabel } from "@/lib/user-settings/time";
import type { TimeFormatPreference } from "@/lib/user-settings/types";
import { cn } from "@/lib/utils";

type CalendarManagerProps = {
  data: CalendarPageData;
};

type CalendarDay = {
  dateKey: string;
  dayNumber: number;
  inMonth: boolean;
  isToday: boolean;
};

const WEEKDAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

const AREA_DETAILS: Record<
  CalendarArea,
  { icon: LucideIcon; tone: string }
> = {
  general: {
    icon: Layers3,
    tone: "border-accent/45 bg-accent-soft text-charcoal",
  },
  nutrition: {
    icon: Leaf,
    tone: "border-accent/40 bg-accent-soft/70 text-charcoal",
  },
  training: {
    icon: Dumbbell,
    tone: "border-primary/40 bg-primary-soft text-charcoal",
  },
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

function parseMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);

  return {
    monthIndex: month - 1,
    year,
  };
}

function buildMonthDays(monthKey: string): CalendarDay[] {
  const { monthIndex, year } = parseMonthKey(monthKey);
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
  const start = new Date(year, monthIndex, 1 - leadingDays);
  const todayKey = toDateKey(new Date());

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = toDateKey(date);

    return {
      dateKey,
      dayNumber: date.getDate(),
      inMonth: date.getMonth() === monthIndex,
      isToday: dateKey === todayKey,
    };
  });
}

function formatMonthLabel(monthKey: string) {
  const { monthIndex, year } = parseMonthKey(monthKey);

  return new Intl.DateTimeFormat("es-CR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
}

function formatFullDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "full",
  }).format(new Date(year, month - 1, day));
}

function formatShortDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "short",
    weekday: "short",
  }).format(new Date(year, month - 1, day));
}

function formatMonthKeyFromDateKey(dateKey: string) {
  return dateKey.slice(0, 7);
}

function eventToFormValues(event: CalendarEventItem): CalendarEventValues {
  return {
    area: event.area,
    clientId: event.clientId,
    date: event.dateKey,
    description: event.description ?? "",
    endTime: event.endTime ?? "",
    eventType: event.eventType,
    professionalId: event.professionalId,
    startTime: event.startTime,
    status: event.status,
    title: event.title,
  };
}

function buildCalendarHref(
  filters: CalendarFilters,
  overrides: Partial<CalendarFilters> = {},
) {
  const next = { ...filters, ...overrides };
  const params = new URLSearchParams();

  params.set("month", next.month);

  if (next.clientId) {
    params.set("client", next.clientId);
  }

  if (next.professionalId) {
    params.set("professional", next.professionalId);
  }

  if (next.area !== "all") {
    params.set("area", next.area);
  }

  if (next.status !== "all") {
    params.set("status", next.status);
  }

  return `/app/calendario?${params.toString()}`;
}

function defaultFormValues({
  data,
  date,
}: {
  data: CalendarPageData;
  date: string;
}): CalendarEventValues {
  const client = data.clientOptions[0];
  const area = data.manageableAreas.find((candidate) =>
    client?.availableAreas.includes(candidate),
  ) ?? data.manageableAreas[0] ?? "training";

  return {
    area,
    clientId: client?.id ?? "",
    date,
    description: "",
    endTime: "",
    eventType: "appointment",
    professionalId: data.isAdmin
      ? data.professionalOptions[0]?.id ?? ""
      : data.currentUserId,
    startTime: "09:00",
    status: "scheduled",
    title: "",
  };
}

function professionalAllowsArea(
  professional: CalendarProfessionalOption,
  area: CalendarArea,
) {
  if (professional.specialty === "admin") {
    return true;
  }

  if (area === "general") {
    return professional.specialty === "both";
  }

  return professional.specialty === area || professional.specialty === "both";
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

function EventBadge({ event }: { event: CalendarEventItem }) {
  const area = AREA_DETAILS[event.area];
  const AreaIcon = area.icon;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-extrabold",
        area.tone,
      )}
    >
      <AreaIcon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{AREA_LABELS[event.area]}</span>
    </span>
  );
}

function StatusBadge({ status }: { status: CalendarEventItem["status"] }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-extrabold",
        status === "scheduled" &&
          "border-primary/25 bg-primary-soft text-charcoal",
        status === "completed" &&
          "border-accent/35 bg-accent-soft text-charcoal",
        status === "cancelled" &&
          "border-danger/20 bg-danger/5 text-danger",
      )}
      title={STATUS_DESCRIPTIONS[status]}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function EventSummary({
  event,
  onEdit,
  onOpen,
  timeFormat,
}: {
  event: CalendarEventItem;
  onEdit?: (event: CalendarEventItem) => void;
  onOpen: (event: CalendarEventItem) => void;
  timeFormat: TimeFormatPreference;
}) {
  const isCancelled = event.status === "cancelled";
  const startTime = formatTimeInputLabel(event.startTime, timeFormat);
  const endTime = formatTimeInputLabel(event.endTime, timeFormat);

  return (
    <article
      className={cn(
        "rounded-[22px] border bg-background p-4 shadow-soft",
        isCancelled ? "border-danger/20" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
          onClick={() => onOpen(event)}
        >
          <span className="block truncate text-sm font-extrabold text-warm-brown">
            {startTime}
            {endTime ? ` - ${endTime}` : ""}
          </span>
          <h3 className="mt-1 break-words text-lg font-extrabold text-charcoal">
            {event.title}
          </h3>
        </button>
        {onEdit ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={() => onEdit(event)}
            aria-label={`Editar ${event.title}`}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <EventBadge event={event} />
        <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-extrabold text-warm-brown">
          {EVENT_TYPE_LABELS[event.eventType]}
        </span>
        <StatusBadge status={event.status} />
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">
        <span className="block font-bold text-charcoal">
          {event.clientName}
        </span>
        {event.clientEmail ? (
          <span className="block truncate">{event.clientEmail}</span>
        ) : null}
        {event.professionalName ? (
          <span className="block">Con {event.professionalName}</span>
        ) : null}
      </p>
    </article>
  );
}

function EmptyMonth({
  canCreate,
  onCreate,
}: {
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-border bg-background px-5 py-10 text-center">
      <CalendarDays className="mx-auto size-8 text-warm-brown" aria-hidden="true" />
      <p className="mt-4 font-extrabold text-charcoal">
        Sin eventos este mes
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        Navega a otro mes o crea un evento para un cliente permitido.
      </p>
      {canCreate ? (
        <Button type="button" className="mt-5" onClick={onCreate}>
          <Plus className="size-4" aria-hidden="true" />
          Crear evento
        </Button>
      ) : null}
    </div>
  );
}

function UpcomingEventList({
  events,
  onOpen,
  timeFormat,
}: {
  events: CalendarEventItem[];
  onOpen: (event: CalendarEventItem) => void;
  timeFormat: TimeFormatPreference;
}) {
  const nextEvent = events[0] ?? null;
  const remainingEvents = events.slice(1);

  return (
    <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-full bg-primary-soft text-charcoal">
          <ListChecks className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
            Próximos
          </p>
          <h2 className="text-xl font-bold text-charcoal">
            Consultas y recordatorios
          </h2>
        </div>
      </div>

      {nextEvent ? (
        <>
          <button
            type="button"
            className="mt-5 w-full rounded-[22px] border border-primary/25 bg-primary-soft/70 p-4 text-left shadow-soft transition hover:border-primary/45 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
            onClick={() => onOpen(nextEvent)}
          >
            <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-warm-brown">
              <CalendarClock className="size-4" aria-hidden="true" />
              Próxima consulta o recordatorio
            </span>
            <span className="mt-2 block break-words text-lg font-extrabold text-charcoal">
              {nextEvent.title}
            </span>
            <span className="mt-2 block text-sm font-bold text-muted">
              {formatShortDate(nextEvent.dateKey)} ·{" "}
              {formatTimeInputLabel(nextEvent.startTime, timeFormat)}
            </span>
          </button>

          {remainingEvents.length > 0 ? (
            <div className="mt-3 space-y-3">
              {remainingEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className="w-full rounded-[18px] border border-border bg-background p-4 text-left shadow-soft transition hover:border-primary/45 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
                  onClick={() => onOpen(event)}
                >
                  <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-warm-brown">
                    {formatShortDate(event.dateKey)} ·{" "}
                    {formatTimeInputLabel(event.startTime, timeFormat)}
                  </span>
                  <span className="mt-1 block break-words text-base font-extrabold text-charcoal">
                    {event.title}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-2">
                    <EventBadge event={event} />
                    <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-extrabold text-warm-brown">
                      {EVENT_TYPE_LABELS[event.eventType]}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-5 rounded-[22px] border border-dashed border-border bg-background p-5 text-sm font-semibold leading-6 text-muted">
          No hay eventos programados en los próximos 90 días con los filtros
          actuales.
        </div>
      )}
    </section>
  );
}

export function CalendarManager({ data }: CalendarManagerProps) {
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
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<CalendarEventValues>({
    defaultValues: defaultFormValues({ data, date: data.defaultSelectedDate }),
    resolver: zodResolver(calendarEventValuesSchema),
  });
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
  const selectedClient = data.clientOptions.find(
    (client) => client.id === selectedClientId,
  );
  const allowedAreas = data.manageableAreas.filter((area) =>
    selectedClient ? selectedClient.availableAreas.includes(area) : true,
  );
  const areaOptions = allowedAreas.length > 0 ? allowedAreas : data.manageableAreas;
  const professionalOptions = data.professionalOptions.filter((professional) =>
    professionalAllowsArea(professional, selectedArea),
  );
  const canCreate = data.canManageEvents && data.clientOptions.length > 0;
  const timeFormat = data.timeFormat;

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

  function pushFilters(overrides: Partial<CalendarFilters>) {
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

  async function onSubmit(values: CalendarEventValues) {
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
  }

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

  const monthLabel = formatMonthLabel(data.monthKey);
  const todayKey = toDateKey(new Date());
  const todayMonthKey = formatMonthKeyFromDateKey(todayKey);
  const selectedIsToday = activeSelectedDate === todayKey;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)] xl:items-start">
      <section className="rounded-[28px] border border-border bg-surface p-4 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
              Vista mensual
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold capitalize text-charcoal">
              {monthLabel}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {data.events.length === 1
                ? "1 evento visible este mes."
                : `${data.events.length} eventos visibles este mes.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {todayMonthKey === data.monthKey ? (
              <Button
                type="button"
                variant={selectedIsToday ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const todayEvents = eventsByDate.get(todayKey) ?? [];
                  setSelectedDate(todayKey);
                  setSelectedEventId(todayEvents[0]?.id ?? "");
                }}
              >
                <CalendarCheck className="size-4" aria-hidden="true" />
                Hoy
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={buildCalendarHref(data.filters, {
                    month: todayMonthKey,
                  })}
                >
                  <CalendarCheck className="size-4" aria-hidden="true" />
                  Hoy
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <Link
                href={buildCalendarHref(data.filters, {
                  month: data.previousMonthKey,
                })}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                Anterior
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link
                href={buildCalendarHref(data.filters, {
                  month: data.nextMonthKey,
                })}
              >
                Siguiente
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            {canCreate ? (
              <Button type="button" size="sm" onClick={() => startCreating()}>
                <Plus className="size-4" aria-hidden="true" />
                Crear evento
              </Button>
            ) : null}
          </div>
        </div>

        {data.error ? (
          <Alert
            variant="destructive"
            className="mt-5 rounded-[22px] border-danger/20 bg-danger/5 px-5 py-4"
          >
            <AlertDescription className="font-semibold text-danger">
              {data.error}
            </AlertDescription>
          </Alert>
        ) : null}

        {data.canFilter ? (
          <div className="mt-5 grid gap-3 rounded-[22px] border border-border bg-background p-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <Label htmlFor="calendar-client-filter">Cliente</Label>
              <select
                id="calendar-client-filter"
                value={data.filters.clientId}
                onChange={(event) =>
                  pushFilters({ clientId: event.currentTarget.value })
                }
                className="mt-2 h-11 w-full rounded-md border border-input bg-surface/90 px-3 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
              >
                <option value="">Todos</option>
                {data.clientOptions.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName}
                    {client.email ? ` - ${client.email}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {data.isAdmin ? (
              <div>
                <Label htmlFor="calendar-professional-filter">
                  Profesional
                </Label>
                <select
                  id="calendar-professional-filter"
                  value={data.filters.professionalId}
                  onChange={(event) =>
                    pushFilters({ professionalId: event.currentTarget.value })
                  }
                  className="mt-2 h-11 w-full rounded-md border border-input bg-surface/90 px-3 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                >
                  <option value="">Todos</option>
                  {data.professionalOptions.map((professional) => (
                    <option key={professional.id} value={professional.id}>
                      {professional.fullName}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <Label htmlFor="calendar-area-filter">Área</Label>
              <select
                id="calendar-area-filter"
                value={data.filters.area}
                onChange={(event) =>
                  pushFilters({
                    area: event.currentTarget.value as CalendarFilters["area"],
                  })
                }
                className="mt-2 h-11 w-full rounded-md border border-input bg-surface/90 px-3 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
              >
                <option value="all">Todas</option>
                {data.manageableAreas.map((area) => (
                  <option key={area} value={area}>
                    {AREA_LABELS[area]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="calendar-status-filter">Estado</Label>
              <select
                id="calendar-status-filter"
                value={data.filters.status}
                onChange={(event) =>
                  pushFilters({
                    status: event.currentTarget
                      .value as CalendarFilters["status"],
                  })
                }
                className="mt-2 h-11 w-full rounded-md border border-input bg-surface/90 px-3 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
              >
                <option value="all">Todos</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2" aria-label="Meses cercanos">
          {data.eventMonthKeys.map((monthKey) => (
            <Button
              key={monthKey}
              asChild
              size="sm"
              variant={monthKey === data.monthKey ? "default" : "outline"}
            >
              <Link
                href={buildCalendarHref(data.filters, { month: monthKey })}
                aria-current={monthKey === data.monthKey ? "page" : undefined}
              >
                {formatMonthLabel(monthKey)}
              </Link>
            </Button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-muted sm:gap-2">
          {WEEKDAYS.map((weekday) => (
            <div key={weekday}>{weekday}</div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day) => {
              const dayEvents = eventsByDate.get(day.dateKey) ?? [];
              const isSelected = activeSelectedDate === day.dateKey;

              return (
                <div
                  key={day.dateKey}
                  className={cn(
                    "min-h-16 rounded-[16px] border bg-background p-1 text-left shadow-soft sm:min-h-28 sm:p-2",
                    day.inMonth ? "border-border" : "border-border/60 opacity-55",
                    isSelected && "border-primary/60 ring-3 ring-primary/20",
                    dayEvents.length > 0 && "bg-primary-soft/32",
                  )}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25",
                      day.isToday && "bg-accent text-charcoal",
                      isSelected && !day.isToday && "bg-primary text-charcoal",
                    )}
                    onClick={() => {
                      setSelectedDate(day.dateKey);
                      setSelectedEventId(dayEvents[0]?.id ?? "");
                    }}
                    aria-pressed={isSelected}
                    aria-label={`${formatFullDate(day.dateKey)}, ${dayEvents.length} eventos`}
                  >
                    {day.dayNumber}
                  </button>

                  {dayEvents.length > 0 ? (
                    <div className="mt-2 space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          className="hidden w-full min-w-0 rounded-[10px] border border-primary/20 bg-surface/86 px-2 py-1 text-left text-[0.7rem] font-extrabold text-charcoal shadow-soft transition hover:border-primary/45 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 sm:block"
                          onClick={() => {
                            setSelectedDate(day.dateKey);
                            setSelectedEventId(event.id);
                          }}
                        >
                          <span className="block truncate">
                            {formatTimeInputLabel(event.startTime, timeFormat)}{" "}
                            {event.title}
                          </span>
                        </button>
                      ))}
                      <div className="sm:hidden">
                        <span className="inline-flex max-w-full items-center rounded-full border border-primary/20 bg-surface px-1.5 py-0.5 text-[0.62rem] font-extrabold text-charcoal">
                          {dayEvents.length} ev.
                        </span>
                      </div>
                      {dayEvents.length > 2 ? (
                        <p className="hidden px-2 text-[0.68rem] font-bold text-muted sm:block">
                          +{dayEvents.length - 2} más
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
          })}
        </div>

        {data.events.length === 0 ? (
          <div className="mt-5">
            <EmptyMonth canCreate={canCreate} onCreate={() => startCreating()} />
          </div>
        ) : null}
      </section>

      <aside className="space-y-6">
        {formOpen ? (
          <DialogPrimitive.Root
            open={formOpen}
            onOpenChange={(open) => {
              setFormOpen(open);
              if (!open) {
                clearForm();
              }
            }}
          >
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay
                className={cn(
                  "fixed inset-0 z-[140] bg-charcoal/45 backdrop-blur-[2px]",
                  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
                  "data-[state=open]:animate-in data-[state=open]:fade-in-0",
                )}
              />
              <DialogPrimitive.Content asChild>
          <section
            className={cn(
              "fixed inset-x-0 bottom-0 z-[150] max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain rounded-t-[28px] border border-border bg-surface p-5 shadow-premium focus-visible:outline-none sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[calc(100%-2rem)] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px] sm:p-6",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 sm:data-[state=closed]:zoom-out-95",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 sm:data-[state=open]:zoom-in-95",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                  {editingEvent ? "Edición" : "Nuevo evento"}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-charcoal">
                  {editingEvent ? "Editar evento" : "Crear evento"}
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setFormOpen(false);
                  clearForm();
                }}
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

            <form
              className="mt-6 space-y-4"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div>
                <Label htmlFor="calendar-title">Titulo</Label>
                <Input
                  id="calendar-title"
                  className="mt-2"
                  maxLength={180}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={
                    errors.title ? "calendar-title-error" : undefined
                  }
                  {...register("title")}
                />
                <FieldError
                  id="calendar-title-error"
                  message={errors.title?.message}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="calendar-event-type">Tipo</Label>
                  <select
                    id="calendar-event-type"
                    className="mt-2 h-11 w-full rounded-md border border-input bg-surface/90 px-3 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                    {...register("eventType")}
                  >
                    {CALENDAR_EVENT_TYPES.map((eventType) => (
                      <option key={eventType} value={eventType}>
                        {EVENT_TYPE_LABELS[eventType]}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs font-semibold leading-5 text-muted">
                    Los cambios del calendario se reflejan en notificaciones si
                    la persona tiene activos los avisos de citas y recordatorios.
                  </p>
                </div>

                <div>
                  <Label htmlFor="calendar-status">Estado</Label>
                  <select
                    id="calendar-status"
                    className="mt-2 h-11 w-full rounded-md border border-input bg-surface/90 px-3 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                    {...register("status")}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs font-semibold leading-5 text-muted">
                    Programado: activo. Completado: ya atendido. Cancelado:
                    anulado y guardado como referencia.
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="calendar-client">Cliente relacionado</Label>
                <select
                  id="calendar-client"
                  className="mt-2 h-11 w-full rounded-md border border-input bg-surface/90 px-3 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                  aria-invalid={Boolean(errors.clientId)}
                  aria-describedby={
                    errors.clientId ? "calendar-client-error" : undefined
                  }
                  {...register("clientId")}
                >
                  <option value="">Selecciona cliente</option>
                  {data.clientOptions.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.fullName}
                      {client.email ? ` - ${client.email}` : ""} -{" "}
                      {client.serviceSummary}
                    </option>
                  ))}
                </select>
                <FieldError
                  id="calendar-client-error"
                  message={errors.clientId?.message}
                />
              </div>

              {data.isAdmin ? (
                <div>
                  <Label htmlFor="calendar-professional">
                    Profesional
                  </Label>
                  <select
                    id="calendar-professional"
                    className="mt-2 h-11 w-full rounded-md border border-input bg-surface/90 px-3 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                    aria-invalid={Boolean(errors.professionalId)}
                    aria-describedby={
                      errors.professionalId
                        ? "calendar-professional-error"
                        : undefined
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
                    aria-describedby={
                      errors.date ? "calendar-date-error" : undefined
                    }
                    {...register("date")}
                  />
                  <FieldError
                    id="calendar-date-error"
                    message={errors.date?.message}
                  />
                </div>
                <div>
                  <Label htmlFor="calendar-start-time">Hora</Label>
                  <Input
                    id="calendar-start-time"
                    type="time"
                    className="mt-2"
                    aria-invalid={Boolean(errors.startTime)}
                    aria-describedby={
                      errors.startTime
                        ? "calendar-start-time-error"
                        : undefined
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
                    aria-describedby={
                      errors.endTime ? "calendar-end-time-error" : undefined
                    }
                    {...register("endTime")}
                  />
                  <FieldError
                    id="calendar-end-time-error"
                    message={errors.endTime?.message}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="calendar-area">Área</Label>
                <select
                  id="calendar-area"
                  className="mt-2 h-11 w-full rounded-md border border-input bg-surface/90 px-3 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                  aria-invalid={Boolean(errors.area)}
                  aria-describedby={
                    errors.area ? "calendar-area-error" : undefined
                  }
                  {...register("area")}
                >
                  {areaOptions.map((area) => (
                    <option key={area} value={area}>
                      {AREA_LABELS[area]}
                    </option>
                  ))}
                </select>
                <FieldError
                  id="calendar-area-error"
                  message={errors.area?.message}
                />
              </div>

              <div>
                <Label htmlFor="calendar-description">
                  Descripción de texto
                </Label>
                <textarea
                  id="calendar-description"
                  rows={4}
                  maxLength={2000}
                  className="mt-2 min-h-32 w-full resize-y rounded-[18px] border border-input bg-surface/90 px-4 py-3 text-base leading-7 text-foreground shadow-soft outline-none placeholder:text-muted focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={
                    errors.description
                      ? "calendar-description-error"
                      : undefined
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
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteTarget(editingEvent)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Eliminar
                  </Button>
                ) : (
                  <span />
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : null}
                  {editingEvent ? "Guardar cambios" : "Crear evento"}
                </Button>
              </div>
            </form>
          </section>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        ) : null}

        <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                {selectedIsToday ? "Hoy" : "Agenda del día"}
              </p>
              <h2 className="mt-2 text-2xl font-bold capitalize text-charcoal">
                {formatFullDate(activeSelectedDate)}
              </h2>
            </div>
            {canCreate ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => startCreating(activeSelectedDate)}
                aria-label="Crear evento para el día seleccionado"
              >
                <Plus className="size-4" aria-hidden="true" />
                Crear
              </Button>
            ) : null}
          </div>

          {selectedDayEvents.length > 0 ? (
            <div className="mt-5 space-y-3">
              {selectedDayEvents.map((event) => (
                <EventSummary
                  key={event.id}
                  event={event}
                  onEdit={canEditEvent(event) ? startEditing : undefined}
                  onOpen={(nextEvent) => setSelectedEventId(nextEvent.id)}
                  timeFormat={timeFormat}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[22px] border border-dashed border-border bg-background p-5 text-sm font-semibold leading-6 text-muted">
              No hay eventos para este día.
              {canCreate ? (
                <Button
                  type="button"
                  size="sm"
                  className="mt-4"
                  onClick={() => startCreating(activeSelectedDate)}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Crear evento
                </Button>
              ) : null}
            </div>
          )}
        </section>

        <UpcomingEventList
          events={data.upcomingEvents}
          onOpen={(event) => {
            setSelectedDate(event.dateKey);
            setSelectedEventId(event.id);

            if (formatMonthKeyFromDateKey(event.dateKey) !== data.monthKey) {
              router.push(
                buildCalendarHref(data.filters, {
                  month: formatMonthKeyFromDateKey(event.dateKey),
                }),
              );
            }
          }}
          timeFormat={timeFormat}
        />

        <section className="rounded-[28px] border border-border bg-primary-soft/68 p-5 shadow-soft sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-full bg-surface text-warm-brown shadow-soft">
              <CalendarClock className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                Detalle
              </p>
              <h2 className="text-xl font-bold text-charcoal">
                {selectedEvent ? selectedEvent.title : "Sin evento seleccionado"}
              </h2>
            </div>
          </div>

          {selectedEvent ? (
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <EventBadge event={selectedEvent} />
                <RelationshipBadge>
                  {EVENT_TYPE_LABELS[selectedEvent.eventType]}
                </RelationshipBadge>
                <StatusBadge status={selectedEvent.status} />
              </div>

              <dl className="grid gap-3 text-sm leading-6">
                <div>
                  <dt className="font-extrabold text-charcoal">Fecha y hora</dt>
                  <dd className="mt-1 text-muted">
                    <Clock className="mr-1 inline size-4" aria-hidden="true" />
                    {formatFullDate(selectedEvent.dateKey)},{" "}
                    {formatTimeInputLabel(selectedEvent.startTime, timeFormat)}
                    {selectedEvent.endTime
                      ? ` - ${formatTimeInputLabel(
                          selectedEvent.endTime,
                          timeFormat,
                        )}`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt className="font-extrabold text-charcoal">Cliente</dt>
                  <dd className="mt-1 text-muted">
                    <span className="block font-bold text-charcoal">
                      {selectedEvent.clientName}
                    </span>
                    {selectedEvent.clientEmail ? (
                      <span className="block truncate">
                        {selectedEvent.clientEmail}
                      </span>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt className="font-extrabold text-charcoal">Profesional</dt>
                  <dd className="mt-1 text-muted">
                    {selectedEvent.professionalName}
                  </dd>
                </div>
                <div>
                  <dt className="font-extrabold text-charcoal">Descripción</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-muted">
                    {selectedEvent.description || "Sin descripción adicional."}
                  </dd>
                </div>
                <div>
                  <dt className="font-extrabold text-charcoal">Estado</dt>
                  <dd className="mt-1 text-muted">
                    {STATUS_DESCRIPTIONS[selectedEvent.status]}
                  </dd>
                </div>
              </dl>

              {canEditEvent(selectedEvent) ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  {selectedEvent.status !== "completed" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateEventStatus(selectedEvent, "completed")
                      }
                    >
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      Marcar completado
                    </Button>
                  ) : null}
                  {selectedEvent.status !== "cancelled" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateEventStatus(selectedEvent, "cancelled")
                      }
                    >
                      <CircleSlash className="size-4" aria-hidden="true" />
                      Cancelar
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => startEditing(selectedEvent)}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Editar
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-muted">
              Selecciona un evento del calendario para ver titulo, hora,
              profesional, descripción y área.
            </p>
          )}
        </section>
      </aside>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={confirmDelete}
        title="Eliminar evento"
        description={`Se eliminara "${
          deleteTarget?.title ?? "este evento"
        }" del calendario. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        pendingLabel="Eliminando..."
        tone="destructive"
      />
    </div>
  );
}
