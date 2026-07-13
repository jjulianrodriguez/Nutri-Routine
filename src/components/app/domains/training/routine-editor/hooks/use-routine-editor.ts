"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { useProgressiveResults } from "@/hooks/use-progressive-results";
import { saveRoutine } from "@/lib/actions/routines";
import { routineFormSchema, type RoutineFormValues } from "@/lib/validations/routines";
import type { ExerciseOption } from "@/types/exercise";
import type { RoutineDetail } from "@/types/routine";

import { getExerciseSetupState, getRoutineDefaultValues, normalizeRoutineSearch, toRoutineFormExercise } from "../helpers";

export function useRoutineEditor(exerciseOptions: ExerciseOption[], routine?: RoutineDetail) {
 const router = useRouter();
 const [pendingUpdate, setPendingUpdate] = useState<RoutineFormValues | null>(null);
 const [exerciseQuery, setExerciseQuery] = useState("");
 const [serverMessage, setServerMessage] = useState("");
 const form = useForm<RoutineFormValues>({ defaultValues: getRoutineDefaultValues(routine), resolver: zodResolver(routineFormSchema) });
 const fieldArray = useFieldArray({ control: form.control, name: "exercises" });
 const selectedCategory = useWatch({ control: form.control, name: "category" });
 const selectedTargetAudience = useWatch({ control: form.control, name: "targetAudience" });
 const watchedItems = useWatch({ control: form.control, name: "exercises" });
 const selectedItems = useMemo(() => watchedItems ?? [], [watchedItems]);
 const selectedIds = useMemo(() => new Set(selectedItems.map((item) => item.exerciseId)), [selectedItems]);
 const catalogExercises = useMemo(() => {
  const exercisesById = new Map(exerciseOptions.map((exercise) => [exercise.id, exercise]));
  routine?.exercises.forEach((item) => { if (!exercisesById.has(item.exercise.id)) exercisesById.set(item.exercise.id, item.exercise); });
  return [...exercisesById.values()];
 }, [exerciseOptions, routine]);
 const listedExercises = useMemo(() => catalogExercises.filter((exercise) => exercise.isActive || selectedIds.has(exercise.id)), [catalogExercises, selectedIds]);
 const filteredExercises = useMemo(() => {
  const query = normalizeRoutineSearch(exerciseQuery.trim());
  return listedExercises.filter((exercise) => !query || normalizeRoutineSearch([exercise.name, exercise.muscleGroup, exercise.difficulty, exercise.category, exercise.exerciseType, exercise.isActive ? "activo" : "desactivado"].filter(Boolean).join(" ")).includes(query));
 }, [exerciseQuery, listedExercises]);
 const exerciseResults = useProgressiveResults(filteredExercises, 10);
 const inactiveSelectedCount = selectedItems.filter((item) => catalogExercises.find((exercise) => exercise.id === item.exerciseId)?.isActive === false).length;
 const configuredExerciseCount = selectedItems.filter((item) => getExerciseSetupState(item).isConfigured).length;
 const pendingExerciseCount = selectedItems.length - configuredExerciseCount;

 function updateExerciseQuery(value: string) {
  setExerciseQuery(value);
  exerciseResults.reset();
 }

 function toggleExercise(exerciseId: string) {
  const exercise = exerciseOptions.find((item) => item.id === exerciseId);
  const selectedIndex = selectedItems.findIndex((item) => item.exerciseId === exerciseId);
  if (selectedIndex >= 0) {
   fieldArray.remove(selectedIndex);
   return;
  }
  if (!exercise?.isActive || selectedIds.has(exercise.id)) return;
  fieldArray.append(toRoutineFormExercise(exercise));
 }

 async function saveRoutineValues(values: RoutineFormValues) {
  setServerMessage("");
  const result = await saveRoutine(routine?.id ?? null, values);
  if (result.status === "error") {
   setServerMessage(result.message);
   toast.error(result.message);
   return;
  }
  toast.success(result.message);
  router.push("/app/entrenamiento/rutinas");
  router.refresh();
 }

 async function onSubmit(values: RoutineFormValues) {
  if (routine) {
   setPendingUpdate(values);
   return;
  }
  await saveRoutineValues(values);
 }

 async function confirmUpdate() {
  if (pendingUpdate) await saveRoutineValues(pendingUpdate);
 }

 return {
  catalogExercises,
  configuredExerciseCount,
  exerciseQuery,
  exerciseResults,
  fieldArray,
  filteredExercises,
  form,
  inactiveSelectedCount,
  listedExercises,
  onSubmit,
  pendingExerciseCount,
  pendingUpdate,
  routine,
  selectedCategory,
  selectedIds,
  selectedItems,
  selectedTargetAudience,
  serverMessage,
  setPendingUpdate,
  toggleExercise,
  updateExerciseQuery,
  confirmUpdate,
 };
}

export type RoutineEditorViewModel = ReturnType<typeof useRoutineEditor>;
