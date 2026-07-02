"use client";

import {
  Check,
  CalendarCheck2,
  CheckCircle2,
  Circle,
  Info,
  Loader2,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { CardActionsMenu } from "@/components/app/card-actions-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  activateHabit,
  deactivateHabit,
  deactivateHabitAssignment,
  deleteHabit,
  reactivateHabitAssignment,
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
  { label: "Lunes", value: 1 },
  { label: "Martes", value: 2 },
  { label: "Miercoles", value: 3 },
  { label: "Jueves", value: 4 },
  { label: "Viernes", value: 5 },
  { label: "Sabado", value: 6 },
  { label: "Domingo", value: 7 },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeZone: "America/Costa_Rica",
  }).format(new Date(`${value}T12:00:00`));
}

function formatAssignmentDays(daysOfWeek: number[]) {
  return daysOfWeek
    .map((day) => weekdayOptions.find((item) => item.value === day)?.label)
    .filter(Boolean)
    .join(", ");
}

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

function TodayFocus({
  assignments,
  overrides,
  today,
}: {
  assignments: HabitAssignmentSummary[];
  overrides: CompletionOverrides;
  today: string;
}) {
  const todayAssignments = assignments.filter((assignment) =>
    isAssignmentApplicableOnDate(assignment, today),
  );
  const pendingToday = todayAssignments.filter(
    (assignment) => !getCompletion(assignment, today, overrides),
  );

  if (assignments.length === 0) {
    return null;
  }

  if (todayAssignments.length === 0) {
    return (
      <div className="h-fit self-start rounded-[22px] border border-border bg-surface p-5 text-sm font-semibold text-muted shadow-soft">
        <p className="font-extrabold text-foreground">Hoy no tienes hábitos programados.</p>
        <p className="mt-1">Tu tracker semanal queda disponible para revisar otros días.</p>
      </div>
    );
  }

  return (
    <div className="h-fit self-start rounded-[22px] border border-border bg-surface p-5 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-primary-soft text-muted-foreground">
            <CalendarCheck2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-extrabold text-foreground">
              {pendingToday.length === 0
                ? "Hoy está completo."
                : `Faltan ${pendingToday.length} de ${todayAssignments.length} hábitos de hoy.`}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">
              {pendingToday.length === 0
                ? "Puedes revisar la semana o ajustar una marca si lo necesitas."
                : "Marca cada hábito cuando lo completes."}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-background px-3 py-1 text-xs font-extrabold text-muted-foreground">
          Hoy
        </span>
      </div>

      {pendingToday.length > 0 ? (
        <div className="mt-4 grid items-start gap-2 sm:grid-cols-2">
          {pendingToday.map((assignment) => (
            <div
              key={assignment.id}
              className="h-fit self-start rounded-[16px] border border-border bg-background px-4 py-3"
            >
              <p className="font-extrabold text-foreground">
                {assignment.habit.title}
              </p>
              {assignment.habit.description ? (
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">
                  {assignment.habit.description}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
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
  const disabledTitle = disabled
    ? "Guardando tu cambio."
    : canToggle
      ? undefined
      : "Solo la clienta puede marcar hoy o días anteriores de esta semana.";

  return (
    <button
      type="button"
      disabled={buttonDisabled}
      aria-pressed={completed}
      onClick={() => onToggle(assignment.id, date, !completed)}
      title={disabledTitle}
      className={cn(
        "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border px-3 py-2 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed",
        completed
          ? "border-primary/50 bg-primary text-primary-foreground shadow-soft"
          : "border-border bg-surface text-muted-foreground hover:border-primary/35 hover:bg-primary-soft",
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
        <p className="font-extrabold text-foreground">
          Todavía no hay hábitos para esta semana.
        </p>
        <p className="mt-1">
          Cuando tu nutricionista active hábitos, podrás marcarlos de lunes a
          domingo desde aquí.
        </p>
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
                Hábito
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.date}
                  className={cn(
                    "px-3 py-3 text-center text-xs font-extrabold uppercase tracking-[0.12em] relative",
                    day.isToday ? "text-foreground bg-primary-soft/30 font-black rounded-t-[14px]" : "text-muted",
                  )}
                >
                  {day.isToday && (
                    <span className="absolute inset-x-0 top-0 h-1 bg-primary rounded-full" />
                  )}
                  <span>{day.shortLabel}</span>
                  <span className="mt-1 block text-[0.68rem] font-bold normal-case tracking-normal text-muted-foreground">
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
                  <p className="font-extrabold text-foreground">
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
                    <td key={day.date} className={cn("px-3 py-4 align-middle", day.isToday && "bg-primary-soft/10")}>
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
            className="h-fit self-start rounded-[24px] border border-border bg-surface p-4 shadow-soft"
          >
            <h3 className="font-extrabold text-foreground">
              {assignment.habit.title}
            </h3>
            {assignment.habit.description ? (
              <p className="mt-2 text-sm leading-6 text-muted">
                {assignment.habit.description}
              </p>
            ) : null}
            <div className="mt-4 flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
              {weekDays.map((day) => {
                const key = completionKey(assignment.id, day.date);
                const canToggle =
                  isClient && isHabitDateMarkable(day.date, today, weekStart);

                return (
                  <div key={day.date} className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[3.25rem]">
                    <p
                      className={cn(
                        "text-center text-xs font-extrabold",
                        day.isToday ? "text-primary font-black" : "text-muted",
                      )}
                    >
                      {day.shortLabel}
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

  const [confirmation, setConfirmation] = useState<{
    habit: HabitSummary;
    type: "activate" | "deactivate" | "delete";
  } | null>(null);

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

  async function handleConfirm() {
    if (!confirmation) return;

    let result;
    switch (confirmation.type) {
      case "activate":
        result = await activateHabit(confirmation.habit.id);
        break;
      case "deactivate":
        result = await deactivateHabit(confirmation.habit.id);
        break;
      case "delete":
        result = await deleteHabit(confirmation.habit.id);
        break;
    }

    if (result) {
      if (result.status === "error") {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        router.refresh();
      }
    }
    setConfirmation(null);
  }

  let confirmTitle = "";
  let confirmDescription = "";
  let confirmLabel = "";
  let pendingLabel = "";
  let confirmTone: "default" | "destructive" = "default";

  if (confirmation) {
    if (confirmation.type === "activate") {
      confirmTitle = "Activar hábito";
      confirmDescription = `¿Estás segura de que deseas activar el hábito "${confirmation.habit.title}"? Volverá a estar disponible para asignaciones.`;
      confirmLabel = "Activar";
      pendingLabel = "Activando...";
      confirmTone = "default";
    } else if (confirmation.type === "deactivate") {
      confirmTitle = "Desactivar hábito";
      confirmDescription = `¿Estás segura de que deseas desactivar el hábito "${confirmation.habit.title}"? No se perderá el progreso histórico, pero no se podrá usar en nuevas asignaciones.`;
      confirmLabel = "Desactivar";
      pendingLabel = "Desactivando...";
      confirmTone = "destructive";
    } else if (confirmation.type === "delete") {
      confirmTitle = "Eliminar hábito";
      confirmDescription = `¿Estás segura de que deseas eliminar permanentemente el hábito "${confirmation.habit.title}"? Esta acción solo es posible si nunca ha sido asignado.`;
      confirmLabel = "Eliminar";
      pendingLabel = "Eliminando...";
      confirmTone = "destructive";
    }
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="h-fit self-start rounded-[22px] border border-border bg-background p-4">
        <h3 className="font-extrabold text-foreground">
          {editing ? "Editar hábito" : "Crear hábito"}
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
            <Label htmlFor="habit-description">Descripción opcional</Label>
            <textarea
              id="habit-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-control border border-border bg-surface px-3 py-3 text-sm font-semibold text-foreground shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
              placeholder="Indicaciones breves para la clienta"
            />
          </div>
          <label className="flex min-h-11 items-center gap-3 rounded-[16px] border border-border bg-surface px-3 py-2 text-sm font-bold text-muted-foreground">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="size-4 accent-primary"
            />
            Hábito activo
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={submit} disabled={isPending || !title.trim()}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : editing ? (
                <Save className="size-4" aria-hidden="true" />
              ) : (
                <Plus className="size-4" aria-hidden="true" />
              )}
              {editing ? "Guardar cambios" : "Crear hábito"}
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

      <div className="space-y-3" aria-busy={isPending}>
        {isPending ? (
          <div className="flex items-center gap-2 rounded-[18px] border border-primary/25 bg-primary-soft px-4 py-3 text-sm font-extrabold text-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Guardando cambios del catálogo...
          </div>
        ) : null}
        {habits.length === 0 ? (
          <Alert className="rounded-[22px] border-dashed border-primary/35 bg-primary-soft/70 p-5">
            <AlertDescription className="flex items-start gap-3 font-semibold text-foreground">
              <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-surface text-muted-foreground">
                <Plus className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-extrabold">Sin hábitos creados.</span>
                <span className="mt-1 block text-sm leading-6 text-muted">
                  Crea el primer hábito para poder asignarlo a una clienta.
                </span>
              </span>
            </AlertDescription>
          </Alert>
        ) : (
          habits.map((habit) => {
            const isInactive = !habit.active;
            return (
              <article
                key={habit.id}
                className={cn(
                  "h-fit self-start rounded-[22px] border border-border bg-background p-4 shadow-soft transition hover:border-primary/30 sm:p-5",
                  isInactive && "bg-surface/65",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start gap-2">
                      <h4 className="min-w-0 max-w-full truncate text-lg font-extrabold leading-tight text-foreground">
                        {habit.title}
                      </h4>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold",
                          habit.active
                            ? "bg-primary-soft text-foreground"
                            : "bg-muted/15 text-muted",
                        )}
                      >
                        {habit.active ? (
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                        ) : (
                          <Circle className="size-3.5" aria-hidden="true" />
                        )}
                        {habit.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    {habit.description ? (
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {habit.description}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm font-semibold leading-6 text-muted">
                        Sin descripción añadida.
                      </p>
                    )}
                    <div className="mt-4 grid items-start gap-2 sm:grid-cols-2">
                      <div className="h-fit self-start rounded-[16px] border border-border bg-surface px-3 py-2">
                        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-muted">
                          Frecuencia/días
                        </p>
                        <p className="mt-1 text-sm font-bold text-foreground">
                          Se define en Asignaciones
                        </p>
                      </div>
                      <div className="h-fit self-start rounded-[16px] border border-border bg-surface px-3 py-2">
                        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-muted">
                          Estado
                        </p>
                        <p className="mt-1 text-sm font-bold text-foreground">
                          {habit.active
                            ? "Disponible para asignar"
                            : "Oculto para nuevas asignaciones"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-end">
                    <CardActionsMenu
                      label={habit.title}
                      items={[
                        {
                          icon: Pencil,
                          label: "Editar",
                          onSelect: () => editHabit(habit),
                        },
                        habit.active
                          ? {
                              destructive: true,
                              icon: Power,
                              label: "Desactivar",
                              onSelect: () => setConfirmation({ habit, type: "deactivate" }),
                            }
                          : {
                              icon: RotateCcw,
                              label: "Activar",
                              onSelect: () => setConfirmation({ habit, type: "activate" }),
                            },
                        {
                          destructive: true,
                          icon: Trash2,
                          label: "Eliminar",
                          onSelect: () => setConfirmation({ habit, type: "delete" }),
                          separatorBefore: true,
                        },
                      ]}
                    />
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <ConfirmationDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null);
        }}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        pendingLabel={pendingLabel}
        tone={confirmTone}
        onConfirm={handleConfirm}
      />
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
  const pathname = usePathname();
  const [clientId, setClientId] = useState(selectedClientId);
  const [habitId, setHabitId] = useState(habits.find((habit) => habit.active)?.id ?? "");
  const [daysOfWeek, setDaysOfWeek] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const activeHabits = habits.filter((habit) => habit.active);
  const assignDisabledReason = !habitId
    ? "Crea o activa un hábito antes de asignarlo."
    : daysOfWeek.length === 0
      ? "Selecciona al menos un día aplicable."
      : isPending
        ? "Guardando la asignación."
        : undefined;

  const [confirmation, setConfirmation] = useState<{
    assignment: HabitAssignmentSummary;
    type: "activate" | "deactivate";
  } | null>(null);

  useEffect(() => {
    if (!habitId || !activeHabits.some((habit) => habit.id === habitId)) {
      const firstActive = activeHabits[0]?.id ?? "";
      if (firstActive !== habitId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHabitId(firstActive);
      }
    }
  }, [activeHabits, habitId]);

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

  async function handleConfirm() {
    if (!confirmation) return;

    let result;
    if (confirmation.type === "activate") {
      result = await reactivateHabitAssignment(confirmation.assignment.id, clientId);
    } else {
      result = await deactivateHabitAssignment(confirmation.assignment.id, clientId);
    }

    if (result) {
      if (result.status === "error") {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        router.refresh();
      }
    }
    setConfirmation(null);
  }

  let confirmTitle = "";
  let confirmDescription = "";
  let confirmLabel = "";
  let pendingLabel = "";
  let confirmTone: "default" | "destructive" = "default";

  if (confirmation) {
    if (confirmation.type === "activate") {
      confirmTitle = "Activar asignación";
      confirmDescription = `¿Estás segura de que deseas activar la asignación de "${confirmation.assignment.habit.title}" para esta clienta?`;
      confirmLabel = "Activar";
      pendingLabel = "Activando...";
      confirmTone = "default";
    } else {
      confirmTitle = "Desactivar asignación";
      confirmDescription = `¿Estás segura de que deseas desactivar la asignación de "${confirmation.assignment.habit.title}"? El progreso histórico se conservará, pero ya no aparecerá en la semana activa de la clienta.`;
      confirmLabel = "Desactivar";
      pendingLabel = "Desactivando...";
      confirmTone = "destructive";
    }
  }

  if (clients.length === 0) {
    return (
      <Alert className="rounded-[18px] border-primary/25 bg-primary-soft">
        <AlertDescription className="font-semibold text-foreground">
          No hay clientas de nutrición disponibles para gestionar hábitos.
          Revisa las asignaciones activas antes de crear un seguimiento.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="h-fit self-start rounded-[22px] border border-border bg-background p-4">
        <h3 className="font-extrabold text-foreground">Asignar hábito</h3>
        <p className="mt-1 text-sm leading-6 text-muted">
          La clienta verá este hábito solo durante la vigencia y en los días que selecciones.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="habit-client">Clienta</Label>
            <select
              id="habit-client"
              value={clientId}
              onChange={(event) => {
                setClientId(event.target.value);
                router.push(`${pathname}?client=${event.target.value}`);
              }}
              className="mt-2 h-12 w-full rounded-control border border-border bg-surface px-3 text-sm font-semibold text-foreground shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="habit-select">Hábito</Label>
            <select
              id="habit-select"
              value={habitId}
              onChange={(event) => setHabitId(event.target.value)}
              className="mt-2 h-12 w-full rounded-control border border-border bg-surface px-3 text-sm font-semibold text-foreground shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
            >
              {activeHabits.length === 0 ? (
                <option value="">Crea un hábito activo primero</option>
              ) : null}
              {activeHabits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-sm font-bold text-foreground">Días aplicables</p>
              <p className="text-xs font-extrabold text-muted-foreground">
                {daysOfWeek.length} de 7 seleccionados
              </p>
            </div>
            <div
              role="group"
              aria-label="Días aplicables del hábito"
              className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7"
            >
              {weekdayOptions.map((day) => {
                const selected = daysOfWeek.includes(day.value);

                return (
                  <button
                    key={day.value}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${selected ? "Quitar" : "Seleccionar"} ${day.label}`}
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      "flex min-h-16 items-center justify-between gap-2 rounded-[16px] border px-3 py-2 text-left text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25",
                      selected
                        ? "border-primary/65 bg-primary text-primary-foreground shadow-soft"
                        : "border-border bg-surface text-muted hover:border-primary/35 hover:bg-primary-soft/50 hover:text-foreground",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm leading-5">{day.label}</span>
                      <span
                        className={cn(
                          "mt-1 block text-[0.68rem] font-bold leading-none",
                          selected ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {selected ? "Seleccionado" : "No seleccionado"}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full border",
                        selected
                          ? "border-foreground/25 bg-surface/70"
                          : "border-border bg-background",
                      )}
                    >
                      {selected ? (
                        <Check className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Circle className="size-3.5" aria-hidden="true" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-muted">
              Estos son los días en que la clienta podrá marcar el hábito.
            </p>
          </div>

          <div className="grid items-start gap-3 sm:grid-cols-2">
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
            title={assignDisabledReason ?? "Asignar hábito a la clienta"}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="size-4" aria-hidden="true" />
            )}
            Asignar hábito
          </Button>
        </div>
      </div>

      <div className="space-y-3" aria-busy={isPending}>
        {isPending ? (
          <div className="flex items-center gap-2 rounded-[18px] border border-primary/25 bg-primary-soft px-4 py-3 text-sm font-extrabold text-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Guardando asignación...
          </div>
        ) : null}
        {assignments.length === 0 ? (
          <Alert className="rounded-[22px] border-dashed border-primary/35 bg-primary-soft/70 p-5">
            <AlertDescription className="flex items-start gap-3 font-semibold text-foreground">
              <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-surface text-muted-foreground">
                <Check className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-extrabold">Sin asignaciones activas para esta clienta.</span>
                <span className="mt-1 block text-sm leading-6 text-muted">
                  Elige un hábito, define los días aplicables y guarda la asignación.
                </span>
              </span>
            </AlertDescription>
          </Alert>
        ) : (
          assignments.map((assignment) => {
            const isInactive = !assignment.active;
            const selectedDays = weekdayOptions.filter((day) =>
              assignment.daysOfWeek.includes(day.value),
            );
            return (
              <article
                key={assignment.id}
                className={cn(
                  "h-fit self-start rounded-[22px] border border-border bg-background p-4 shadow-soft transition hover:border-primary/30 sm:p-5",
                  isInactive && "bg-surface/65",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start gap-2">
                      <h4 className="min-w-0 max-w-full truncate text-lg font-extrabold leading-tight text-foreground">
                        {assignment.habit.title}
                      </h4>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold",
                          assignment.active
                            ? "bg-primary-soft text-foreground"
                            : "bg-muted/15 text-muted",
                        )}
                      >
                        {assignment.active ? (
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                        ) : (
                          <Circle className="size-3.5" aria-hidden="true" />
                        )}
                        {assignment.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    {assignment.habit.description ? (
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {assignment.habit.description}
                      </p>
                    ) : null}
                    <div className="mt-4 grid items-start gap-3 lg:grid-cols-[1fr_0.9fr]">
                      <div className="h-fit self-start rounded-[16px] border border-border bg-surface p-3">
                        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-muted">
                          Frecuencia/días
                        </p>
                        <div
                          className="mt-2 flex flex-wrap gap-1.5"
                          title={formatAssignmentDays(assignment.daysOfWeek)}
                        >
                          {selectedDays.map((day) => (
                            <span
                              key={day.value}
                              className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-extrabold text-foreground"
                            >
                              {day.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="h-fit self-start rounded-[16px] border border-border bg-surface p-3">
                        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-muted">
                          Vigencia
                        </p>
                        <p className="mt-2 text-sm font-bold leading-5 text-foreground">
                          Desde {formatDate(assignment.startDate)}
                        </p>
                        <p className="text-sm font-semibold leading-5 text-muted-foreground">
                          {assignment.endDate
                            ? `Hasta ${formatDate(assignment.endDate)}`
                            : "Sin fecha final"}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 flex items-start gap-2 text-sm leading-5 text-muted">
                      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span>
                        Aparecerá en el tracker de la clienta solo durante estos días y vigencia.
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center justify-end">
                    <CardActionsMenu
                      label={assignment.habit.title}
                      items={[
                        assignment.active
                          ? {
                              destructive: true,
                              icon: Power,
                              label: "Desactivar",
                              onSelect: () => setConfirmation({ assignment, type: "deactivate" }),
                            }
                          : {
                              icon: RotateCcw,
                              label: "Activar",
                              onSelect: () => setConfirmation({ assignment, type: "activate" }),
                            },
                      ]}
                    />
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <ConfirmationDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null);
        }}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        pendingLabel={pendingLabel}
        tone={confirmTone}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export function HabitTracker({
  data,
  isClient,
  showCatalog = false,
  showAssignments = false,
}: {
  data: NutritionHabitTrackerData;
  isClient: boolean;
  showCatalog?: boolean;
  showAssignments?: boolean;
}) {
  const [overrides, setOverrides] = useState<CompletionOverrides>({});
  const activeAssignments = data.assignments.filter((assignment) => assignment.active);
  const isManagementView = showCatalog || showAssignments;

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
      {!isManagementView && isClient ? (
        <TodayFocus
          assignments={activeAssignments}
          overrides={overrides}
          today={data.today}
        />
      ) : null}

      {!isManagementView && !isClient && data.selectedClient ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[20px] border border-border bg-surface px-4 py-3 text-sm font-extrabold text-foreground shadow-soft">
          <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
          Viendo progreso de {data.selectedClient.fullName}
        </div>
      ) : null}

      {!isManagementView ? (
        <HabitWeekGrid
          assignments={activeAssignments}
          isClient={isClient}
          overrides={overrides}
          today={data.today}
          weekDays={data.weekDays}
          weekStart={data.weekStart}
        />
      ) : null}

      {!isClient && showCatalog && (
        <section className="h-fit self-start rounded-[28px] border border-border bg-surface/82 p-5 shadow-soft backdrop-blur-lg sm:p-6">
          <h2 className="text-2xl font-bold leading-tight text-foreground">
            Hábitos personalizados
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Crea y mantiene los hábitos que luego asignas a clientas.
          </p>
          <div className="mt-5">
            <HabitManager habits={data.habits} />
          </div>
        </section>
      )}

      {!isClient && showAssignments && (
        <section className="h-fit self-start rounded-[28px] border border-primary/30 bg-primary-soft/70 p-5 shadow-soft backdrop-blur-lg sm:p-6">
          <h2 className="text-2xl font-bold leading-tight text-foreground">
            Asignaciones
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Define qué hábitos aplican para cada clienta y en qué días.
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
                <AlertDescription className="font-semibold text-foreground">
                  Selecciona o asigna una clienta de nutrición para empezar.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
