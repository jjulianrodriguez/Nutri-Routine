"use client";

import {
  Check,
  CheckCircle2,
  Circle,
  Edit3,
  Loader2,
  Plus,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deactivateHabit,
  deactivateHabitAssignment,
  saveHabit,
  saveHabitAssignment,
  updateHabitProgress,
} from "@/lib/actions/habits";
import {
  isAssignmentApplicableOnDate,
  isHabitDateMarkable,
  type HabitAssignmentSummary,
  type HabitSummary,
  type HabitWeekDay,
  type NutritionHabitTrackerData,
} from "@/lib/habits/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

type CompletionOverrides = Record<string, boolean>;

const weekdayOptions = [
  { label: "L", value: 1 },
  { label: "M", value: 2 },
  { label: "X", value: 3 },
  { label: "J", value: 4 },
  { label: "V", value: 5 },
];

function completionKey(assignmentId: string, date: string) {
  return `${assignmentId}:${date}`;
}

function getCompletion(
  assignment: HabitAssignmentSummary,
  date: string,
  overrides: CompletionOverrides,
) {
  const key = completionKey(assignment.id, date);

  if (key in overrides) {
    return overrides[key];
  }

  return assignment.progressByDate[date]?.completed ?? false;
}

function getStats(
  assignments: HabitAssignmentSummary[],
  days: HabitWeekDay[],
  overrides: CompletionOverrides,
) {
  let total = 0;
  let completed = 0;
  const markedDates = new Set<string>();

  for (const assignment of assignments) {
    for (const day of days) {
      if (isAssignmentApplicableOnDate(assignment, day.date)) {
        total += 1;

        if (getCompletion(assignment, day.date, overrides)) {
          completed += 1;
          markedDates.add(day.date);
        }
      }
    }
  }

  return {
    completed,
    markedDays: markedDates.size,
    pending: Math.max(total - completed, 0),
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    total,
  };
}

