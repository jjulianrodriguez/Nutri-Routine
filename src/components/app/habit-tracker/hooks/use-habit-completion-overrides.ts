"use client";

import { useEffect, useState } from "react";

import type { CompletionOverrides } from "../types";

type HabitProgressLocalEventDetail = {
 completed: boolean;
 key: string;
};

export function useHabitCompletionOverrides() {
 const [overrides, setOverrides] = useState<CompletionOverrides>({});

 useEffect(() => {
 function handleLocalProgress(event: Event) {
 const detail = (event as CustomEvent<HabitProgressLocalEventDetail>).detail;

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

 return overrides;
}

