"use client";

import { CalendarDays, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/actions/button";
import { FieldGroup, FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import type {
 HabitClientOption,
 HabitSummary,
} from "@/lib/habits/utils";
import { cn } from "@/lib/utils";

import { weekdayOptions } from "./constants";

export function HabitAssignmentForm({
 activeHabits,
 assignDisabledReason,
 clientId,
 clients,
 daysOfWeek,
 endDate,
 habitId,
 isPending,
 onClientChange,
 onEndDateChange,
 onHabitChange,
 onStartDateChange,
 onSubmit,
 onToggleDay,
 startDate,
}: {
 activeHabits: HabitSummary[];
 assignDisabledReason?: string;
 clientId: string;
 clients: HabitClientOption[];
 daysOfWeek: number[];
 endDate: string;
 habitId: string;
 isPending: boolean;
 onClientChange: (clientId: string) => void;
 onEndDateChange: (value: string) => void;
 onHabitChange: (habitId: string) => void;
 onStartDateChange: (value: string) => void;
 onSubmit: () => void;
 onToggleDay: (day: number) => void;
 startDate: string;
}) {
 const selectedDayLabels = weekdayOptions
 .filter((day) => daysOfWeek.includes(day.value))
 .map((day) => day.shortLabel)
 .join(", ");

 return (
 <div className="h-fit self-start rounded-[22px] bg-background p-4">
 <h3 className="font-extrabold text-foreground">Asignar hábito</h3>
 <p className="mt-1 text-sm leading-6 text-muted">
 La clienta verá este hábito solo durante la vigencia y en los días que selecciones.
 </p>
 <div className="mt-4 space-y-4">
 <Select
 id="habit-client"
 label="Clienta"
 value={clientId}
 onChange={(event) => onClientChange(event.target.value)}
 >
 {clients.map((client) => (
 <option key={client.id} value={client.id}>
 {client.fullName}
 </option>
 ))}
 </Select>

 <Select
 id="habit-select"
 label="Hábito"
 value={habitId}
 onChange={(event) => onHabitChange(event.target.value)}
 >
 {activeHabits.length === 0 ? (
 <option value="">Crea un hábito activo primero</option>
 ) : null}
 {activeHabits.map((habit) => (
 <option key={habit.id} value={habit.id}>
 {habit.title}
 </option>
 ))}
 </Select>

 <FieldGroup
 className="rounded-[22px] border border-border/70 bg-surface p-3 sm:p-4"
 description="Elige cada día en que la clienta podrá marcar este hábito."
 descriptionClassName="mb-0 text-sm font-semibold leading-5"
 legend={
 <span className="flex items-center gap-2">
 <span className="grid size-9 place-items-center rounded-[12px] bg-primary-soft text-primary-hover">
 <CalendarDays className="size-4" aria-hidden="true" />
 </span>
 <span>Días aplicables</span>
 </span>
 }
 legendClassName="mb-1 text-base"
 >
 <div
 role="group"
 aria-label="Días aplicables del hábito"
 className="grid grid-cols-2 gap-2 sm:grid-cols-4"
 >
 {weekdayOptions.map((day) => {
 const selected = daysOfWeek.includes(day.value);

 return (
 <button
 key={day.value}
 type="button"
 aria-pressed={selected}
 aria-label={`${selected ? "Quitar" : "Seleccionar"} ${day.label}`}
 onClick={() => onToggleDay(day.value)}
 className={cn(
 "group relative flex min-h-20 flex-col items-start justify-between gap-3 overflow-hidden rounded-[16px] border p-3 text-left transition-[background-color,border-color,box-shadow,color,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30 active:scale-[0.98]",
 selected
 ? "border-primary/35 bg-primary text-primary-foreground shadow-sm"
 : "border-border/70 bg-background text-muted-foreground hover:border-primary/30 hover:bg-primary-soft hover:text-foreground",
 )}
 >
 <span
 className={cn(
 "flex size-6 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,box-shadow,color,transform] duration-200",
 selected
 ? "border-primary-foreground/30 bg-primary-foreground/15 text-primary"
 : "border-border bg-surface text-transparent group-hover:border-primary/30",
 )}
 >
 <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
 </span>
 <span>
 <span className="block text-[0.68rem] font-extrabold uppercase tracking-[0.12em] opacity-75">
 Día {day.value}
 </span>
 <span className="mt-0.5 block text-sm font-extrabold">
 {day.label}
 </span>
 </span>
 </button>
 );
 })}
 </div>
 <div
 className="flex flex-col gap-1 rounded-[14px] bg-background px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between"
 aria-live="polite"
 >
 <span className="font-extrabold text-foreground">
 {daysOfWeek.length === 0
 ? "Ningún día seleccionado"
 : `${daysOfWeek.length} ${daysOfWeek.length === 1 ? "día seleccionado" : "días seleccionados"}`}
 </span>
 {selectedDayLabels ? (
 <span className="font-semibold text-muted">{selectedDayLabels}</span>
 ) : (
 <span className="font-semibold text-danger">Selecciona al menos uno</span>
 )}
 </div>
 </FieldGroup>

 <div className="grid items-start gap-3 sm:grid-cols-2">
 <FormField controlId="habit-start" label="Inicio">
 <Input
 type="date"
 value={startDate}
 onChange={(event) => onStartDateChange(event.target.value)}
 />
 </FormField>
 <FormField controlId="habit-end" label="Fin opcional">
 <Input
 type="date"
 value={endDate}
 onChange={(event) => onEndDateChange(event.target.value)}
 />
 </FormField>
 </div>

 <Button
 type="button"
 onClick={onSubmit}
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
 );
}
