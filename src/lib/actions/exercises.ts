"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUserAccess } from "@/lib/auth/current-user-access";
import { createClient } from "@/lib/supabase/server";
import {
 exerciseFormSchema,
 type ExerciseFormValues,
} from "@/lib/validations/exercises";

const EXERCISES_PATH = "/app/entrenamiento/ejercicios";
const ROUTINES_PATH = "/app/entrenamiento/rutinas";
const TRAINING_PATH = "/app/entrenamiento";

type ExerciseFieldErrors = Partial<
 Record<keyof ExerciseFormValues, string>
>;

export type ExerciseActionResult =
 | {
 id: string;
 message: string;
 status: "success";
 }
 | {
 fieldErrors?: ExerciseFieldErrors;
 message: string;
 status: "error";
 };

function getFieldErrors(error: {
 flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
 return Object.fromEntries(
 Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [
 field,
 messages?.[0],
 ]),
 ) as ExerciseFieldErrors;
}

async function canManageExercises() {
 const access = await getCurrentUserAccess();

 return access?.canManageTraining ? access : null;
}

function revalidateTrainingPaths() {
 revalidatePath(EXERCISES_PATH);
 revalidatePath(ROUTINES_PATH);
 revalidatePath(TRAINING_PATH);
}

export async function saveExercise(
 values: ExerciseFormValues,
): Promise<ExerciseActionResult> {
 const parsed = exerciseFormSchema.safeParse(values);

 if (!parsed.success) {
 return {
 fieldErrors: getFieldErrors(parsed.error),
 message: "Revisa los campos marcados.",
 status: "error",
 };
 }

 const access = await canManageExercises();

 if (!access) {
 return {
 message: "No tienes permisos para gestionar ejercicios.",
 status: "error",
 };
 }

 const supabase = await createClient();
 const multimediaUrls = parsed.data.multimediaUrls.filter(Boolean);
 const payload = {
 category: parsed.data.category,
 description: parsed.data.description,
 difficulty: parsed.data.difficulty,
 exercise_type: parsed.data.exerciseType,
 multimedia_url: multimediaUrls[0] ?? null,
 multimedia_urls: multimediaUrls,
 muscle_group: parsed.data.muscleGroup,
 name: parsed.data.name,
 };

 const result = parsed.data.id
 ? await supabase
 .from("exercises")
 .update(payload)
 .eq("id", parsed.data.id)
 .select("id")
 .maybeSingle()
 : await supabase
 .from("exercises")
 .insert({
 ...payload,
 created_by: access.userId,
 is_active: true,
 })
 .select("id")
 .maybeSingle();

 if (result.error || !result.data) {
 return {
 message: parsed.data.id
 ? "No se pudo actualizar el ejercicio."
 : "No se pudo crear el ejercicio.",
 status: "error",
 };
 }

 revalidateTrainingPaths();

 return {
 id: result.data.id,
 message: parsed.data.id
 ? "Ejercicio actualizado correctamente."
 : "Ejercicio creado correctamente.",
 status: "success",
 };
}

export async function setExerciseActive(
 exerciseId: string,
 isActive: boolean,
): Promise<ExerciseActionResult> {
 if (!/^[0-9a-f-]{36}$/i.test(exerciseId)) {
 return {
 message: "El ejercicio indicado no es válido.",
 status: "error",
 };
 }

 if (!(await canManageExercises())) {
 return {
 message: "No tienes permisos para gestionar ejercicios.",
 status: "error",
 };
 }

 const supabase = await createClient();
 const { data, error } = await supabase
 .from("exercises")
 .update({ is_active: isActive })
 .eq("id", exerciseId)
 .select("id")
 .maybeSingle();

 if (error || !data) {
 return {
 message: "No se pudo cambiar el estado del ejercicio.",
 status: "error",
 };
 }

 revalidateTrainingPaths();

 return {
 id: data.id,
 message: isActive ? "Ejercicio activado." : "Ejercicio desactivado.",
 status: "success",
 };
}

export async function deleteExercise(
 exerciseId: string,
): Promise<ExerciseActionResult> {
 if (!/^[0-9a-f-]{36}$/i.test(exerciseId)) {
 return {
 message: "El ejercicio indicado no es válido.",
 status: "error",
 };
 }

 if (!(await canManageExercises())) {
 return {
 message: "No tienes permisos para eliminar ejercicios.",
 status: "error",
 };
 }

 const supabase = await createClient();
 const { count, error: usageError } = await supabase
 .from("routine_exercises")
 .select("id", { count: "exact", head: true })
 .eq("exercise_id", exerciseId);

 if (usageError) {
 return {
 message: "No se pudo comprobar si el ejercicio está en uso.",
 status: "error",
 };
 }

 if ((count ?? 0) > 0) {
 return {
 message:
 "No puedes eliminar este ejercicio porque forma parte de uno o más entrenamientos. Desactívalo si ya no debe utilizarse.",
 status: "error",
 };
 }

 const { data, error } = await supabase
 .from("exercises")
 .delete()
 .eq("id", exerciseId)
 .select("id")
 .maybeSingle();

 if (error?.code === "23503") {
 return {
 message:
 "No puedes eliminar este ejercicio porque está vinculado a un entrenamiento.",
 status: "error",
 };
 }

 if (error || !data) {
 return {
 message: "No se pudo eliminar el ejercicio.",
 status: "error",
 };
 }

 revalidateTrainingPaths();

 return {
 id: data.id,
 message: "Ejercicio eliminado definitivamente.",
 status: "success",
 };
}
