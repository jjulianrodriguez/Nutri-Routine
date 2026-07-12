"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateHabitProgress } from "@/lib/actions/habits";

import { completionKey } from "../utils";

export function useHabitProgressToggle(isClient: boolean) {
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

 return {
 handleToggle,
 isPending,
 pendingKey,
 };
}
