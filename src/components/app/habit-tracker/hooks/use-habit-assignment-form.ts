"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
 deactivateHabitAssignment,
 reactivateHabitAssignment,
 saveHabitAssignment,
} from "@/lib/actions/habits";
import type { HabitSummary } from "@/lib/habits/utils";

import type { HabitAssignmentConfirmation } from "../types";

export function useHabitAssignmentForm({
 habits,
 selectedClientId,
 today,
}: {
 habits: HabitSummary[];
 selectedClientId: string;
 today: string;
}) {
 const router = useRouter();
 const pathname = usePathname();
 const [clientId, setClientId] = useState(selectedClientId);
 const activeHabits = useMemo(
 () => habits.filter((habit) => habit.active),
 [habits],
 );
 const [habitId, setHabitId] = useState(activeHabits[0]?.id ?? "");
 const [daysOfWeek, setDaysOfWeek] = useState([1, 2, 3, 4, 5, 6, 7]);
 const [startDate, setStartDate] = useState(today);
 const [endDate, setEndDate] = useState("");
 const [isPending, startTransition] = useTransition();
 const [confirmation, setConfirmation] =
 useState<HabitAssignmentConfirmation | null>(null);

 useEffect(() => {
 if (!habitId || !activeHabits.some((habit) => habit.id === habitId)) {
 const firstActive = activeHabits[0]?.id ?? "";
 if (firstActive !== habitId) {
 // eslint-disable-next-line react-hooks/set-state-in-effect
 setHabitId(firstActive);
 }
 }
 }, [activeHabits, habitId]);

 function selectClient(nextClientId: string) {
 setClientId(nextClientId);
 router.push(`${pathname}?client=${nextClientId}`);
 }

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

 const result =
 confirmation.type === "activate"
 ? await reactivateHabitAssignment(confirmation.assignment.id, clientId)
 : await deactivateHabitAssignment(confirmation.assignment.id, clientId);

 if (result.status === "error") {
 toast.error(result.message);
 } else {
 toast.success(result.message);
 router.refresh();
 }
 setConfirmation(null);
 }

 const assignDisabledReason = !habitId
 ? "Crea o activa un hábito antes de asignarlo."
 : daysOfWeek.length === 0
 ? "Selecciona al menos un día aplicable."
 : isPending
 ? "Guardando la asignación."
 : undefined;

 const dialog = getHabitAssignmentDialog(confirmation);

 return {
 activeHabits,
 assignDisabledReason,
 clientId,
 confirmation,
 daysOfWeek,
 dialog,
 endDate,
 handleConfirm,
 habitId,
 isPending,
 selectClient,
 setConfirmation,
 setEndDate,
 setHabitId,
 setStartDate,
 startDate,
 submit,
 toggleDay,
 };
}

function getHabitAssignmentDialog(
 confirmation: HabitAssignmentConfirmation | null,
) {
 if (!confirmation) {
 return {
 confirmLabel: "",
 description: "",
 pendingLabel: "",
 title: "",
 tone: "default" as const,
 };
 }

 if (confirmation.type === "activate") {
 return {
 confirmLabel: "Activar",
 description: `¿Estás segura de que deseas activar la asignación de "${confirmation.assignment.habit.title}" para esta clienta?`,
 pendingLabel: "Activando...",
 title: "Activar asignación",
 tone: "default" as const,
 };
 }

 return {
 confirmLabel: "Desactivar",
 description: `¿Estás segura de que deseas desactivar la asignación de "${confirmation.assignment.habit.title}"? El progreso histórico se conservará, pero ya no aparecerá en la semana activa de la clienta.`,
 pendingLabel: "Desactivando...",
 title: "Desactivar asignación",
 tone: "destructive" as const,
 };
}
