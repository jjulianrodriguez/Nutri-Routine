"use client";

import {
 CheckCircle2,
 Circle,
 Loader2,
 Pencil,
 Plus,
 Power,
 RotateCcw,
 Trash2,
} from "lucide-react";

import { CardActionsMenu } from "@/components/app/shared/card-actions-menu";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import type { HabitSummary } from "@/lib/habits/utils";
import { cn } from "@/lib/utils";

import type { HabitCatalogConfirmation } from "./types";

export function HabitCatalogList({
 habits,
 isPending,
 onConfirm,
 onEdit,
}: {
 habits: HabitSummary[];
 isPending: boolean;
 onConfirm: (confirmation: HabitCatalogConfirmation) => void;
 onEdit: (habit: HabitSummary) => void;
}) {
 return (
 <div className="space-y-3" aria-busy={isPending}>
 {isPending ? (
 <div className="flex items-center gap-2 rounded-[18px] border-primary/25 bg-primary-soft px-4 py-3 text-sm font-extrabold text-foreground">
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 Guardando cambios del catálogo...
 </div>
 ) : null}
 {habits.length === 0 ? (
 <Alert className="rounded-[22px] border-primary/35 bg-primary-soft/70 p-5">
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
 "h-fit self-start rounded-[22px] bg-background p-4 transition hover:border-primary/30 sm:p-5",
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
 <div className="h-fit self-start rounded-[16px] bg-surface px-3 py-2">
 <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-muted">
 Frecuencia/días
 </p>
 <p className="mt-1 text-sm font-bold text-foreground">
 Se define en Asignaciones
 </p>
 </div>
 <div className="h-fit self-start rounded-[16px] bg-surface px-3 py-2">
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
 onSelect: () => onEdit(habit),
 },
 habit.active
 ? {
 destructive: true,
 icon: Power,
 label: "Desactivar",
 onSelect: () => onConfirm({ habit, type: "deactivate" }),
 }
 : {
 icon: RotateCcw,
 label: "Activar",
 onSelect: () => onConfirm({ habit, type: "activate" }),
 },
 {
 destructive: true,
 icon: Trash2,
 label: "Eliminar",
 onSelect: () => onConfirm({ habit, type: "delete" }),
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
 );
}
