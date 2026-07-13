"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
 deleteExercise,
 saveExercise,
 setExerciseActive,
} from "@/lib/actions/exercises";
import {
 exerciseCategoryOptions,
 exerciseMuscleGroupOptions,
 exerciseTypeOptions,
 resolveExerciseOption,
} from "@/lib/exercises/options";
import {
 exerciseFormSchema,
 type ExerciseFormValues,
} from "@/lib/validations/exercises";
import type { ExerciseListItem } from "@/types/exercise";

import {
 buildExerciseLibraryUrl,
 getDraftFilters,
 libraryPath,
} from "../helpers";
import type {
 ExerciseConfirmation,
 ExerciseFilterDraft,
 ExerciseManagerProps,
} from "../types";

export const exerciseDefaultValues: ExerciseFormValues = {
 category: "",
 description: "",
 difficulty: "beginner",
 exerciseType: "",
 id: "",
 multimediaUrls: [""],
 muscleGroup: "",
 name: "",
};

export function useExerciseManager({
 exercises,
 filterOptions,
 filters,
 pagination,
}: ExerciseManagerProps) {
 const router = useRouter();
 const [isPending, startTransition] = useTransition();
 const [draftFilters, setDraftFilters] = useState(() => getDraftFilters(filters));
 const [statusMessage, setStatusMessage] = useState("");
 const [confirmation, setConfirmation] =
  useState<ExerciseConfirmation | null>(null);
 const form = useForm<ExerciseFormValues>({
  defaultValues: exerciseDefaultValues,
  resolver: zodResolver(exerciseFormSchema),
 });
 const { clearErrors, control, reset, setError, setValue } = form;
 const editingId = useWatch({ control, name: "id" });
 const multimediaUrls = useWatch({ control, name: "multimediaUrls" }) ?? [""];
 const muscleGroup = useWatch({ control, name: "muscleGroup" });
 const category = useWatch({ control, name: "category" });
 const exerciseType = useWatch({ control, name: "exerciseType" });

 function updateDraftFilter(field: keyof ExerciseFilterDraft, value: string) {
  setDraftFilters((current) => ({ ...current, [field]: value }));
 }

 function applyLibraryFilters(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  startTransition(() => router.push(buildExerciseLibraryUrl(draftFilters, 1)));
 }

 function clearLibraryFilters() {
  const emptyFilters: ExerciseFilterDraft = {
   category: "all",
   difficulty: "all",
   exerciseType: "all",
   muscleGroup: "all",
   query: "",
   status: "all",
  };

  setDraftFilters(emptyFilters);
  startTransition(() => router.push(libraryPath));
 }

 function loadMoreExercises() {
  startTransition(() => {
   router.push(buildExerciseLibraryUrl(getDraftFilters(filters), pagination.page + 1));
  });
 }

 function resetForm() {
  reset(exerciseDefaultValues);
  clearErrors();
  setStatusMessage("");
 }

 function editExercise(exercise: ExerciseListItem) {
  reset({
   category: resolveExerciseOption(exercise.category, exerciseCategoryOptions),
   description: exercise.description ?? "",
   difficulty: exercise.difficulty ?? "beginner",
   exerciseType: resolveExerciseOption(exercise.exerciseType, exerciseTypeOptions),
   id: exercise.id,
   multimediaUrls: exercise.multimediaUrls.length > 0 ? exercise.multimediaUrls : [""],
   muscleGroup: resolveExerciseOption(
    exercise.muscleGroup,
    exerciseMuscleGroupOptions,
   ),
   name: exercise.name,
  });
  setStatusMessage("");
  document
   .getElementById("exercise-form")
   ?.scrollIntoView({ behavior: "smooth", block: "start" });
 }

 function addMultimediaUrl() {
  if (multimediaUrls.length >= 3) return;
  setValue("multimediaUrls", [...multimediaUrls, ""], {
   shouldDirty: true,
   shouldValidate: true,
  });
 }

 function removeMultimediaUrl(index: number) {
  const nextUrls = multimediaUrls.filter((_, urlIndex) => urlIndex !== index);
  setValue("multimediaUrls", nextUrls.length > 0 ? nextUrls : [""], {
   shouldDirty: true,
   shouldValidate: true,
  });
 }

 async function saveExerciseValues(values: ExerciseFormValues) {
  setStatusMessage("");
  clearErrors();
  const result = await saveExercise(values);

  if (result.status === "error") {
   if (result.fieldErrors) {
    Object.entries(result.fieldErrors).forEach(([field, message]) => {
     if (message) setError(field as keyof ExerciseFormValues, { message });
    });
   }
   setStatusMessage(result.message);
   toast.error(result.message);
   return;
  }

  toast.success(result.message);
  resetForm();
  router.refresh();
 }

 async function onSubmit(values: ExerciseFormValues) {
  if (values.id) {
   setConfirmation({ type: "update", values });
   return;
  }
  await saveExerciseValues(values);
 }

 async function toggleExercise(exercise: ExerciseListItem) {
  try {
   const result = await setExerciseActive(exercise.id, !exercise.isActive);
   if (result.status === "error") toast.error(result.message);
   else {
    toast.success(result.message);
    router.refresh();
   }
  } catch {
   toast.error("Ocurrió un error inesperado al cambiar el estado. Inténtalo de nuevo.");
  }
 }

 function removeExercise(exercise: ExerciseListItem) {
  setConfirmation({ exercise, type: "delete" });
 }

 async function deleteExerciseValue(exercise: ExerciseListItem) {
  try {
   const result = await deleteExercise(exercise.id);
   if (result.status === "error") toast.error(result.message);
   else {
    if (editingId === exercise.id) resetForm();
    toast.success(result.message);
    router.refresh();
   }
  } catch {
   toast.error("Ocurrió un error inesperado al eliminar el ejercicio. Inténtalo de nuevo.");
  }
 }

 async function confirmAction() {
  if (!confirmation) return;
  if (confirmation.type === "update") {
   await saveExerciseValues(confirmation.values);
   return;
  }
  if (confirmation.type === "status") {
   await toggleExercise(confirmation.exercise);
   return;
  }
  await deleteExerciseValue(confirmation.exercise);
 }

 const confirmationTitle =
  confirmation?.type === "update"
   ? "Guardar cambios del ejercicio"
   : confirmation?.type === "delete"
     ? "Eliminar ejercicio"
     : confirmation?.exercise.isActive
       ? "Desactivar ejercicio"
       : "Activar ejercicio";
 const confirmationDescription =
  confirmation?.type === "update"
   ? `Se actualizará "${confirmation.values.name}" con la información del formulario.`
   : confirmation?.type === "delete"
     ? `Se eliminará "${confirmation.exercise.name}" definitivamente. Si forma parte de un entrenamiento, la eliminación no se realizará.`
     : confirmation?.exercise.isActive
       ? `"${confirmation.exercise.name}" dejará de estar disponible para nuevos entrenamientos.`
       : confirmation
         ? `"${confirmation.exercise.name}" volverá a estar disponible para nuevos entrenamientos.`
         : "";
 const confirmationLabel =
  confirmation?.type === "update"
   ? "Guardar cambios"
   : confirmation?.type === "delete"
     ? "Eliminar ejercicio"
     : confirmation?.exercise.isActive
       ? "Desactivar"
       : "Activar";

 return {
  addMultimediaUrl,
  applyLibraryFilters,
  category,
  clearLibraryFilters,
  confirmation,
  confirmationDescription,
  confirmationLabel,
  confirmationTitle,
  confirmAction,
  draftFilters,
  editingId,
  editExercise,
  exercises,
  exerciseType,
  filterOptions,
  form,
  isPending,
  loadMoreExercises,
  multimediaUrls,
  muscleGroup,
  onSubmit,
  pagination,
  removeExercise,
  removeMultimediaUrl,
  resetForm,
  setConfirmation,
  statusMessage,
  updateDraftFilter,
 };
}

export type ExerciseManagerViewModel = ReturnType<typeof useExerciseManager>;