function ProgressSummary({
  assignments,
  overrides,
  weekDays,
}: {
  assignments: HabitAssignmentSummary[];
  overrides: CompletionOverrides;
  weekDays: HabitWeekDay[];
}) {
  const stats = getStats(assignments, weekDays, overrides);

  return (
    <div className="rounded-[24px] border border-primary/25 bg-primary-soft/70 p-5 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
            Progreso semanal
          </p>
          <h2 className="mt-2 text-2xl font-bold text-charcoal">
            Completaste {stats.completed} de {stats.total} habitos esta semana
          </h2>
          <p className="mt-2 text-sm font-semibold text-warm-brown">
            {stats.pending} pendientes · {stats.markedDays} dias marcados
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-heading text-4xl font-bold leading-none text-charcoal">
            {stats.percentage}%
          </p>
          <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
            cumplimiento
          </p>
        </div>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${stats.percentage}%` }}
        />
      </div>
    </div>
  );
}

function HabitDayToggle({
  assignment,
  canToggle,
  completed,
  date,
  disabled,
  isToday,
  onToggle,
}: {
  assignment: HabitAssignmentSummary;
  canToggle: boolean;
  completed: boolean;
  date: string;
  disabled: boolean;
  isToday: boolean;
  onToggle: (assignmentId: string, date: string, completed: boolean) => void;
}) {
  const applicable = isAssignmentApplicableOnDate(assignment, date);

  if (!applicable) {
    return (
      <span className="inline-flex min-h-11 w-full items-center justify-center rounded-[14px] border border-dashed border-border bg-background text-xs font-bold text-muted">
        No aplica
      </span>
    );
  }

  const buttonDisabled = disabled || !canToggle;

  return (
    <button
      type="button"
      disabled={buttonDisabled}
      aria-pressed={completed}
      onClick={() => onToggle(assignment.id, date, !completed)}
      className={cn(
        "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border px-3 py-2 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed",
        completed
          ? "border-primary/50 bg-primary text-charcoal shadow-soft"
          : "border-border bg-surface text-warm-brown hover:border-primary/35 hover:bg-primary-soft",
        !canToggle && "opacity-70",
        isToday && "ring-2 ring-primary/25",
      )}
    >
      {completed ? (
        <CheckCircle2 className="size-4" aria-hidden="true" />
      ) : (
        <Circle className="size-4" aria-hidden="true" />
      )}
      <span className="sr-only">
        {completed ? "Completado" : "Pendiente"}
      </span>
    </button>
  );
}

function HabitWeekGrid({
  assignments,
  isClient,
  overrides,
  today,
  weekDays,
  weekStart,
}: {
  assignments: HabitAssignmentSummary[];
  isClient: boolean;
  overrides: CompletionOverrides;
  today: string;
  weekDays: HabitWeekDay[];
  weekStart: string;
}) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle(assignmentId: string, date: string, completed: boolean) {
    if (!isClient || isPending) {
      return;
    }

    const key = completionKey(assignmentId, date);
    setPendingKey(key);
    startTransition(async () => {
      const result = await updateHabitProgress({
        assignmentId,
        completed,
        date,
      });

      setPendingKey(null);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      window.dispatchEvent(
        new CustomEvent("habit-progress-local", {
          detail: { completed, key },
        }),
      );
    });
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-border bg-surface/58 p-5 text-sm font-semibold leading-6 text-muted shadow-soft">
        No hay habitos asignados para esta semana.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-[24px] border border-border bg-surface shadow-soft md:block">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/70">
              <th className="w-[32%] px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
                Habito
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.date}
                  className={cn(
                    "px-3 py-3 text-center text-xs font-extrabold uppercase tracking-[0.12em]",
                    day.isToday ? "text-charcoal" : "text-muted",
                  )}
                >
                  <span>{day.shortLabel}</span>
                  <span className="mt-1 block text-[0.68rem] font-bold normal-case tracking-normal text-warm-brown">
                    {day.date.slice(5)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-4 align-top">
                  <p className="font-extrabold text-charcoal">
                    {assignment.habit.title}
                  </p>
                  {assignment.habit.description ? (
                    <p className="mt-1 text-sm leading-5 text-muted">
                      {assignment.habit.description}
                    </p>
                  ) : null}
                </td>
                {weekDays.map((day) => {
                  const key = completionKey(assignment.id, day.date);
                  const canToggle =
                    isClient && isHabitDateMarkable(day.date, today, weekStart);

                  return (
                    <td key={day.date} className="px-3 py-4 align-middle">
                      <HabitDayToggle
                        assignment={assignment}
                        canToggle={canToggle}
                        completed={getCompletion(assignment, day.date, overrides)}
                        date={day.date}
                        disabled={pendingKey === key || isPending}
                        isToday={day.isToday}
                        onToggle={handleToggle}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {assignments.map((assignment) => (
          <article
            key={assignment.id}
            className="rounded-[24px] border border-border bg-surface p-4 shadow-soft"
          >
            <h3 className="font-extrabold text-charcoal">
              {assignment.habit.title}
            </h3>
            {assignment.habit.description ? (
              <p className="mt-2 text-sm leading-6 text-muted">
                {assignment.habit.description}
              </p>
            ) : null}
            <div className="mt-4 grid grid-cols-5 gap-2">
              {weekDays.map((day) => {
                const key = completionKey(assignment.id, day.date);
                const canToggle =
                  isClient && isHabitDateMarkable(day.date, today, weekStart);

                return (
                  <div key={day.date} className="space-y-2">
                    <p
                      className={cn(
                        "text-center text-xs font-extrabold",
                        day.isToday ? "text-charcoal" : "text-muted",
                      )}
                    >
                      {day.label.slice(0, 3)}
                    </p>
                    <HabitDayToggle
                      assignment={assignment}
                      canToggle={canToggle}
                      completed={getCompletion(assignment, day.date, overrides)}
                      date={day.date}
                      disabled={pendingKey === key || isPending}
                      isToday={day.isToday}
                      onToggle={handleToggle}
                    />
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function HabitManager({ habits }: { habits: HabitSummary[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<HabitSummary | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setActive(true);
  }

  function editHabit(habit: HabitSummary) {
    setEditing(habit);
    setTitle(habit.title);
    setDescription(habit.description ?? "");
    setActive(habit.active);
  }

  function submit() {
    startTransition(async () => {
      const result = await saveHabit({
        active,
        description,
        habitId: editing?.id,
        title,
      });

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      resetForm();
      router.refresh();
    });
  }

  function deactivate(id: string) {
    startTransition(async () => {
      const result = await deactivateHabit(id);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[22px] border border-border bg-background p-4">
        <h3 className="font-extrabold text-charcoal">
          {editing ? "Editar habito" : "Crear habito"}
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="habit-title">Nombre</Label>
            <Input
              id="habit-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Tomar 2L de agua"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="habit-description">Descripcion opcional</Label>
            <textarea
              id="habit-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-control border border-border bg-surface px-3 py-3 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
              placeholder="Indicaciones breves para la clienta"
            />
          </div>
          <label className="flex min-h-11 items-center gap-3 rounded-[16px] border border-border bg-surface px-3 py-2 text-sm font-bold text-warm-brown">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="size-4 accent-primary"
            />
            Habito activo
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={submit} disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : editing ? (
                <Save className="size-4" aria-hidden="true" />
              ) : (
                <Plus className="size-4" aria-hidden="true" />
              )}
              {editing ? "Guardar cambios" : "Crear habito"}
            </Button>
            {editing ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                <X className="size-4" aria-hidden="true" />
                Cancelar
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {habits.length === 0 ? (
          <Alert className="rounded-[18px] border-primary/25 bg-primary-soft">
            <AlertDescription className="font-semibold text-charcoal">
              Crea el primer habito para poder asignarlo a una clienta.
            </AlertDescription>
          </Alert>
        ) : (
          habits.map((habit) => (
            <article
              key={habit.id}
              className="rounded-[18px] border border-border bg-background p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-extrabold text-charcoal">
                      {habit.title}
                    </h4>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-extrabold",
                        habit.active
                          ? "bg-primary-soft text-charcoal"
                          : "bg-muted/10 text-muted",
                      )}
                    >
                      {habit.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  {habit.description ? (
                    <p className="mt-2 text-sm leading-5 text-muted">
                      {habit.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => editHabit(habit)}
                  >
                    <Edit3 className="size-4" aria-hidden="true" />
                    Editar
                  </Button>
                  {habit.active ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => deactivate(habit.id)}
                    >
                      <X className="size-4" aria-hidden="true" />
                      Desactivar
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function AssignmentManager({
  assignments,
  clients,
  habits,
  selectedClientId,
  today,
}: {
  assignments: HabitAssignmentSummary[];
  clients: NutritionHabitTrackerData["clients"];
  habits: HabitSummary[];
  selectedClientId: string;
  today: string;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState(selectedClientId);
  const [habitId, setHabitId] = useState(habits.find((habit) => habit.active)?.id ?? "");
  const [daysOfWeek, setDaysOfWeek] = useState([1, 2, 3, 4, 5]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const activeHabits = habits.filter((habit) => habit.active);

  function toggleDay(day: number) {
    setDaysOfWeek((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day].sort((a, b) => a - b),
    );
  }

  function submit() {
    startTransition(async () => {
      const result = await saveHabitAssignment({
        clientId,
        daysOfWeek,
        endDate,
        habitId,
        startDate,
      });

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  function deactivateAssignment(assignmentId: string) {
    startTransition(async () => {
      const result = await deactivateHabitAssignment(assignmentId, clientId);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  if (clients.length === 0) {
    return (
      <Alert className="rounded-[18px] border-primary/25 bg-primary-soft">
        <AlertDescription className="font-semibold text-charcoal">
          No hay clientas de nutricion asignadas para gestionar habitos.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[22px] border border-border bg-background p-4">
        <h3 className="font-extrabold text-charcoal">Asignar habito</h3>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="habit-client">Clienta</Label>
            <select
              id="habit-client"
              value={clientId}
              onChange={(event) => {
                setClientId(event.target.value);
                router.push(`/app/nutricion?client=${event.target.value}`);
              }}
              className="mt-2 h-12 w-full rounded-control border border-border bg-surface px-3 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="habit-select">Habito</Label>
            <select
              id="habit-select"
              value={habitId}
              onChange={(event) => setHabitId(event.target.value)}
              className="mt-2 h-12 w-full rounded-control border border-border bg-surface px-3 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
            >
              {activeHabits.length === 0 ? (
                <option value="">Crea un habito activo primero</option>
              ) : null}
              {activeHabits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-bold text-charcoal">Dias</p>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {weekdayOptions.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  aria-pressed={daysOfWeek.includes(day.value)}
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "grid min-h-11 place-items-center rounded-[14px] border text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20",
                    daysOfWeek.includes(day.value)
                      ? "border-primary/45 bg-primary text-charcoal"
                      : "border-border bg-surface text-muted",
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="habit-start">Inicio</Label>
              <Input
                id="habit-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="habit-end">Fin opcional</Label>
              <Input
                id="habit-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={submit}
            disabled={isPending || !habitId || daysOfWeek.length === 0}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="size-4" aria-hidden="true" />
            )}
            Asignar habito
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {assignments.length === 0 ? (
          <Alert className="rounded-[18px] border-primary/25 bg-primary-soft">
            <AlertDescription className="font-semibold text-charcoal">
              Esta clienta no tiene habitos activos esta semana.
            </AlertDescription>
          </Alert>
        ) : (
          assignments.map((assignment) => (
            <article
              key={assignment.id}
              className="rounded-[18px] border border-border bg-background p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="font-extrabold text-charcoal">
                    {assignment.habit.title}
                  </h4>
                  <p className="mt-2 text-sm font-semibold text-muted">
                    Dias:{" "}
                    {assignment.daysOfWeek
                      .map((day) => weekdayOptions.find((item) => item.value === day)?.label)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-warm-brown">
                    Desde {assignment.startDate}
                    {assignment.endDate ? ` hasta ${assignment.endDate}` : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => deactivateAssignment(assignment.id)}
                  disabled={isPending}
                >
                  <X className="size-4" aria-hidden="true" />
                  Desactivar
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export function HabitTracker({
  data,
  isClient,
  showManagement = true,
}: {
  data: NutritionHabitTrackerData;
  isClient: boolean;
  showManagement?: boolean;
}) {
  const [overrides, setOverrides] = useState<CompletionOverrides>({});

  useEffect(() => {
    function handleLocalProgress(event: Event) {
      const detail = (event as CustomEvent<{ completed: boolean; key: string }>).detail;

      if (!detail?.key) {
        return;
      }

      setOverrides((current) => ({
        ...current,
        [detail.key]: detail.completed,
      }));
    }

    window.addEventListener("habit-progress-local", handleLocalProgress);
    return () =>
      window.removeEventListener("habit-progress-local", handleLocalProgress);
  }, []);

  return (
    <div className="space-y-6">
      <ProgressSummary
        assignments={data.assignments}
        overrides={overrides}
        weekDays={data.weekDays}
      />

      {!isClient && data.selectedClient ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[20px] border border-border bg-surface px-4 py-3 text-sm font-extrabold text-charcoal shadow-soft">
          <UserRound className="size-4 text-warm-brown" aria-hidden="true" />
          Viendo progreso de {data.selectedClient.fullName}
        </div>
      ) : null}

      <HabitWeekGrid
        assignments={data.assignments}
        isClient={isClient}
        overrides={overrides}
        today={data.today}
        weekDays={data.weekDays}
        weekStart={data.weekStart}
      />

      {!isClient && showManagement ? (
        <div className="grid gap-6">
          <section className="rounded-[28px] border border-border bg-surface/82 p-5 shadow-soft backdrop-blur-lg sm:p-6">
            <h2 className="text-2xl font-bold leading-tight text-charcoal">
              Habitos personalizados
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Crea y mantiene los habitos que luego asignas a clientas.
            </p>
            <div className="mt-5">
              <HabitManager habits={data.habits} />
            </div>
          </section>

          <section className="rounded-[28px] border border-primary/30 bg-primary-soft/70 p-5 shadow-soft backdrop-blur-lg sm:p-6">
            <h2 className="text-2xl font-bold leading-tight text-charcoal">
              Asignaciones
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Define que habitos aplican para cada clienta y en que dias de lunes a viernes.
            </p>
            <div className="mt-5">
              {data.selectedClient ? (
                <AssignmentManager
                  assignments={data.assignments}
                  clients={data.clients}
                  habits={data.habits}
                  selectedClientId={data.selectedClient.id}
                  today={data.today}
                />
              ) : (
                <Alert className="rounded-[18px] border-primary/25 bg-surface">
                  <AlertDescription className="font-semibold text-charcoal">
                    Selecciona o asigna una clienta de nutricion para empezar.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
