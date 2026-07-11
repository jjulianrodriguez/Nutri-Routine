"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
 activateHabit,
 deactivateHabit,
 deleteHabit,
 saveHabit,
} from "@/lib/actions/habits";
import type { HabitSummary } from "@/lib/habits/utils";

import type { HabitCatalogConfirmation } from "../types";

export function useHabitCatalogForm() {
 const router = useRouter();
 const [editing, setEditing] = useState<HabitSummary | null>(null);
 const [title, setTitle] = useState("");
 const [description, setDescription] = useState("");
 const [active, setActive] = useState(true);
 const [isPending, startTransition] = useTransition();
 const [confirmation, setConfirmation] =
 useState<HabitCatalogConfirmation | null>(null);

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

 const dialog = getHabitCatalogDialog(confirmation);

 return {
 active,
 confirmation,
 description,
 dialog,
 editHabit,
 editing,
 handleConfirm,
 isPending,
 resetForm,
 setActive,
 setConfirmation,
 setDescription,
 setTitle,
 submit,
 title,
 };
}

function getHabitCatalogDialog(confirmation: HabitCatalogConfirmation | null) {
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
 description: `¿Estás segura de que deseas activar el hábito "${confirmation.habit.title}"? Volverá a estar disponible para asignaciones.`,
 pendingLabel: "Activando...",
 title: "Activar hábito",
 tone: "default" as const,
 };
 }

 if (confirmation.type === "deactivate") {
 return {
 confirmLabel: "Desactivar",
 description: `¿Estás segura de que deseas desactivar el hábito "${confirmation.habit.title}"? No se perderá el progreso histórico, pero no se podrá usar en nuevas asignaciones.`,
 pendingLabel: "Desactivando...",
 title: "Desactivar hábito",
 tone: "destructive" as const,
 };
 }

 return {
 confirmLabel: "Eliminar",
 description: `¿Estás segura de que deseas eliminar permanentemente el hábito "${confirmation.habit.title}"? Esta acción solo es posible si nunca ha sido asignado.`,
 pendingLabel: "Eliminando...",
 title: "Eliminar hábito",
 tone: "destructive" as const,
 };
}

