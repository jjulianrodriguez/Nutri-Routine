"use client";

import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
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
 return (
 <div className="h-fit self-start rounded-[22px] bg-background p-4">
 <h3 className="font-extrabold text-foreground">Asignar hábito</h3>
 <p className="mt-1 text-sm leading-6 text-muted">
 La clienta verá este hábito solo durante la vigencia y en los días que selecciones.
 </p>
 <div className="mt-4 space-y-4">
 <div>
 <Label htmlFor="habit-client">Clienta</Label>
 <Select
 id="habit-client"
 value={clientId}
 onChange={(event) => onClientChange(event.target.value)}
 >
 {clients.map((client) => (
 <option key={client.id} value={client.id}>
 {client.fullName}
 </option>
 ))}
 </Select>
 </div>

 <div>
 <Label htmlFor="habit-select">Hábito</Label>
 <Select
 id="habit-select"
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
 </div>

 <div>
 <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
 <p className="text-sm font-bold text-foreground">Días aplicables</p>
 </div>
 <div
 role="group"
 aria-label="Días aplicables del hábito"
 className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-4 2xl:grid-cols-7"
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
 "group flex h-11 items-center justify-between gap-3 rounded-[14px] border px-4 py-2 text-sm font-extrabold transition-[background-color,border-color,box-shadow,color,transform] duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.98]",
 selected
 ? "border-primary/20 bg-primary/10 text-primary"
 : "border-transparent bg-surface text-muted-foreground hover:bg-surface/80 hover:text-foreground",
 )}
 >
 <span className="truncate">{day.label}</span>
 <span
 className={cn(
 "flex size-4 shrink-0 items-center justify-center transition-[background-color,border-color,box-shadow,color,transform] duration-200",
 selected ? "scale-100 opacity-100" : "scale-50 opacity-0",
 )}
 >
 <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
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
 onChange={(event) => onStartDateChange(event.target.value)}
 className="mt-2"
 />
 </div>
 <div>
 <Label htmlFor="habit-end">Fin opcional</Label>
 <Input
 id="habit-end"
 type="date"
 value={endDate}
 onChange={(event) => onEndDateChange(event.target.value)}
 className="mt-2"
 />
 </div>
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
